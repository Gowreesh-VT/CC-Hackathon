/**
 * POST /api/team/rounds/[round_id]/select
 *
 * Body: { subtask_id: string }
 *
 * Locks the team's subtask choice for this round.
 * Validates:
 *  - Round is active
 *  - Subtask was one of the displayed options
 *  - Team hasn't already selected (unique index enforced)
 */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Round from "@/models/Round";
import TeamSubtaskDisplay from "@/models/TeamSubtaskDisplay";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ round_id: string }> }
) {
    try {
        const { teamId } = await getTeamSession();
        const { round_id } = await params;
        const body = await request.json();

        const { subtask_id } = body;
        if (!subtask_id) {
            return NextResponse.json(
                { error: "subtask_id is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Validate round is active
        const round = await Round.findById(round_id);
        if (!round) {
            return NextResponse.json(
                { error: "Round not found" },
                { status: 404 }
            );
        }
        if (!round.is_active) {
            return NextResponse.json(
                { error: "This round is not currently active" },
                { status: 403 }
            );
        }

        // Validate that this subtask was displayed to the team
        const wasDisplayed = await TeamSubtaskDisplay.findOne({
            team_id: teamId,
            round_id: round_id,
            subtask_id: subtask_id,
        });

        if (!wasDisplayed) {
            return NextResponse.json(
                { error: "This subtask was not shown to your team — invalid selection" },
                { status: 403 }
            );
        }

        // Insert selection — unique index on (team_id, round_id) prevents duplicates
        try {
            const selection = await TeamSubtaskSelection.create({
                team_id: teamId,
                round_id: round_id,
                subtask_id: subtask_id,
            });

            return NextResponse.json(
                {
                    message: "Subtask selected successfully",
                    selection: {
                        _id: selection._id,
                        team_id: selection.team_id,
                        round_id: selection.round_id,
                        subtask_id: selection.subtask_id,
                        selected_at: selection.selected_at,
                    },
                },
                { status: 201 }
            );
        } catch (dbErr: any) {
            // Duplicate key error (code 11000) means team already selected for this round
            if (dbErr.code === 11000) {
                return NextResponse.json(
                    { error: "Your team has already selected a subtask for this round" },
                    { status: 409 }
                );
            }
            throw dbErr;
        }
    } catch (err: any) {
        if (err.status && err.error) {
            return NextResponse.json(
                { error: err.error },
                { status: err.status }
            );
        }
        console.error("POST /api/team/rounds/[round_id]/select error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
