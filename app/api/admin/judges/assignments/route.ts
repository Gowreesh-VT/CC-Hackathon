import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import JudgeAssignment from "@/models/JudgeAssignment";

// GET: Fetch all judge assignments for a specific round
export async function GET(request: Request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get("round_id");

    if (!roundId) {
      return NextResponse.json(
        { error: "round_id is required" },
        { status: 400 },
      );
    }

    // Fetch all judge assignments for this round
    const assignments = await JudgeAssignment.find({
      round_id: roundId,
    })
      .populate("judge_id", "_id name")
      .populate("team_id", "_id name")
      .lean();

    // Map to a more useful format
    const assignmentData = assignments.map((a: any) => ({
      judgeId: a.judge_id._id.toString(),
      judgeName: a.judge_id.name,
      teamId: a.team_id._id.toString(),
      teamName: a.team_id.name,
      roundId: a.round_id.toString(),
      assignedAt: a.assigned_at,
    }));

    // Get list of all teams already assigned in this round
    const assignedTeamIds = [...new Set(assignmentData.map((a) => a.teamId))];

    return NextResponse.json({
      assignments: assignmentData,
      assignedTeamIds,
    });
  } catch (error) {
    console.error("Error fetching judge assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch judge assignments" },
      { status: 500 },
    );
  }
}
