import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Pairing from "@/models/Pairing";
import Round from "@/models/Round";
import RoundOptions from "@/models/RoundOptions";
import Subtask from "@/models/Subtask";
import { resolvePriorityTeam } from "@/lib/pairing";
import { isRound3 } from "@/lib/roundPolicy";
import { proxy } from "@/lib/proxy";
import Team from "@/models/Team";

type PairAllocation = { pairId: string; subtaskIds: string[] };

async function POSTHandler(
  req: NextRequest,
  context: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await context.params;
  const body = await req.json().catch(() => ({}));
  const allocations: PairAllocation[] = body?.allocations || [];

  const round = await Round.findById(roundId).select("round_number").lean();
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }
  if (!isRound3((round as any).round_number)) {
    return NextResponse.json(
      { error: "Pair allocation is available only for Round 3" },
      { status: 400 },
    );
  }

  if (!Array.isArray(allocations) || allocations.length === 0) {
    return NextResponse.json(
      { error: "allocations must be a non-empty array" },
      { status: 400 },
    );
  }

  const round2 = await Round.findOne({ round_number: 2 }).select("_id").lean();
  if (!round2) {
    return NextResponse.json({ error: "Round 2 not found" }, { status: 404 });
  }

  for (const allocation of allocations) {
    const pair = await Pairing.findById(allocation.pairId).lean();
    if (!pair) {
      return NextResponse.json(
        { error: `Pair not found: ${allocation.pairId}` },
        { status: 404 },
      );
    }

    if (pair.round_anchor_id.toString() !== (round2 as any)._id.toString()) {
      return NextResponse.json(
        { error: "Pair must belong to Round 2 anchor set" },
        { status: 400 },
      );
    }

    const [teamA, teamB] = await Promise.all([
      Team.findById(pair.team_a_id).select("rounds_accessible track_id").lean(),
      Team.findById(pair.team_b_id).select("rounds_accessible track_id").lean(),
    ]);
    const teamAInRound3 = !!teamA?.rounds_accessible?.some(
      (rid: any) => rid.toString() === roundId,
    );
    const teamBInRound3 = !!teamB?.rounds_accessible?.some(
      (rid: any) => rid.toString() === roundId,
    );
    if (!teamAInRound3 || !teamBInRound3) {
      await Team.updateMany(
        { _id: { $in: [pair.team_a_id, pair.team_b_id] } },
        { $addToSet: { rounds_accessible: roundId } },
      );
    }

    const teamATrackId = teamA?.track_id?.toString();
    const teamBTrackId = teamB?.track_id?.toString();
    if (!teamATrackId || !teamBTrackId || teamATrackId !== teamBTrackId) {
      return NextResponse.json(
        { error: "Paired teams must belong to the same track" },
        { status: 400 },
      );
    }

    let effectivePairTrackId = pair.track_id?.toString();
    if (effectivePairTrackId !== teamATrackId) {
      await Pairing.updateOne(
        { _id: pair._id },
        { $set: { track_id: teamATrackId } },
      );
      effectivePairTrackId = teamATrackId;
    }

    const normalized = [...new Set(allocation.subtaskIds || [])];
    if (normalized.length !== 2) {
      return NextResponse.json(
        { error: "Each pair must have exactly 2 unique subtasks" },
        { status: 400 },
      );
    }

    const subtasks = await Subtask.find({
      _id: { $in: normalized },
      track_id: effectivePairTrackId,
    })
      .select("_id")
      .lean();
    if (subtasks.length !== 2) {
      return NextResponse.json(
        { error: "Both subtasks must belong to the pair's track" },
        { status: 400 },
      );
    }

    const priority = await resolvePriorityTeam(
      pair.team_a_id.toString(),
      pair.team_b_id.toString(),
    );

    const commonUpdate = {
      options: normalized,
      selected: null,
      selected_at: null,
      assignment_mode: "pair" as const,
      pair_id: pair._id,
      priority_team_id: priority.priorityTeamId,
      paired_team_id: priority.pairedTeamId,
      published_at: new Date(),
      auto_assigned: false,
    };

    await Promise.all([
      RoundOptions.findOneAndUpdate(
        { team_id: pair.team_a_id, round_id: roundId },
        { $set: { team_id: pair.team_a_id, round_id: roundId, ...commonUpdate } },
        { upsert: true, new: true },
      ),
      RoundOptions.findOneAndUpdate(
        { team_id: pair.team_b_id, round_id: roundId },
        { $set: { team_id: pair.team_b_id, round_id: roundId, ...commonUpdate } },
        { upsert: true, new: true },
      ),
    ]);
  }

  return NextResponse.json({
    message: "Pair subtask options allocated successfully",
    count: allocations.length,
  });
}

export const POST = proxy(POSTHandler, ["admin"]);
