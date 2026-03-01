/**
 * GET /api/team
 *
 * Returns the team's dashboard info:
 *  - team_name, track
 *  - current active round (name, timer, status)
 *  - round instructions
 *  - current round subtask selection
 *  - current round submission
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Team from "@/models/Team";
import Round from "@/models/Round";
import RoundOptions from "@/models/RoundOptions";
import "@/models/Subtask";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import Judge from "@/models/Judge";
import "@/models/Track";
import { proxy } from "@/lib/proxy";
import { getEffectiveAccessibleRoundIds } from "@/lib/roundPolicy";
import Pairing from "@/models/Pairing";

export const dynamic = "force-dynamic";

async function GETHandler(request: NextRequest) {
  try {
    const { teamId } = await getTeamSession();

    await connectDB();

    const team = await Team.findById(teamId)
      .populate("rounds_accessible")
      .populate("track_id", "name");

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const allRounds = await Round.find({})
      .select("_id round_number is_active start_time end_time instructions")
      .sort({ round_number: 1 })
      .lean();

    const effectiveAccessibleRoundIds = getEffectiveAccessibleRoundIds(
      team as any,
      allRounds as any[],
    );

    // Prefer currently active accessible round; fallback to latest accessible round.
    // This keeps dashboard consistent with the Rounds page visibility.
    const accessibleRounds = allRounds.filter((r: any) =>
      effectiveAccessibleRoundIds.has(r._id.toString()),
    );
    const activeAccessibleRound = accessibleRounds.find((r: any) => r.is_active);
    const latestAccessibleRound = [...accessibleRounds].sort(
      (a: any, b: any) => (b.round_number || 0) - (a.round_number || 0),
    )[0];
    const activeRound = activeAccessibleRound || latestAccessibleRound || null;

    // Fetch all submissions for this team (all rounds)
    const submissions = await Submission.find({
      team_id: teamId,
    })
      .sort({ submitted_at: -1 })
      .lean();

    // Group submissions by round (sorted latest first from query above)
    const submissionsByRound = new Map<string, any[]>();
    submissions.forEach((sub: any) => {
      const roundId = sub.round_id.toString();
      if (!submissionsByRound.has(roundId)) {
        submissionsByRound.set(roundId, []);
      }
      submissionsByRound.get(roundId)!.push(sub);
    });

    // Team score aggregation intentionally hidden from team API response.
    // Keep score visibility restricted to judge/admin flows.

    // Fetch current round subtask selection
    let currentRoundSubtask = null;
    if (activeRound) {
      const selection = await RoundOptions.findOne({
        team_id: teamId,
        round_id: activeRound._id,
      }).populate("selected");

      if (selection && selection.selected) {
        const subtask = selection.selected as any;
        currentRoundSubtask = {
          _id: subtask._id,
          title: subtask.title,
          description: subtask.description,
        };
      }
    }

    // Fetch current round submission
    let currentRoundSubmission = null;
    let currentRoundRemarks: Array<{
      judge_name: string;
      remark: string;
      updated_at: Date | null;
    }> = [];
    if (activeRound) {
      const submission = await Submission.findOne({
        team_id: teamId,
        round_id: activeRound._id,
      });

      if (submission) {
        currentRoundSubmission = {
          _id: submission._id,
          file_url: submission.file_url,
          github_link: submission.github_link,
          submission_text: submission.overview,
          submitted_at: submission.submitted_at,
        };

        const remarkScores = await Score.find({
          submission_id: submission._id,
          remarks: { $exists: true, $ne: "" },
        })
          .sort({ updated_at: -1 })
          .populate({
            path: "judge_id",
            model: Judge,
            select: "judge_name",
          })
          .lean();

        currentRoundRemarks = remarkScores
          .map((scoreDoc: any) => ({
            judge_name: (scoreDoc.judge_id as any)?.judge_name || "Judge",
            remark: scoreDoc.remarks,
            updated_at: scoreDoc.updated_at || null,
          }))
          .filter((entry) => !!entry.remark);
      }
    }

    let pairInfo: { pair_id: string; pair_team_id: string; pair_team_name: string } | null = null;
    const round2 = allRounds.find((r: any) => r.round_number === 2);
    if (round2?._id) {
      const pair = await Pairing.findOne({
        round_anchor_id: round2._id,
        $or: [{ team_a_id: teamId }, { team_b_id: teamId }],
      })
        .populate("team_a_id", "team_name")
        .populate("team_b_id", "team_name")
        .lean();

      if (pair) {
        const isTeamA = pair.team_a_id?._id?.toString() === teamId.toString();
        const partnerTeam = isTeamA ? pair.team_b_id : pair.team_a_id;
        if (partnerTeam?._id) {
          pairInfo = {
            pair_id: pair._id.toString(),
            pair_team_id: partnerTeam._id.toString(),
            pair_team_name: partnerTeam.team_name || "N/A",
          };
        }
      }
    }

    return NextResponse.json({
      team_name: team.team_name,
      track: (team.track_id as any)?.name || "N/A",
      track_id: (team.track_id as any)?._id?.toString() || null,
      current_round: activeRound
        ? {
            _id: activeRound._id,
            round_number: activeRound.round_number,
            start_time: activeRound.start_time,
            end_time: activeRound.end_time,
            is_active: activeRound.is_active,
            instructions: activeRound.instructions,
          }
        : null,
      current_round_subtask: currentRoundSubtask,
      current_round_submission: currentRoundSubmission,
      current_round_remarks: currentRoundRemarks,
      pair_info: pairInfo,
      // total_score: totalScore,
      // latest_round_score: latestRoundScore,
      // all_round_scores: allRoundScores,
      rounds_accessible: Array.from(effectiveAccessibleRoundIds),
    });

    // Caatch any errors
  } catch (err: any) {
    if (err.status && err.error) {
      return NextResponse.json({ error: err.error }, { status: err.status });
    }
    console.error("GET /api/team/dashboard error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const GET = proxy(GETHandler, ["team"]);
