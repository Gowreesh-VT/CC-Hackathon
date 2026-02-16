import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import User from "@/models/User";
import Round from "@/models/Round";
import Submission from "@/models/Submission";

export const dynamic = 'force-dynamic';

// GET: List all teams with details
export async function GET() {
  await connectDB();

  try {
    const teams = await Team.find({})
      .populate({ path: "rounds_accessible", model: Round, select: "round_number title is_active" })
      .lean();

    // Fetch active round
    const activeRound = await Round.findOne({ is_active: true }).lean();

    // Create a map of teamId -> boolean (submitted or not for active round)
    const submissionMap = new Set();
    if (activeRound) {
      try {
        const submissions = await Submission.find({ round_id: activeRound._id }, 'team_id').lean();
        submissions.forEach((s: any) => {
          if (s.team_id) submissionMap.add(s.team_id.toString());
        });
      } catch (err) {
        console.error("Error fetching submissions for active round:", err);
      }
    }

    // Fetch scores for the active round
    const scoreMap = new Map();
    if (activeRound) {
      try {
        const Score = (await import("@/models/Score")).default;
        const scores = await Score.find({ round_id: activeRound._id }).lean();
        scores.forEach((s: any) => {
          // Aggregate score if multiple judges? Or just take the average?
          // For now, let's assume one score per team per round or just show the total if stored.
          // Model Check: Score model likely has 'score' field.
          // If multiple judges assign scores, we might want to average them.
          // But let's check if Score is unique per team/round or per judge.
          // Usually it is per judge.

          // LET'S ASSUME SIMPLEST CASE FIRST: Sum of all scores for that round? 
          // Or if we want to show "Judge A: 10, Judge B: 20", that's too complex for a table.

          // Let's store an array or sum.
          const teamId = s.team_id.toString();
          const currentScore = scoreMap.get(teamId) || 0;
          scoreMap.set(teamId, currentScore + (s.score || 0));
          // NOTE: This sums scores from all judges for this round.
        });
      } catch (err) {
        console.error("Error fetching scores:", err);
      }
    }

    const formattedTeams = teams.map((team) => {
      const roundsAccessible = (team.rounds_accessible || []) as any[];

      // Calculate effective round:
      // 1. Start with Round 1 (implicit base)
      let currentRoundNum = 1;
      let currentRoundName = "Round 1";
      let currentRoundId = null; // We might not have ID for implicit Round 1 if not fetched

      // 2. Check max accessible round
      if (roundsAccessible.length > 0) {
        // Sort to find max
        const sorted = [...roundsAccessible].sort((a: any, b: any) => b.round_number - a.round_number);
        const maxRound = sorted[0];

        if (maxRound && maxRound.round_number > 1) {
          currentRoundNum = maxRound.round_number;
          currentRoundName = `Round ${maxRound.round_number}`;
          currentRoundId = maxRound._id.toString();
        }
      }

      // 3. If global active round is LOWER than their max (e.g. backtracking?), arguably they are still "in" the higher round contextually?
      // But usually active round matches max logic.
      // If team has R1, and Active is R2. Team max is R1. Display "Round 1". CORRECT.
      // If team has R1, R2. Active is R2. Team max is R2. Display "Round 2". CORRECT.

      // Attempt to link ID if possible (for filtering etc if needed, though mostly visual)
      // If currentRoundId is null (implicit Round 1), we try to find it from activeRound if it matches
      if (!currentRoundId && activeRound && activeRound.round_number === 1) {
        currentRoundId = activeRound._id.toString();
      }

      const hasSubmitted = activeRound ? submissionMap.has(team._id.toString()) : false;
      const teamScore = scoreMap.get(team._id.toString()) ?? null;

      let status = "pending";
      if (team.is_eliminated) status = "eliminated";
      else if (team.is_shortlisted) status = "shortlisted";
      else if (team.is_locked) status = "locked";
      else if (hasSubmitted) status = "submitted";

      return {
        id: team._id.toString(),
        name: team.team_name,
        track: team.track,
        email: team.email,
        isLocked: team.is_locked,
        isShortlisted: team.is_shortlisted,
        isEliminated: team.is_eliminated,
        currentRoundId: currentRoundId,
        currentRoundName: currentRoundName,
        score: teamScore,
        submissionStatus: status
      };
    });

    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST: Add a new team (and create associated user)
export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();

    if (!body.name || !body.track || !body.email) {
      return NextResponse.json({ error: "Name, track, and email are required" }, { status: 400 });
    }

    // 0. Check for invalid or duplicate data
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser && existingUser.role !== "team") {
      return NextResponse.json({ error: "Email already registered with a different role" }, { status: 400 });
    }

    const existingTeam = await Team.findOne({ team_name: body.name });
    if (existingTeam) {
      return NextResponse.json({ error: "Team name already exists" }, { status: 400 });
    }

    // 1. Create the Team
    const newTeam = await Team.create({
      team_name: body.name,
      track: body.track,
    });

    // 2. Create or Update the User (Team Leader)
    // We upsert so if they logged in before, we just add the role and team_id
    await User.findOneAndUpdate(
      { email: body.email },
      {
        role: "team",
        team_id: newTeam._id
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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
