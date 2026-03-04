import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Judge from "@/models/Judge";
import JudgeAssignment from "@/models/JudgeAssignment";
import Team from "@/models/Team";
import { proxy } from "@/lib/proxy";
import mongoose from "mongoose";

async function POSTHandler(
  request: NextRequest,
  context: { params: Promise<{ judgeId: string }> },
) {
  await connectDB();
  const { judgeId } = await context.params;

  if (!mongoose.isValidObjectId(judgeId)) {
    return NextResponse.json({ error: "Invalid judgeId" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { teamIds, roundId } = body;

    if (roundId && !mongoose.isValidObjectId(roundId)) {
      return NextResponse.json({ error: "Invalid roundId" }, { status: 400 });
    }

    if (!Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: "teamIds must be an array" },
        { status: 400 },
      );
    }

    const uniqueTeamIds = [...new Set(teamIds.map((id: string) => id.toString()))];
    const judge = await Judge.findById(judgeId).select("track_id").lean();
    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    if (uniqueTeamIds.length > 0) {
      const validCount = await Team.countDocuments({
        _id: { $in: uniqueTeamIds },
        track_id: (judge as any).track_id,
      });
      if (validCount !== uniqueTeamIds.length) {
        return NextResponse.json(
          { error: "All assigned teams must belong to the judge's track" },
          { status: 400 },
        );
      }
    }

    if (roundId) {
      await JudgeAssignment.findOneAndUpdate(
        { judge_id: judgeId, round_id: roundId },
        {
          judge_id: judgeId,
          round_id: roundId,
          team_ids: uniqueTeamIds,
          updated_at: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      return NextResponse.json({
        message: `Updated round assignments for Judge ${judgeId}`,
        success: true,
        mode: "round",
        roundId,
        assignedCount: uniqueTeamIds.length,
      });
    }

    // Backward-compatible global assignment path.
    await Judge.updateOne({ _id: judgeId }, { teams_assigned: uniqueTeamIds });

    return NextResponse.json({
      message: `Updated global assignments for Judge ${judgeId}`,
      success: true,
      mode: "global",
      assignedCount: uniqueTeamIds.length,
    });
  } catch (error) {
    console.error("Error assigning teams:", error);
    return NextResponse.json(
      { error: "Failed to assign teams" },
      { status: 500 },
    );
  }
}

export const POST = proxy(POSTHandler, ["admin"]);
