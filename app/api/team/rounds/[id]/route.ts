import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Team from "@/models/Team";
import Round from "@/models/Round";
import Subtask from "@/models/Subtask";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";
import Score from "@/models/Score";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { teamId } = await getTeamSession();

    await connectDB();

    const round = await Round.findById(id).lean();
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const selection = await TeamSubtaskSelection.findOne({
      team_id: teamId,
      round_id: id,
    }).lean();

    let subtask = null;
    let submission = null;
    let initialSubtasks: any[] = [];
    let score = null;

    if (selection) {
      if (selection.subtask_id) {
        subtask = await Subtask.findById(selection.subtask_id).lean();
      }
      submission = await Submission.findOne({
        team_id: teamId,
        round_id: id,
      }).lean();
    } else {
      // If no selection, get 2 random subtasks
      const subs = await Subtask.aggregate([
        {
          $match: {
            round_id: new mongoose.Types.ObjectId(round._id as string),
          },
        },
        { $sample: { size: 2 } },
      ]);
      initialSubtasks = subs.map((s: any) => ({
        _id: s._id,
        title: s.title,
        description: s.description,
        track: s.track,
        statement: s.statement,
      }));
    }

    // Get score if submission exists
    if (submission) {
      score = await Score.findOne({
        team_id: teamId,
        round_id: id,
      }).lean();
    }

    // Serialize data
    const responseData = {
      round: {
        _id: round._id,
        round_number: round.round_number,
        is_active: round.is_active,
        submission_enabled: round.submission_enabled,
        instructions: round.instructions,
        start_time: round.start_time,
        end_time: round.end_time,
        created_at: round.created_at,
        updated_at: round.updated_at,
      },
      selection: selection
        ? {
            _id: selection._id,
            subtask_id: selection.subtask_id,
            team_id: selection.team_id,
            round_id: selection.round_id,
          }
        : null,
      subtask: subtask
        ? {
            _id: subtask._id,
            title: subtask.title,
            description: subtask.description,
            track: subtask.track,
            statement: subtask.statement,
          }
        : null,
      submission: submission
        ? {
            _id: submission._id,
            submitted_at: submission.submitted_at,
            github_link: submission.github_link,
            file_url: submission.file_url,
            overview: submission.overview,
            submission_text: submission.submission_text,
          }
        : null,
      score: score
        ? {
            score: score.score,
            remarks: score.remarks,
            status: score.status,
          }
        : null,
      initialSubtasks,
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("GET /api/team/rounds/[id] error:", err);
    const status = err.status || 500;
    const message = err.error || "Internal Server Error";
    return NextResponse.json({ error: message }, { status });
  }
}
