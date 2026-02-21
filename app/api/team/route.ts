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
import RoundOptions from "@/models/RoundOptions";
import Submission from "@/models/Submission";
import Subtask from "@/models/Subtask";
import { proxy } from "@/lib/proxy";

async function GETHandler(request: NextRequest) {
  try {
    const { teamId } = await getTeamSession();

    await connectDB();

    const team = await Team.findById(teamId)
      .populate("rounds_accessible")
      .populate("track_id", "name");

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

    // Fetch all submissions for this team
    const submissions = await Submission.find({
      team_id: teamId,
      round_id: { $in: accessibleRoundIds },
    }).lean();

    const submissionIds = submissions.map((s) => s._id);

    // Fetch all scores across all submissions
    const allScores = await Score.find({
      submission_id: { $in: submissionIds },
    }).populate("submission_id");

    // Fetch score for the current/latest round
    let currentRoundScore = null;
    if (activeRound) {
      const currentSubmission = submissions.find(
        (s: any) => s.round_id.toString() === activeRound._id.toString(),
      );
      if (currentSubmission) {
        const scores = await Score.find({
          submission_id: currentSubmission._id,
          status: "scored",
        });
        const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
        if (scores.length > 0) {
          currentRoundScore = {
            score: totalScore,
            remarks: scores[0]?.remarks || "",
            status: "scored",
          };
        }
      }
    }

    // Calculate cumulative total score
    const totalScore = allScores.reduce((sum, scoreDoc) => {
      return sum + (scoreDoc.score || 0);
    }, 0);

    // Find the latest scored submission with remarks
    const latestScoredScore = await Score.findOne({
      submission_id: { $in: submissionIds },
      status: "scored",
    })
      .sort({ updated_at: -1 })
      .populate("submission_id");

    let latestRoundScore = null;
    if (latestScoredScore) {
      const latestSubmission = latestScoredScore.submission_id as any;
      const latestRound = await Round.findById(latestSubmission?.round_id);
      latestRoundScore = {
        round_number: latestRound?.round_number || "Unknown",
        score: latestScoredScore.score,
        remarks: latestScoredScore.remarks,
        status: latestScoredScore.status,
      };
    }

    // Fetch current round subtask selection
    let currentRoundSubtask = null;
    if (activeRound) {
      const selection = await RoundOptions.findOne({
        team_id: teamId,
        round_id: activeRound._id,
      }).populate("selected");

      if (selection && selection.selected) {
        const subtask = selection.selected as any;
        currentRoundSubtask = {
          _id: subtask._id,
          title: subtask.title,
          description: subtask.description,
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

    // Fetch all round scores (current + previous) grouped by round
    const roundScoresMap = new Map();
    for (const submission of submissions) {
      const scores = await Score.find({
        submission_id: submission._id,
        status: "scored",
      });
      const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);
      const round = await Round.findById((submission as any).round_id);
      if (round && totalScore > 0) {
        roundScoresMap.set(round.round_number, {
          round_number: round.round_number,
          score: totalScore,
          status: "scored",
          remarks: scores[0]?.remarks || "",
        });
      }
    }
    const roundScores = Array.from(roundScoresMap.values()).sort(
      (a, b) => a.round_number - b.round_number,
    );

    return NextResponse.json({
      team_name: team.team_name,
      track: (team.track_id as any)?.name || "N/A",
      track_id: (team.track_id as any)?._id?.toString() || null,
      current_round: activeRound
        ? {
            _id: activeRound._id,
            round_number: activeRound.round_number,
            start_time: activeRound.start_time,
            end_time: activeRound.end_time,
            is_active: activeRound.is_active,
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

export const GET = proxy(GETHandler, ["team"]);
