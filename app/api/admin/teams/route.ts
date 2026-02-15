import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import Round from "@/models/Round"; // Import Round model to populate if needed

export const dynamic = 'force-dynamic';

// GET: List all teams with details
export async function GET() {
  await connectDB();

  try {
    const teams = await Team.find({})
      .populate("rounds_accessible") // Populate rounds if needed
      .lean();

    const formattedTeams = teams.map((team) => ({
      id: team._id.toString(),
      name: team.team_name,
      track: team.track,
      is_locked: team.is_locked,
      is_shortlisted: team.is_shortlisted,
      is_eliminated: team.is_eliminated,
      currentRoundId: team.rounds_accessible.length > 0
        ? (team.rounds_accessible[team.rounds_accessible.length - 1] as any)._id?.toString()
        : null,
      currentRoundName: team.rounds_accessible.length > 0
        ? `Round ${(team.rounds_accessible[team.rounds_accessible.length - 1] as any).round_number}`
        : null,
      score: null, // Logic for score might need calculation or fetching from another model
    }));

    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST: Add a new team (if needed manually from admin)
export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    // Basic creation logic
    const newTeam = await Team.create({
      team_name: body.name,
      track: body.track || "General",
    });
    return NextResponse.json({
      message: "Team added successfully",
      team: {
        id: newTeam._id.toString(),
        name: newTeam.team_name,
        track: newTeam.track
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
