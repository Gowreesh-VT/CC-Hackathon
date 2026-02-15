import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";

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

    try {
        const updatedTeam = await Team.findByIdAndUpdate(teamId, body, { new: true });

        if (!updatedTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Team updated",
            team: updatedTeam
        });
    } catch (error) {
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
