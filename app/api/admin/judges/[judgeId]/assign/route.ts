import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import JudgeAssignment from "@/models/JudgeAssignment";
import { proxy } from "@/lib/proxy";

async function POSTHandler(
  request: NextRequest,
  context: { params: Promise<{ judgeId: string }> },
) {
  await connectDB();
  const { judgeId } = await context.params;

  try {
    const body = await request.json();
    const { teamIds, roundId } = body;

    if (!Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: "teamIds must be an array" },
        { status: 400 }
      );
    }

    let rId = roundId;
    if (!rId) {
      const Round = (await import("@/models/Round")).default;
      const activeRound = await Round.findOne({ is_active: true });
      if (activeRound) {
        rId = activeRound._id;
      }
    }

    if (!rId) {
      return NextResponse.json({ error: "Round ID is required or no active round found" }, { status: 400 });
    }

    // 1. Remove existing assignments for this judge AND this round
    if (rId) {
      await JudgeAssignment.deleteMany({ judge_id: judgeId, round_id: rId });
    } else {
      await JudgeAssignment.deleteMany({ judge_id: judgeId, round_id: null });
    }

    // 2. Create new assignments
    if (teamIds.length > 0) {
      const assignments = teamIds.map((teamId: string) => ({
        judge_id: judgeId,
        team_id: teamId,
        round_id: rId,
        assigned_at: new Date()
      }));

      await JudgeAssignment.insertMany(assignments);
    }

    return NextResponse.json({
      message: `Updated assignments for Judge ${judgeId}`,
      success: true,
      assignedCount: teamIds.length
    });

  } catch (error) {
    console.error("Error assigning teams:", error);
    return NextResponse.json(
      { error: "Failed to assign teams" },
      { status: 500 }
    );
  }
}

export const POST = proxy(POSTHandler, ["admin"]);
