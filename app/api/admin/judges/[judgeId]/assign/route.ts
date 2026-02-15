import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import JudgeAssignment from "@/models/JudgeAssignment";
import Judge from "@/models/Judge";
import Round from "@/models/Round";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ judgeId: string }> },
) {
  await connectDB();
  const { judgeId } = await params;

  try {
    const body = await request.json();
    const { teamIds, roundId } = body;
    // expecting { teamIds: string[], roundId?: string }

    if (!Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: "teamIds must be an array" },
        { status: 400 }
      );
    }

    // Determine roundId if not provided. logic: use active round
    let rId = roundId;
    if (!rId) {
      const activeRound = await Round.findOne({ is_active: true });
      if (activeRound) {
        rId = activeRound._id;
      } else {
        // fallback or error? For now, if no active round, we might just leave it null or error
        // Check if JudgeAssignment schema requires round_id. 
        // In models/JudgeAssignment.ts it's ref: "Round", likely optional but good to have
      }
    }

    // 1. Remove existing assignments for this judge (and round if applicable)
    // Or just overwrite? The UI seems to toggle assignment status.
    // simpler to delete all for this judge and re-create for the checked ones.
    // BUT wait, what if we only want to update? 
    // The UI sends "teamIds". It implies "these are THE teams assigned".
    // So distinct replacement is safer.

    // However, if we want to support round-based assignment, we should delete only for that round?
    // The current UI seems to be global assignment or undefined round.
    // Let's assume global for now or just wipe previous assignments.

    await JudgeAssignment.deleteMany({ judge_id: judgeId });

    // 2. Create new assignments
    if (teamIds.length > 0) {
      const assignments = teamIds.map(teamId => ({
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
