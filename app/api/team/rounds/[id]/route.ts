import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";
import { getTeamSession } from "@/lib/getTeamSession";
import Team from "@/models/Team";
import Round from "@/models/Round";
import RoundOptions from "@/models/RoundOptions";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import Pairing from "@/models/Pairing";
import Subtask from "@/models/Subtask";
import { isRound3, isRound4, canAccessRound } from "@/lib/roundPolicy";
import { resolveRound3PairTimeout } from "@/lib/pairing";
import { proxy } from "@/lib/proxy";


async function GETHandler(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { teamId } = await getTeamSession();

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid round ID" }, { status: 400 });
    }

    await connectDB();

    const round = await Round.findById(id).lean();
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    // Get team with track info
    const team = await Team.findById(teamId).populate(
      "track_id",
      "name description",
    );
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const roundAccessContext = await Round.find({
      round_number: { $in: [2, 3, 4] },
    })
      .select("_id round_number")
      .lean();

    if (!canAccessRound(team, round as any, roundAccessContext as any[])) {
      return NextResponse.json(
        { error: "You do not have access to this round" },
        { status: 403 },
      );
    }

    let selection = await RoundOptions.findOne({
      team_id: teamId,
      round_id: id,
    })
      .populate("selected", "title description statement track_id")
      .populate({
        path: "selected",
        populate: {
          path: "track_id",
          select: "name description",
        },
      })
      .populate("options", "title description")
      .lean();

    if (isRound3((round as any).round_number) && selection?.assignment_mode === "pair") {
      await resolveRound3PairTimeout(id, teamId);
      selection = await RoundOptions.findOne({
        team_id: teamId,
        round_id: id,
      })
        .populate("selected", "title description statement track_id")
        .populate({
          path: "selected",
          populate: {
            path: "track_id",
            select: "name description",
          },
        })
        .populate("options", "title description")
        .lean();
    }

    let subtask = null;
    let submission = null;
    let availableOptions: any[] = [];
    let pairInfo: any = null;
    let priorityState: any = null;
    let allTrackSubtasks: any[] = [];
    let pairSubmissionHistory: any[] = [];

    if (selection) {
      // If selection exists, check if they have selected a subtask
      if (selection.selected) {
        subtask = selection.selected;
      }

      // Get available options from the options field
      if (selection.options && Array.isArray(selection.options)) {
        availableOptions = (selection.options as any[]).map((opt) => ({
          _id: opt._id,
          title: opt.title,
          description: opt.description,
        }));
      }
    }

    submission = await Submission.findOne({
      team_id: teamId,
      round_id: id,
    }).lean();

    const round2 = await Round.findOne({ round_number: 2 }).select("_id").lean();
    if (round2?._id) {
      const pair = await Pairing.findOne({
        round_anchor_id: (round2 as any)._id,
        $or: [{ team_a_id: teamId }, { team_b_id: teamId }],
      })
        .populate("team_a_id", "team_name")
        .populate("team_b_id", "team_name")
        .lean();

      if (pair) {
        const isTeamA = pair.team_a_id?._id?.toString() === teamId.toString();
        const partner = isTeamA ? pair.team_b_id : pair.team_a_id;
        pairInfo = {
          pair_id: pair._id.toString(),
          partner_team_id: partner?._id?.toString() || null,
          partner_team_name: partner?.team_name || null,
        };
      }
    }

    if (isRound3((round as any).round_number) && selection?.assignment_mode === "pair") {
      const isPriorityTeam =
        selection.priority_team_id?.toString?.() === teamId.toString();
      const prioritySelected = isPriorityTeam
        ? !!selection.selected
        : !!(await RoundOptions.findOne({
          round_id: id,
          team_id: selection.priority_team_id,
          selected: { $ne: null },
        }).select("_id").lean());
      priorityState = {
        is_priority_team: isPriorityTeam,
        priority_selected: prioritySelected,
        waiting_for_priority: !isPriorityTeam && !prioritySelected,
        auto_assigned: selection.auto_assigned || false,
      };
      if (!isPriorityTeam && !prioritySelected) {
        availableOptions = [];
      }
    }

    if (isRound4((round as any).round_number)) {
      allTrackSubtasks = await Subtask.find({ track_id: (team as any).track_id?._id || team.track_id })
        .select("_id title description statement")
        .lean();

      const round4Started =
        !!round.is_active ||
        (!!round.start_time &&
          new Date(round.start_time).getTime() <= new Date().getTime());

      if (round4Started && pairInfo?.partner_team_id) {
        const round123 = await Round.find({ round_number: { $in: [1, 2, 3] } })
          .select("_id round_number")
          .lean();
        const roundIds = round123.map((r: any) => r._id);
        const roundNumMap = new Map(
          round123.map((r: any) => [r._id.toString(), r.round_number]),
        );

        const pairSubs = await Submission.find({
          team_id: { $in: [teamId, pairInfo.partner_team_id] },
          round_id: { $in: roundIds },
        })
          .sort({ submitted_at: -1 })
          .lean();

        pairSubmissionHistory = pairSubs.map((sub: any) => ({
          id: sub._id.toString(),
          team_id: sub.team_id.toString(),
          is_current_team: sub.team_id.toString() === teamId.toString(),
          round_id: sub.round_id.toString(),
          round_number: roundNumMap.get(sub.round_id.toString()) || null,
          github_link: sub.github_link || null,
          file_url: sub.file_url || null,
          overview: sub.overview || null,
          submitted_at: sub.submitted_at,
        }));
      }
    }


    // Serialize data
    const responseData = {
      round: {
        _id: round._id,
        round_number: round.round_number,
        is_active: round.is_active,
        instructions: round.instructions,
        start_time: round.start_time,
        end_time: round.end_time,
        created_at: round.created_at,
        updated_at: round.updated_at,
      },
      team: {
        _id: team._id,
        team_name: team.team_name,
        track: (team.track_id as any)?.name || "N/A",
        track_id: (team.track_id as any)?._id?.toString() || null,
        track_description: (team.track_id as any)?.description || null,
      },
      selection: selection
        ? {
          _id: selection._id,
          selected: selection.selected,
          team_id: selection.team_id,
          round_id: selection.round_id,
          selected_at: selection.selected_at,
          assignment_mode: selection.assignment_mode || "team",
          pair_id: selection.pair_id?.toString?.() || null,
          priority_team_id: selection.priority_team_id?.toString?.() || null,
          paired_team_id: selection.paired_team_id?.toString?.() || null,
          published_at: selection.published_at || null,
          auto_assigned: selection.auto_assigned || false,
        }
        : null,
      subtask: subtask
        ? {
          _id: (subtask as any)._id,
          title: (subtask as any).title,
          description: (subtask as any).description,
          track: (subtask as any).track_id?.name || null,
          statement: (subtask as any).statement || null,
        }
        : null,
      initialSubtasks: availableOptions,
      pair_info: pairInfo,
      priority_state: priorityState,
      all_track_subtasks: allTrackSubtasks,
      pair_submission_history: pairSubmissionHistory,
      submission: submission
        ? {
          _id: submission._id,
          submitted_at: submission.submitted_at,
          github_link: submission.github_link,
          file_url: submission.file_url,
          overview: submission.overview,
          submission_text: submission.submission_text,
          submitted_by_team_id: submission.team_id,
        }
        : null,
      score: null, // Never expose score to team - only judge and admin can see scores
    };

    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error("GET /api/team/rounds/[id] error:", err);
    const status = typeof err?.status === "number" ? err.status : 500;
    const message =
      status !== 500 && err?.error ? err.error : "Internal Server Error";
    return NextResponse.json({ error: message }, { status });
  }
}

export const GET = proxy(GETHandler, ["team"]);
