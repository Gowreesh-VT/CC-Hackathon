import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Judge from "@/models/Judge";
import JudgeAssignment from "@/models/JudgeAssignment";
import { proxy } from "@/lib/proxy";

// GET: Fetch all judge assignments
async function GETHandler(request: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get("round_id");

    if (roundId) {
      const assignments = await JudgeAssignment.find({ round_id: roundId })
        .populate({
          path: "judge_id",
          populate: [
            { path: "user_id", select: "email" },
            { path: "track_id", select: "name" },
          ],
        })
        .populate("team_ids", "team_name")
        .lean();

      const assignmentData = assignments.flatMap((assignment: any) => {
        const judge = assignment.judge_id;
        return (assignment.team_ids || []).map((team: any) => ({
          judgeId: judge?._id?.toString(),
          judges_email: judge?.user_id?.email,
          judge_name: judge?.judge_name,
          teamId: team._id.toString(),
          teamName: team.team_name,
          track: judge?.track_id?.name,
          round_id: roundId,
        }));
      });

      const assignedTeamIds = [...new Set(assignmentData.map((a) => a.teamId))];

      return NextResponse.json({
        assignments: assignmentData,
        assignedTeamIds,
        judges: assignments.map((a: any) => ({
          id: a.judge_id?._id?.toString(),
          judge_name: a.judge_id?.judge_name,
          email: a.judge_id?.user_id?.email,
          track: a.judge_id?.track_id?.name,
          teams_count: (a.team_ids || []).length,
          round_id: roundId,
        })),
      });
    }

    // Backward-compatible global assignment view
    const judges = await Judge.find()
      .populate("user_id", "email")
      .populate("teams_assigned", "team_name")
      .populate("track_id", "name")
      .lean();

    // Map to a more useful format
    const assignmentData = judges.flatMap((judge: any) => {
      return (judge.teams_assigned || []).map((team: any) => ({
        judgeId: judge._id.toString(),
        judges_email: judge.user_id?.email,
        judge_name: judge.judge_name,
        teamId: team._id.toString(),
        teamName: team.team_name,
        track: judge.track_id?.name,
      }));
    });

    // Get list of all assigned team IDs
    const assignedTeamIds = [...new Set(assignmentData.map((a) => a.teamId))];

    return NextResponse.json({
      assignments: assignmentData,
      assignedTeamIds,
      judges: judges.map((j: any) => ({
        id: j._id.toString(),
        judge_name: j.judge_name,
        email: j.user_id?.email,
        track: j.track_id?.name,
        teams_count: (j.teams_assigned || []).length,
      })),
    });
  } catch (error) {
    console.error("Error fetching judge assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch judge assignments" },
      { status: 500 },
    );
  }
}

export const GET = proxy(GETHandler, ["admin"]);

// POST: Create/update judge assignments for teams
async function POSTHandler(request: NextRequest) {
  await connectDB();

  try {
    const body = await request.json();
    const { judgeId, teamIds, roundId } = body ?? {};

    if (!judgeId || !roundId || !Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: "judgeId, roundId and teamIds[] are required" },
        { status: 400 },
      );
    }

    const judge = await Judge.findById(judgeId);
    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    const uniqueTeamIds = [...new Set(teamIds.map((id: string) => id.toString()))];
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
      message: "Judge assignments updated successfully",
      judgeId,
      assignedCount: uniqueTeamIds.length,
      roundId,
    });
  } catch (error) {
    console.error("Error creating judge assignments:", error);
    return NextResponse.json(
      { error: "Failed to create judge assignments" },
      { status: 500 },
    );
  }
}

export const POST = proxy(POSTHandler, ["admin"]);
