import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import Round from "@/models/Round";
import Submission from "@/models/Submission";
import Score from "@/models/Score";

export async function GET() {
  await connectDB();

  try {
    // 1. Total Teams
    const totalTeams = await Team.countDocuments({});

    // 2. Current/Active Round
    let currentRound = await Round.findOne({ is_active: true });

    // If no active round, get the upcoming one or the last ended one
    if (!currentRound) {
      // Try to find one that hasn't started yet
      currentRound = await Round.findOne({ start_time: { $gt: new Date() } }).sort({ start_time: 1 });

      // If no upcoming, get the last one
      if (!currentRound) {
        currentRound = await Round.findOne({}).sort({ end_time: -1 });
      }
    }

    let submissionsCount = 0;
    let pendingEvaluationCount = 0;
    let roundStatus = "inactive";

    if (currentRound) {
      if (currentRound.is_active) roundStatus = "active";
      else if (currentRound.end_time && new Date() > currentRound.end_time) roundStatus = "completed";
      else roundStatus = "upcoming";

      // 3. Submissions for current round
      submissionsCount = await Submission.countDocuments({ round_id: currentRound._id });

      // 4. Pending Evaluations
      // Teams that have submitted but not yet scored
      const scoredTeamIds = await Score.distinct("team_id", { round_id: currentRound._id });

      // Count submissions whose team_id is NOT in scoredTeamIds
      // const pendingCount = await Submission.countDocuments({ 
      //     round_id: currentRound._id, 
      //     team_id: { $nin: scoredTeamIds } 
      // });

      // Simple math since 1 submission per team usually
      pendingEvaluationCount = Math.max(0, submissionsCount - scoredTeamIds.length);
    }

    const stats = {
      totalTeams,
      currentRound: currentRound ? {
        id: currentRound._id,
        name: `Round ${currentRound.round_number}`,
        round_number: currentRound.round_number
      } : null,
      roundStatus,
      submissionsCount,
      pendingEvaluationCount,
    };

    return NextResponse.json(stats, { status: 200 });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
