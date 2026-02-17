import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Subtask from "@/models/Subtask";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const subtasks = await Subtask.find({ round_id: roundId }).sort({
      created_at: -1,
    });
    return NextResponse.json(subtasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch subtasks" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const body = await request.json();
    const subtask = await Subtask.create({
      ...body,
      round_id: roundId,
    });
    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create subtask" },
      { status: 500 },
    );
  }
}
