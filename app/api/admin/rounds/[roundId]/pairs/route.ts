import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";
import Pairing from "@/models/Pairing";
import Round from "@/models/Round";
import Team from "@/models/Team";
import RoundOptions from "@/models/RoundOptions";
import { isRound2 } from "@/lib/roundPolicy";
import { proxy } from "@/lib/proxy";

function invalidIdResponse(field: string) {
  return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
}

async function GETHandler(
  _req: NextRequest,
  context: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await context.params;

  if (!mongoose.isValidObjectId(roundId)) return invalidIdResponse("roundId");

  const round = await Round.findById(roundId).select("round_number").lean();
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }
  if (!isRound2((round as any).round_number)) {
    return NextResponse.json(
      { error: "Pairing is available only for Round 2" },
      { status: 400 },
    );
  }

  const shortlistedTeams = await Team.find({
    rounds_accessible: roundId,
  })
    .populate("track_id", "name")
    .select("team_name track_id")
    .lean();

  const pairs = await Pairing.find({ round_anchor_id: roundId })
    .populate("team_a_id", "team_name track_id")
    .populate("team_b_id", "team_name track_id")
    .populate("track_id", "name")
    .lean();

  const pairedTeamIds = new Set<string>();
  const paired = pairs.map((pair: any) => {
    const teamAId = pair.team_a_id?._id?.toString() || "";
    const teamBId = pair.team_b_id?._id?.toString() || "";
    if (teamAId) pairedTeamIds.add(teamAId);
    if (teamBId) pairedTeamIds.add(teamBId);
    return {
      id: pair._id.toString(),
      track: pair.track_id?.name || "Unassigned",
      track_id: pair.track_id?._id?.toString() || null,
      team_a: {
        id: teamAId,
        team_name: pair.team_a_id?.team_name || "-",
      },
      team_b: {
        id: teamBId,
        team_name: pair.team_b_id?.team_name || "-",
      },
      created_at: pair.created_at,
    };
  });

  const unpairedByTrack: Record<string, any[]> = {};
  shortlistedTeams.forEach((team: any) => {
    const teamId = team._id.toString();
    if (pairedTeamIds.has(teamId)) return;
    const trackName = team.track_id?.name || "Unassigned";
    if (!unpairedByTrack[trackName]) unpairedByTrack[trackName] = [];
    unpairedByTrack[trackName].push({
      id: teamId,
      team_name: team.team_name,
      track: trackName,
      track_id: team.track_id?._id?.toString() || null,
    });
  });

  return NextResponse.json({
    paired,
    unpaired_by_track: unpairedByTrack,
    shortlisted_count: shortlistedTeams.length,
    paired_count: paired.length,
    validation: {
      odd_shortlist_count: shortlistedTeams.length % 2 !== 0,
      unpaired_count: Object.values(unpairedByTrack).reduce(
        (sum, list) => sum + list.length,
        0,
      ),
    },
  });
}

async function POSTHandler(
  req: NextRequest,
  context: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await context.params;

  if (!mongoose.isValidObjectId(roundId)) return invalidIdResponse("roundId");

  const { teamAId, teamBId } = await req.json().catch(() => ({}));

  if (!teamAId || !teamBId) {
    return NextResponse.json(
      { error: "teamAId and teamBId are required" },
      { status: 400 },
    );
  }
  if (!mongoose.isValidObjectId(teamAId)) return invalidIdResponse("teamAId");
  if (!mongoose.isValidObjectId(teamBId)) return invalidIdResponse("teamBId");
  if (teamAId === teamBId) {
    return NextResponse.json(
      { error: "Cannot pair the same team with itself" },
      { status: 400 },
    );
  }

  const round = await Round.findById(roundId).select("round_number").lean();
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }
  if (!isRound2((round as any).round_number)) {
    return NextResponse.json(
      { error: "Pairing is available only for Round 2" },
      { status: 400 },
    );
  }

  const [teamA, teamB] = await Promise.all([
    Team.findById(teamAId).populate("track_id", "name").lean(),
    Team.findById(teamBId).populate("track_id", "name").lean(),
  ]);

  if (!teamA || !teamB) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  const isAShortlisted = (teamA.rounds_accessible || []).some(
    (id: any) => id.toString() === roundId,
  );
  const isBShortlisted = (teamB.rounds_accessible || []).some(
    (id: any) => id.toString() === roundId,
  );
  if (!isAShortlisted || !isBShortlisted) {
    return NextResponse.json(
      { error: "Both teams must be shortlisted in Round 2" },
      { status: 400 },
    );
  }

  const trackAId = (teamA.track_id as any)?._id?.toString();
  const trackBId = (teamB.track_id as any)?._id?.toString();
  if (!trackAId || !trackBId || trackAId !== trackBId) {
    return NextResponse.json(
      { error: "Pairing is allowed only within the same track" },
      { status: 400 },
    );
  }

  const sortedIds = [teamAId.toString(), teamBId.toString()].sort();
  const reverseDuplicate = await Pairing.findOne({
    round_anchor_id: roundId,
    pair_key: `${sortedIds[0]}:${sortedIds[1]}`,
  })
    .select("_id")
    .lean();
  if (reverseDuplicate) {
    return NextResponse.json(
      { error: "Pair already exists for these teams" },
      { status: 409 },
    );
  }

  try {
    const [memberA, memberB] = sortedIds;
    const pair = await Pairing.create({
      round_anchor_id: roundId,
      track_id: trackAId,
      team_a_id: teamAId,
      team_b_id: teamBId,
      team_member_ids: [memberA, memberB],
      pair_key: `${memberA}:${memberB}`,
    });

    return NextResponse.json({
      message: "Pair created successfully",
      pair_id: pair._id.toString(),
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: "One or both teams are already paired, or this pair already exists" },
        { status: 409 },
      );
    }
    console.error("Error creating pair:", error);
    return NextResponse.json({ error: "Failed to create pair" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/rounds/[roundId]/pairs
 * Body: { pairId: string }
 *
 * Deletes a pair and resets both teams' RoundOptions to a clean state.
 */
async function DELETEHandler(
  req: NextRequest,
  context: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await context.params;

  if (!mongoose.isValidObjectId(roundId)) return invalidIdResponse("roundId");

  const { pairId } = await req.json().catch(() => ({}));
  if (!pairId) {
    return NextResponse.json({ error: "pairId is required in the request body" }, { status: 400 });
  }
  if (!mongoose.isValidObjectId(pairId)) return invalidIdResponse("pairId");

  const round = await Round.findById(roundId).select("round_number").lean();
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }
  if (!isRound2((round as any).round_number)) {
    return NextResponse.json(
      { error: "Pair deletion is only available for Round 2" },
      { status: 400 },
    );
  }

  const pair = await Pairing.findOne({ _id: pairId, round_anchor_id: roundId }).lean();
  if (!pair) {
    return NextResponse.json({ error: "Pair not found" }, { status: 404 });
  }

  await Pairing.deleteOne({ _id: pairId });

  // Cascade: reset RoundOptions for both teams so no stale pair state remains
  await RoundOptions.updateMany(
    {
      round_id: roundId,
      team_id: { $in: [pair.team_a_id, pair.team_b_id] },
    },
    {
      $set: {
        assignment_mode: "team",
        pair_id: null,
        priority_team_id: null,
        paired_team_id: null,
        published_at: null,
        auto_assigned: false,
        selected: null,
        selected_at: null,
        options: [],
      },
    },
  );

  return NextResponse.json({
    message: "Pair deleted and team options reset successfully",
  });
}

export const GET = proxy(GETHandler, ["admin"]);
export const POST = proxy(POSTHandler, ["admin"]);
export const DELETE = proxy(DELETEHandler, ["admin"]);
