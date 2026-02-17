/**
 * GET /api/team/dashboard
 *
 * Returns the team's dashboard info:
 *  - team_name, track
 *  - current active round (name, timer, status)
 *  - round instructions
 *  - current round subtask selection
 *  - current round submission
 *  - all scores from previous rounds
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Team from "@/models/Team";
import Round from "@/models/Round";
import Score from "@/models/Score";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";
import Subtask from "@/models/Subtask";

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await getTeamSession();

    await connectDB();

    const team = await Team.findById(teamId).populate("rounds_accessible");

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const accessibleRoundIds = team.rounds_accessible.map(
      (r: any) => r._id ?? r,
    );

    const activeRound = await Round.findOne({
      _id: { $in: accessibleRoundIds },
      is_active: true,
    });

    // Fetch score for the current/latest round
    let currentRoundScore = null;
    if (activeRound) {
      const score = await Score.findOne({
        team_id: teamId,
        round_id: activeRound._id,
      });
      currentRoundScore = score
        ? {
            score: score.score,
            remarks: score.remarks,
            status: score.status,
          }
        : null;
    }

    // Fetch all scores across all accessible rounds
    const allScores = await Score.find({
      team_id: teamId,
      round_id: { $in: accessibleRoundIds },
    });

    // Calculate cumulative total score
    const totalScore = allScores.reduce((sum, scoreDoc) => {
      return sum + (scoreDoc.score || 0);
    }, 0);

    // Find the latest scored round with remarks
    const latestScoredRound = await Score.findOne({
      team_id: teamId,
      round_id: { $in: accessibleRoundIds },
      status: "scored",
    })
      .sort({ updated_at: -1 })
      .populate("round_id", "round_number");

    let latestRoundScore = null;
    if (latestScoredRound) {
      latestRoundScore = {
        round_number:
          (latestScoredRound.round_id as any)?.round_number || "Unknown",
        score: latestScoredRound.score,
        remarks: latestScoredRound.remarks,
        status: latestScoredRound.status,
      };
    }

    // Fetch current round subtask selection
    let currentRoundSubtask = null;
    if (activeRound) {
      const selection = await TeamSubtaskSelection.findOne({
        team_id: teamId,
        round_id: activeRound._id,
      }).populate("subtask_id");

      if (selection && selection.subtask_id) {
        const subtask = selection.subtask_id as any;
        currentRoundSubtask = {
          _id: subtask._id,
          title: subtask.title,
          description: subtask.description,
          track: subtask.track,
          statement: subtask.statement,
        };
      }
    }

    // Fetch current round submission
    let currentRoundSubmission = null;
    if (activeRound) {
      const submission = await Submission.findOne({
        team_id: teamId,
        round_id: activeRound._id,
      });

      if (submission) {
        currentRoundSubmission = {
          _id: submission._id,
          file_url: submission.file_url,
          github_link: submission.github_link,
          submission_text: submission.overview,
          submitted_at: submission.submitted_at,
        };
      }
    }

    // Fetch all round scores (current + previous)
    const allRoundScores = await Score.find({
      team_id: teamId,
      round_id: { $in: accessibleRoundIds },
    })
      .populate("round_id", "round_number")
      .sort({ round_id: 1 });

    const roundScores = allRoundScores.map((score) => ({
      round_number: (score.round_id as any)?.round_number || "Unknown",
      score: score.score,
      status: score.status,
      remarks: score.remarks,
    }));

    return NextResponse.json({
      team_name: team.team_name,
      track: team.track,
      current_round: activeRound
        ? {
            _id: activeRound._id,
            round_number: activeRound.round_number,
            start_time: activeRound.start_time,
            end_time: activeRound.end_time,
            is_active: activeRound.is_active,
            submission_enabled: activeRound.submission_enabled,
            instructions: activeRound.instructions,
          }
        : null,
      current_round_subtask: currentRoundSubtask,
      current_round_submission: currentRoundSubmission,
      current_round_score: currentRoundScore,
      total_score: totalScore,
      latest_round_score: latestRoundScore,
      all_round_scores: roundScores,
      rounds_accessible: accessibleRoundIds,
    });

    // Caatch any errors
  } catch (err: any) {
    if (err.status && err.error) {
      return NextResponse.json({ error: err.error }, { status: err.status });
    }
    console.error("GET /api/team/dashboard error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
