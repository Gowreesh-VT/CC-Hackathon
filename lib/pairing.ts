import mongoose from "mongoose";
import Round from "@/models/Round";
import RoundOptions from "@/models/RoundOptions";
import Score from "@/models/Score";
import Submission from "@/models/Submission";
import {
  resolvePriorityFromTotals,
  type TeamRoundTotals,
} from "@/lib/pairingPriority";

const ROUND3_TIMEOUT_MS = 15 * 60 * 1000;

function toObjectId(id: string | mongoose.Types.ObjectId) {
  return typeof id === "string" ? new mongoose.Types.ObjectId(id) : id;
}

export async function getRoundIdByNumber(roundNumber: number) {
  const round = await Round.findOne({ round_number: roundNumber })
    .select("_id")
    .lean();
  return round?._id ? round._id.toString() : null;
}

export async function getTeamRoundTotalScore(
  teamId: string | mongoose.Types.ObjectId,
  roundNumber: number,
): Promise<number> {
  const round = await Round.findOne({ round_number: roundNumber })
    .select("_id")
    .lean();

  if (!round?._id) return 0;

  const submissions = await Submission.find({
    team_id: toObjectId(teamId),
    round_id: round._id,
  })
    .select("_id")
    .lean();

  if (!submissions.length) return 0;

  const submissionIds = submissions.map((s: any) => s._id);
  const scores = await Score.find({
    submission_id: { $in: submissionIds },
    status: "scored",
  })
    .select("score")
    .lean();

  return scores.reduce((sum: number, s: any) => sum + Number(s.score ?? 0), 0);
}

export async function getTeamPriorityTotals(
  teamId: string | mongoose.Types.ObjectId,
): Promise<TeamRoundTotals> {
  const [round1, round2] = await Promise.all([
    getTeamRoundTotalScore(teamId, 1),
    getTeamRoundTotalScore(teamId, 2),
  ]);
  return { round1, round2, total: round1 + round2 };
}

export async function resolvePriorityTeam(
  teamAId: string | mongoose.Types.ObjectId,
  teamBId: string | mongoose.Types.ObjectId,
) {
  const [a, b] = await Promise.all([
    getTeamPriorityTotals(teamAId),
    getTeamPriorityTotals(teamBId),
  ]);

  const teamAStr = teamAId.toString();
  const teamBStr = teamBId.toString();
  const resolution = resolvePriorityFromTotals({
    teamAId: teamAStr,
    teamBId: teamBStr,
    teamATotals: a,
    teamBTotals: b,
  });
  return {
    ...resolution,
    teamATotals: a,
    teamBTotals: b,
  };
}

export async function resolveRound3PairTimeout(
  roundId: string | mongoose.Types.ObjectId,
  teamId: string | mongoose.Types.ObjectId,
) {
  const normalizedRoundId = toObjectId(roundId);
  const normalizedTeamId = toObjectId(teamId);

  const currentOption = await RoundOptions.findOne({
    round_id: normalizedRoundId,
    team_id: normalizedTeamId,
  });

  if (!currentOption || currentOption.assignment_mode !== "pair") {
    return currentOption;
  }

  const options = (currentOption.options || []).map((id: any) => id.toString());
  if (options.length < 2 || !currentOption.priority_team_id || !currentOption.paired_team_id) {
    return currentOption;
  }

  const priorityTeamId = currentOption.priority_team_id.toString();
  const pairedTeamId = currentOption.paired_team_id.toString();

  const priorityOption = await RoundOptions.findOne({
    round_id: normalizedRoundId,
    team_id: priorityTeamId,
  });

  if (!priorityOption) {
    return currentOption;
  }

  const now = Date.now();
  const timeoutReached =
    !!priorityOption.published_at &&
    now - new Date(priorityOption.published_at).getTime() >= ROUND3_TIMEOUT_MS;

  const option1 = priorityOption.options?.[0] || null;
  const option2 = priorityOption.options?.[1] || null;

  if (!priorityOption.selected && timeoutReached && option1 && option2) {
    // ATOMIC: only succeeds if priority still hasn't selected (prevents race condition)
    await RoundOptions.findOneAndUpdate(
      { round_id: normalizedRoundId, team_id: toObjectId(priorityTeamId), selected: null },
      { $set: { selected: option1, selected_at: new Date(), auto_assigned: true } },
    );
    // ATOMIC: only succeeds if paired team still hasn't selected
    await RoundOptions.findOneAndUpdate(
      { round_id: normalizedRoundId, team_id: toObjectId(pairedTeamId), selected: null },
      { $set: { selected: option2, selected_at: new Date(), auto_assigned: true } },
    );
  } else if (priorityOption.selected && option1 && option2) {
    const picked = priorityOption.selected.toString();
    const remaining = picked === option1.toString() ? option2 : option1;
    // ATOMIC: only sets if paired team still hasn't selected
    await RoundOptions.findOneAndUpdate(
      { round_id: normalizedRoundId, team_id: toObjectId(pairedTeamId), selected: null },
      { $set: { selected: remaining, selected_at: new Date(), auto_assigned: false } },
    );
  }

  return RoundOptions.findOne({
    round_id: normalizedRoundId,
    team_id: normalizedTeamId,
  });
}
