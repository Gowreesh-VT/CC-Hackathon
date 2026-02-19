import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import User from "@/models/User";
import Round from "@/models/Round";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import { proxy } from "@/lib/proxy";

export const dynamic = "force-dynamic";

// GET: List all teams with details including scores from all rounds
async function GETHandler(req: NextRequest) {
  await connectDB();

  try {
    const teams = await Team.find({})
      .populate({
        path: "rounds_accessible",
        model: Round,
        select: "round_number title is_active",
      })
      .lean();

    // Fetch all rounds sorted by round number
    const allRounds = await Round.find({}).sort({ round_number: 1 }).lean();

    // Fetch active round
    const activeRound = await Round.findOne({ is_active: true }).lean();

    // Create a map of teamId -> boolean (submitted or not for active round)
    const submissionMap = new Set();
    if (activeRound) {
      try {
        const submissions = await Submission.find(
          { round_id: activeRound._id },
          "team_id",
        ).lean();
        submissions.forEach((s: any) => {
          if (s.team_id) submissionMap.add(s.team_id.toString());
        });
      } catch (err) {
        console.error("Error fetching submissions for active round:", err);
      }
    }

    // Fetch scores for ALL rounds
    const roundScoresMap = new Map(); // Map<teamId, Map<roundId, score>>
    try {
      const scores = await Score.find({}).lean();
      scores.forEach((s: any) => {
        const teamId = s.team_id.toString();
        const roundId = s.round_id.toString();

        if (!roundScoresMap.has(teamId)) {
          roundScoresMap.set(teamId, new Map());
        }

        const teamRoundMap = roundScoresMap.get(teamId);
        const currentScore = teamRoundMap.get(roundId) || 0;
        teamRoundMap.set(roundId, currentScore + (s.score || 0));
      });
    } catch (err) {
      console.error("Error fetching scores:", err);
    }

    // Get score for active round
    const scoreMap = new Map();
    if (activeRound) {
      try {
        const scores = await Score.find({ round_id: activeRound._id }).lean();
        scores.forEach((s: any) => {
          const teamId = s.team_id.toString();
          const currentScore = scoreMap.get(teamId) || 0;
          scoreMap.set(teamId, currentScore + (s.score || 0));
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
      let currentRoundId = null;

      // 2. Check max accessible round
      if (roundsAccessible.length > 0) {
        const sorted = [...roundsAccessible].sort(
          (a: any, b: any) => b.round_number - a.round_number,
        );
        const maxRound = sorted[0];

        if (maxRound && maxRound.round_number > 1) {
          currentRoundNum = maxRound.round_number;
          currentRoundName = `Round ${maxRound.round_number}`;
          currentRoundId = maxRound._id.toString();
        }
      }

      if (!currentRoundId && activeRound && activeRound.round_number === 1) {
        currentRoundId = activeRound._id.toString();
      }

      const hasSubmitted = activeRound
        ? submissionMap.has(team._id.toString())
        : false;
      const teamScore = scoreMap.get(team._id.toString()) ?? null;

      // Build scores for all rounds
      const roundScores = allRounds.map((round: any) => {
        const teamRoundScores = roundScoresMap.get(team._id.toString());
        const roundScore = teamRoundScores
          ? teamRoundScores.get(round._id.toString())
          : null;
        return {
          roundId: round._id.toString(),
          roundNumber: round.round_number,
          score: roundScore,
        };
      });

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
        roundScores: roundScores,
        submissionStatus: status,
      };
    });

    return NextResponse.json(formattedTeams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

export const GET = proxy(GETHandler, ["admin"]);

// POST: Add a new team (and create associated user)
async function POSTHandler(request: NextRequest) {
  await connectDB();

  try {
    const body = await request.json();

    if (!body.name || !body.track || !body.email) {
      return NextResponse.json(
        { error: "Name, track, and email are required" },
        { status: 400 },
      );
    }

    // 0. Check for invalid or duplicate data
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser && existingUser.role !== "team") {
      return NextResponse.json(
        { error: "Email already registered with a different role" },
        { status: 400 },
      );
    }

    const existingTeam = await Team.findOne({ team_name: body.name });
    if (existingTeam) {
      return NextResponse.json(
        { error: "Team name already exists" },
        { status: 400 },
      );
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
        team_id: newTeam._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json(
      {
        message: "Team added successfully",
        team: {
          id: newTeam._id.toString(),
          name: newTeam.team_name,
          track: newTeam.track,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}

export const POST = proxy(POSTHandler, ["admin"]);
