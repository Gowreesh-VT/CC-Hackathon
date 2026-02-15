import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Round from "@/models/Round";

// GET: Fetch a specific round
export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  await connectDB();
  const { roundId } = await params;
  try {
    const round = await Round.findById(roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }
    return NextResponse.json(round);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch round" }, { status: 500 });
  }
}

// PATCH: Handle actions (start, stop, toggle-submission)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;
  const body = await request.json(); // Expecting { action: "start" | "stop" | "toggle" }

  try {
    const round = await Round.findById(roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    if (body.action === "start") {
      round.is_active = true;
    } else if (body.action === "stop") {
      round.is_active = false;
    } else if (body.action === "toggle") {
      round.submission_enabled = !round.submission_enabled;
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await round.save();

    return NextResponse.json({
      message: `Round updated: ${body.action} successful`,
      round,
      status: "updated",
    });

  } catch (error) {
    console.error("Error updating round status:", error);
    return NextResponse.json({ error: "Failed to update round" }, { status: 500 });
  }
}

// PUT: Update round details (instructions, timed, etc)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const body = await request.json();
    const { instructions, start_time, end_time, round_number } = body;

    const updatedRound = await Round.findByIdAndUpdate(
      roundId,
      {
        instructions,
        start_time: start_time ? new Date(start_time) : undefined,
        end_time: end_time ? new Date(end_time) : undefined,
        round_number // Optional if we allow reordering
      },
      { new: true }
    );

    if (!updatedRound) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Round details updated",
      round: updatedRound
    });

  } catch (error) {
    console.error("Error updating round details:", error);
    return NextResponse.json({ error: "Failed to update round details" }, { status: 500 });
  }
}

// DELETE: Delete a round
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const deletedRound = await Round.findByIdAndDelete(roundId);
    if (!deletedRound) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Round deleted successfully" });
  } catch (error) {
    console.error("Error deleting round:", error);
    return NextResponse.json({ error: "Failed to delete round" }, { status: 500 });
  }
}
