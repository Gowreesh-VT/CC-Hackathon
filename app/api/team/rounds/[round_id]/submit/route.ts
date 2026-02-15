import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Round from "@/models/Round";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";

/**
 * POST /api/team/rounds/[round_id]/submit
 *
 * Body: { file_url?: string, github_link?: string }
 *
 * Submits or re-submits work for the round.
 * Validates:
 *  - Round is active and submissions are enabled
 *  - Team has selected a subtask
 *  - Existing submission is not locked
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ round_id: string }> }
) {
    try {
        const { teamId } = await getTeamSession();
        const { round_id } = await params;
        const body = await request.json();

        const { file_url, github_link } = body;

        if (!file_url && !github_link) {
            return NextResponse.json(
                { error: "At least one of file_url or github_link is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Validate round is active and submissions are enabled
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
        if (!round.submission_enabled) {
            return NextResponse.json(
                { error: "Submissions are not enabled for this round" },
                { status: 403 }
            );
        }

        // Verify the team has selected a subtask for this round
        const selection = await TeamSubtaskSelection.findOne({
            team_id: teamId,
            round_id: round_id,
        });

        if (!selection) {
            return NextResponse.json(
                { error: "You must select a subtask before submitting" },
                { status: 400 }
            );
        }

        // Check for existing submission
        const existingSubmission = await Submission.findOne({
            team_id: teamId,
            round_id: round_id,
        });

        if (existingSubmission) {
            if (existingSubmission.is_locked) {
                return NextResponse.json(
                    { error: "Your submission is locked and cannot be changed" },
                    { status: 403 }
                );
            }

            // Re-submit: update existing submission
            existingSubmission.file_url = file_url || existingSubmission.file_url;
            existingSubmission.github_link =
                github_link || existingSubmission.github_link;
            existingSubmission.submitted_at = new Date();
            await existingSubmission.save();

            return NextResponse.json({
                message: "Submission updated successfully",
                submission: {
                    _id: existingSubmission._id,
                    file_url: existingSubmission.file_url,
                    github_link: existingSubmission.github_link,
                    submitted_at: existingSubmission.submitted_at,
                    is_locked: existingSubmission.is_locked,
                },
            });
        }

        // New submission
        const submission = await Submission.create({
            team_id: teamId,
            round_id: round_id,
            file_url: file_url || null,
            github_link: github_link || null,
        });

        return NextResponse.json(
            {
                message: "Submission created successfully",
                submission: {
                    _id: submission._id,
                    file_url: submission.file_url,
                    github_link: submission.github_link,
                    submitted_at: submission.submitted_at,
                    is_locked: submission.is_locked,
                },
            },
            { status: 201 }
        );
    } catch (err: any) {
        if (err.status && err.error) {
            return NextResponse.json(
                { error: err.error },
                { status: err.status }
            );
        }
        console.error("POST /api/team/rounds/[round_id]/submit error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}