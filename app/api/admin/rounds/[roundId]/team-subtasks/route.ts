import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import TeamSubtaskDisplay from "@/models/TeamSubtaskDisplay";

// GET: Fetch assigned subtasks (two) per team for a round
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const displays = await TeamSubtaskDisplay.find({
      round_id: roundId,
    }).lean();

    const assignmentMap = new Map<string, string[]>();
    displays.forEach((display: any) => {
      const teamId = display.team_id.toString();
      const subtaskId = display.subtask_id.toString();
      const existing = assignmentMap.get(teamId) || [];
      assignmentMap.set(teamId, [...existing, subtaskId]);
    });

    const assignments = Array.from(assignmentMap.entries()).map(
      ([teamId, subtaskIds]) => ({ teamId, subtaskIds }),
    );

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("Error fetching team subtasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch team subtasks" },
      { status: 500 },
    );
  }
}

// POST: Update assigned subtasks (two) per team for a round
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const body = await request.json();
    const assignments: { teamId: string; subtaskIds: string[] }[] =
      body.assignments || [];

    for (const assignment of assignments) {
      const subtaskIds = (assignment.subtaskIds || []).filter(Boolean);

      await TeamSubtaskDisplay.deleteMany({
        round_id: roundId,
        team_id: assignment.teamId,
      });

      if (subtaskIds.length > 0) {
        await TeamSubtaskDisplay.insertMany(
          subtaskIds.slice(0, 2).map((subtaskId) => ({
            round_id: roundId,
            team_id: assignment.teamId,
            subtask_id: subtaskId,
          })),
        );
      }
    }

    return NextResponse.json({ message: "Team subtasks updated" });
  } catch (error) {
    console.error("Error updating team subtasks:", error);
    return NextResponse.json(
      { error: "Failed to update team subtasks" },
      { status: 500 },
    );
  }
}
