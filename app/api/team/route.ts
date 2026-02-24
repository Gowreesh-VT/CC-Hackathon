/**
 * GET /api/team
 *
 * Returns the team's dashboard info:
 *  - team_name, track
 *  - current active round (name, timer, status)
 *  - round instructions
 *  - current round subtask selection
 *  - current round submission
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Team from "@/models/Team";
import Round from "@/models/Round";
import RoundOptions from "@/models/RoundOptions";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import Judge from "@/models/Judge";
import "@/models/Track";
import { proxy } from "@/lib/proxy";

export const dynamic = "force-dynamic";

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

    // Find the active round: for Round 1, show if active even if not yet in rounds_accessible
    // For Round 2+, require explicit access (shortlisting)
    let activeRound = await Round.findOne({
      _id: { $in: accessibleRoundIds },
      is_active: true,
    });

    // Fallback: if no accessible active round, check if Round 1 is globally active
    if (!activeRound) {
      const globalActiveRound = await Round.findOne({ is_active: true });
      if (globalActiveRound && globalActiveRound.round_number === 1) {
        activeRound = globalActiveRound;
      }
    }

    // Fetch all submissions for this team (all rounds)
    const submissions = await Submission.find({
      team_id: teamId,
    })
      .sort({ submitted_at: -1 })
      .lean();

    // Group submissions by round (sorted latest first from query above)
    const submissionsByRound = new Map<string, any[]>();
    submissions.forEach((sub: any) => {
      const roundId = sub.round_id.toString();
      if (!submissionsByRound.has(roundId)) {
        submissionsByRound.set(roundId, []);
      }
      submissionsByRound.get(roundId)!.push(sub);
    });

    // Team score aggregation intentionally hidden from team API response.
    // Keep score visibility restricted to judge/admin flows.

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
    let currentRoundRemarks: Array<{
      judge_name: string;
      remark: string;
      updated_at: Date | null;
    }> = [];
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

        const remarkScores = await Score.find({
          submission_id: submission._id,
          remarks: { $exists: true, $ne: "" },
        })
          .sort({ updated_at: -1 })
          .populate({
            path: "judge_id",
            model: Judge,
            select: "judge_name",
          })
          .lean();

        currentRoundRemarks = remarkScores
          .map((scoreDoc: any) => ({
            judge_name: (scoreDoc.judge_id as any)?.judge_name || "Judge",
            remark: scoreDoc.remarks,
            updated_at: scoreDoc.updated_at || null,
          }))
          .filter((entry) => !!entry.remark);
      }
    }

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
      current_round_remarks: currentRoundRemarks,
      // total_score: totalScore,
      // latest_round_score: latestRoundScore,
      // all_round_scores: allRoundScores,
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
