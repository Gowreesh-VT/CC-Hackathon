import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await params;

  const dummySubtasks = [
    { id: "st1", title: "Build a Login Page", roundId: roundId },
    { id: "st2", title: "Design Database Schema", roundId: roundId },
  ];

  return NextResponse.json(dummySubtasks);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await params;
  const body = await request.json();

  return NextResponse.json(
    {
      message: "Subtask created successfully",
      subtask: { id: "st3", roundId, ...body },
    },
    { status: 201 },
  );
}
