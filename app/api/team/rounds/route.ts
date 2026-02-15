/**
 * GET /api/team/rounds
 *
 * Returns all rounds accessible to the team, also with:
 *  - round details (number, times, status)
 *  - whether the team has selected a subtask
 *  - whether the team has submitted work
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Team from "@/models/Team";
import Round from "@/models/Round";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";

export async function GET(request: NextRequest) {
    try {
        const { teamId } = await getTeamSession();

        await connectDB();

        const team = await Team.findById(teamId);
        if (!team) {
            return NextResponse.json(
                { error: "Team not found" },
                { status: 404 }
            );
        }

        // Get all rounds the team can access
        const rounds = await Round.find({
            _id: { $in: team.rounds_accessible },
        }).sort({ round_number: 1 });

        // Fetch selections and submissions for all accessible rounds in bulk
        const [selections, submissions] = await Promise.all([
            TeamSubtaskSelection.find({
                team_id: teamId,
                round_id: { $in: team.rounds_accessible },
            }),
            Submission.find({
                team_id: teamId,
                round_id: { $in: team.rounds_accessible },
            }),
        ]);

        // Build lookup maps for O(1) access
        const selectionByRound = new Map(
            selections.map((s: any) => [s.round_id.toString(), s])
        );
        const submissionByRound = new Map(
            submissions.map((s: any) => [s.round_id.toString(), s])
        );

        const enrichedRounds = rounds.map((round: any) => {
            const roundIdStr = round._id.toString();
            const selection = selectionByRound.get(roundIdStr);
            const submission = submissionByRound.get(roundIdStr);

            return {
                _id: round._id,
                round_number: round.round_number,
                start_time: round.start_time,
                end_time: round.end_time,
                is_active: round.is_active,
                submission_enabled: round.submission_enabled,
                has_selected: !!selection,
                selected_subtask_id: selection?.subtask_id ?? null,
                has_submitted: !!submission,
                submission_locked: submission?.is_locked ?? false,
            };
        });

        return NextResponse.json({ rounds: enrichedRounds });
    } catch (err: any) {
        if (err.status && err.error) {
            return NextResponse.json(
                { error: err.error },
                { status: err.status }
            );
        }
        console.error("GET /api/team/rounds error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}