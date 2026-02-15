import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Subtask from "@/models/Subtask";
import TeamSubtaskDisplay from "@/models/TeamSubtaskDisplay";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";

/**
 * GET /api/team/rounds/[round_id]/subtasks/random
 *
 * Returns 2 random subtasks for the team in this round.
 * Idempotent: if the team already has subtasks shown, return those same ones.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ round_id: string }> }
) {
    try {
        const { teamId } = await getTeamSession();
        const { round_id } = await params;

        await connectDB();

        // Check if subtasks were already shown to this team for this round
        const existingDisplays = await TeamSubtaskDisplay.find({
            team_id: teamId,
            round_id: round_id,
        }).populate("subtask_id");

        if (existingDisplays.length > 0) {
            // Already shown — return the same subtasks
            const subtasks = existingDisplays.map((d: any) => d.subtask_id);

            // Check if team already selected one
            const selection = await TeamSubtaskSelection.findOne({
                team_id: teamId,
                round_id: round_id,
            });

            return NextResponse.json({
                subtasks,
                selected_subtask_id: selection?.subtask_id ?? null,
            });
        }

        // Pick 2 random active subtasks for this round
        const randomSubtasks = await Subtask.aggregate([
            { $match: { round_id: { $toObjectId: round_id }, is_active: true } },
            { $sample: { size: 2 } },
        ]);

        if (randomSubtasks.length === 0) {
            return NextResponse.json(
                { error: "No subtasks available for this round" },
                { status: 404 }
            );
        }

        // Record which subtasks were shown
        const displayDocs = randomSubtasks.map((subtask: any) => ({
            team_id: teamId,
            round_id: round_id,
            subtask_id: subtask._id,
        }));

        await TeamSubtaskDisplay.insertMany(displayDocs);

        return NextResponse.json({
            subtasks: randomSubtasks,
            selected_subtask_id: null,
        });
    } catch (err: any) {
        if (err.status && err.error) {
            return NextResponse.json(
                { error: err.error },
                { status: err.status }
            );
        }
        console.error(
            "GET /api/team/rounds/[round_id]/subtasks/random error:",
            err
        );
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}