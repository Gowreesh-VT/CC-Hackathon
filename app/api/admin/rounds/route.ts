import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Round from "@/models/Round";

// GET: Fetch all rounds
export async function GET() {
  await connectDB();
  try {
    const rounds = await Round.find({}).sort({ round_number: 1 });
    return NextResponse.json(rounds);
  } catch (error) {
    console.error("Error fetching rounds:", error);
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    );
  }
}

// POST: Create a new round
export async function POST(request: Request) {
  await connectDB();
  try {
    const body = await request.json();
    const { round_number, start_time, end_time, instructions } = body;

    // specific validation can go here
    if (!round_number) {
      return NextResponse.json({ error: "Round number is required" }, { status: 400 });
    }

    const newRound = await Round.create({
      round_number,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      instructions: instructions || "",
      is_active: false,
      submission_enabled: false
    });

    return NextResponse.json(
      { message: "Round created successfully", data: newRound },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating round:", error);
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 },
    );
  }
}
