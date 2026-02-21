import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Team from "@/models/Team";
import User from "@/models/User";
import Track from "@/models/Track";
import { proxy } from "@/lib/proxy";
import { z } from "zod";

const updateTeamSchema = z.object({
  team_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  track_id: z.string().min(1).optional(),
});

// GET: Get single team with details
async function GETHandler(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  await connectDB();
  const { teamId } = await params;

  try {
    const team = await Team.findById(teamId)
      .populate("user_id", "email")
      .populate("track_id", "name")
      .populate("rounds_accessible", "round_number")
      .lean();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: team._id.toString(),
      team_name: team.team_name,
      email: (team.user_id as any)?.email || "N/A",
      track: (team.track_id as any)?.name || "N/A",
      track_id: (team.track_id as any)?._id?.toString() || null,
      rounds_accessible: (team.rounds_accessible || []).map((r: any) => ({
        id: r._id.toString(),
        round_number: r.round_number,
      })),
      created_at: team.created_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 },
    );
  }
}

export const GET = proxy(GETHandler, ["admin"]);

// PATCH: Update team
async function PATCHHandler(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  await connectDB();
  const { teamId } = await params;

  try {
    const body = await request.json();
    const validation = updateTeamSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { team_name, email, track_id } = validation.data;

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Update team_name if provided
    if (team_name) {
      // Check if team name is already taken by another team
      const existingTeam = await Team.findOne({
        team_name,
        _id: { $ne: teamId },
      });
      if (existingTeam) {
        return NextResponse.json(
          { error: "Team name already exists" },
          { status: 400 },
        );
      }
      team.team_name = team_name;
    }

    // Update track_id if provided
    if (track_id) {
      const track = await Track.findById(track_id);
      if (!track) {
        return NextResponse.json({ error: "Track not found" }, { status: 404 });
      }
      team.track_id = track_id as any;
    }

    // Update user email if provided
    if (email && team.user_id) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: team.user_id },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }

      await User.findByIdAndUpdate(team.user_id, { email });
    }

    await team.save();

    // Return updated team
    const updatedTeam = await Team.findById(teamId)
      .populate("user_id", "email")
      .populate("track_id", "name")
      .lean();

    return NextResponse.json({
      message: "Team updated successfully",
      team: {
        id: updatedTeam._id.toString(),
        team_name: updatedTeam.team_name,
        email: (updatedTeam.user_id as any)?.email || "N/A",
        track: (updatedTeam.track_id as any)?.name || "N/A",
        track_id: (updatedTeam.track_id as any)?._id?.toString() || null,
      },
    });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 },
    );
  }
}

export const PATCH = proxy(PATCHHandler, ["admin"]);

// DELETE: Remove team
async function DELETEHandler(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  await connectDB();
  const { teamId } = await params;

  try {
    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Delete team
    await Team.findByIdAndDelete(teamId);

    // Optionally delete associated user
    if (team.user_id) {
      await User.findByIdAndDelete(team.user_id);
    }

    return NextResponse.json({
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 },
    );
  }
}

export const DELETE = proxy(DELETEHandler, ["admin"]);
