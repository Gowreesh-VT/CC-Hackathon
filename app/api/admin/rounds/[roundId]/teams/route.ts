import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import Score from "@/models/Score";

// GET: Fetch teams and scores for a round, plus allowed team IDs
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const teams = await Team.find({}).lean();
    const scores = await Score.find({ round_id: roundId }).lean();

    const scoreMap = new Map<string, number | null>();
    scores.forEach((score: any) => {
      scoreMap.set(score.team_id.toString(), score.score ?? null);
    });

    const teamsWithScores = teams.map((team: any) => {
      const teamId = team._id.toString();
      return {
        id: teamId,
        name: team.team_name,
        track: team.track,
        score: scoreMap.get(teamId) ?? null,
        allowed: (team.rounds_accessible || []).some(
          (r: any) => r.toString() === roundId,
        ),
      };
    });

    const allowedTeamIds = teamsWithScores
      .filter((team) => team.allowed)
      .map((team) => team.id);

    return NextResponse.json({ teams: teamsWithScores, allowedTeamIds });
  } catch (error) {
    console.error("Error fetching round teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch round teams" },
      { status: 500 },
    );
  }
}

// POST: Update allowed teams for a round
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const body = await request.json();
    const teamIds: string[] = body.teamIds || [];

    await Team.updateMany(
      { _id: { $in: teamIds } },
      { $addToSet: { rounds_accessible: roundId } },
    );

    await Team.updateMany(
      { _id: { $nin: teamIds } },
      { $pull: { rounds_accessible: roundId } },
    );

    return NextResponse.json({
      message: "Allowed teams updated",
      allowedTeamIds: teamIds,
    });
  } catch (error) {
    console.error("Error updating round teams:", error);
    return NextResponse.json(
      { error: "Failed to update round teams" },
      { status: 500 },
    );
  }
}
