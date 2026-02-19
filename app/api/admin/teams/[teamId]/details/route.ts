import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import Round from "@/models/Round";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import { proxy } from "@/lib/proxy";

async function GETHandler(
    request: NextRequest,
    context: { params: Promise<{ teamId: string }> }
) {
    await connectDB();
    const { teamId } = await context.params;

    try {
        const team = await Team.findById(teamId).lean();
        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        // Initialize history array
        const history = [];

        // Fetch all rounds to iterate and build history
        // We assume rounds are sequential or we just show history for rounds team engaged with?
        // Better to show all rounds to see progression
        const rounds = await Round.find({}).sort({ round_number: 1 }).lean();

        // Fetch all related data for this team
        const selections = await TeamSubtaskSelection.find({ team_id: teamId }).populate("subtask_id").lean();
        const submissions = await Submission.find({ team_id: teamId }).lean();
        const scores = await Score.find({ team_id: teamId }).lean();

        for (const round of rounds) {
            const roundIdStr = round._id.toString();

            // Find selection for this round
            const selection = selections.find((s: any) => s.round_id.toString() === roundIdStr);
            // Find submission for this round
            const submission = submissions.find((s: any) => s.round_id.toString() === roundIdStr);
            // Find score for this round
            const score = scores.find((s: any) => s.round_id.toString() === roundIdStr);

            history.push({
                round_id: round._id,
                round_number: round.round_number,
                round_name: `Round ${round.round_number}`, // or round.name if exists
                selection: selection ? (selection.subtask_id as any)?.title || "Unknown" : null,
                submission_file: submission?.file_url || null,
                github_link: submission?.github_link || null,
                submitted_at: submission?.submitted_at || null,
                score: score?.score || null,
                remarks: score?.remarks || null,
                status: submission ? "Submitted" : (round.is_active ? "Active" : "Pending") // Simplified status
            });
        }

        return NextResponse.json({
            team: {
                id: team._id,
                name: team.team_name,
                track: team.track,
                isLocked: team.is_locked,
                isShortlisted: team.is_shortlisted,
                isEliminated: team.is_eliminated,
            },
            history
        });

    } catch (error) {
        console.error("Error fetching team details:", error);
        return NextResponse.json({ error: "Failed to fetch details" }, { status: 500 });
    }
}

export const GET = proxy(GETHandler, ["admin"]);
