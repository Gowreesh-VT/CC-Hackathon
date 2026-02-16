import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import User from "@/models/User";

// GET: Get single team
export async function GET(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    await connectDB();
    const { teamId } = await params;
    try {
        const team = await Team.findById(teamId);
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
        return NextResponse.json(team);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }
}

// PATCH: Update team fields (lock, shortlist, eliminate, etc.)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    await connectDB();
    const { teamId } = await params;
    const body = await request.json();

    console.log(`[PATCH] Updating team ${teamId} with:`, body);

    try {
        // If email is provided, update the associated User
        if (body.email) {
            // Check if email is taken by another user
            const existingUser = await User.findOne({ email: body.email });
            // If user exists and it's NOT the user belonging to this team
            if (existingUser && existingUser.team_id?.toString() !== teamId) {
                return NextResponse.json({ error: "Email already in use by another user" }, { status: 400 });
            }

            // Update user email
            await User.findOneAndUpdate(
                { team_id: teamId },
                { email: body.email }
            );
        }

        // Special Logic: If shortlisting, grant access to the NEXT round
        let updateData = { ...body };

        if (body.is_shortlisted === true) {
            // 1. Find the current max round number the team has access to
            const currentTeam = await Team.findById(teamId).populate('rounds_accessible');
            const currentRounds = currentTeam.rounds_accessible || [];

            // Default to Round 0 if no rounds accessible (so next is Round 1)
            // Or usually they have access to Round 1, so max is 1. Next is 2.
            const maxRoundNum = currentRounds.reduce((max: number, r: any) =>
                Math.max(max, r.round_number || 0), 0) || (currentRounds.length > 0 ? 1 : 0);

            // 2. Find the next round
            const Round = (await import("@/models/Round")).default;
            const nextRound = await Round.findOne({ round_number: maxRoundNum + 1 });

            if (nextRound) {
                console.log(`[PATCH] Auto-promoting team ${teamId} to Round ${nextRound.round_number}`);
                // Add to rounds_accessible using $addToSet to avoid duplicates
                // affect updateData or run separate update?
                // Mongoose updateOne with $addToSet and $set can be combined.

                // We'll modify updateData to use $addToSet if possible, but findingByIdAndUpdate 
                // with mixed $set and strictly defined fields in body is tricky if body is just object.
                // Better to use a dedicated update object.

                const updateOp: any = { $set: body };
                updateOp.$addToSet = { rounds_accessible: nextRound._id };

                // Execute immediately here to return updated doc
                const updatedTeam = await Team.findByIdAndUpdate(teamId, updateOp, { new: true });

                console.log(`[PATCH] Team updated with promotion:`, updatedTeam);
                return NextResponse.json({
                    message: "Team updated and promoted",
                    team: updatedTeam
                });
            }
        }

        const updatedTeam = await Team.findByIdAndUpdate(teamId, body, { new: true });

        if (!updatedTeam) {
            console.log(`[PATCH] Team ${teamId} not found`);
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        console.log(`[PATCH] Team updated:`, updatedTeam);

        return NextResponse.json({
            message: "Team updated",
            team: updatedTeam
        });
    } catch (error) {
        console.error(`[PATCH] Error updating team ${teamId}:`, error);
        return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
    }
}

// DELETE: Remove team
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ teamId: string }> }
) {
    await connectDB();
    const { teamId } = await params;

    try {
        const deletedTeam = await Team.findByIdAndDelete(teamId);

        if (!deletedTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Team deleted"
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }
}
