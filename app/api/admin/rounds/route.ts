import { NextResponse } from "next/server";

//This handles GET to list rounds and POST to create a new round


// GET: Fetch all rounds
export async function GET() {
  // TODO: Replace this with real database query later
  const rounds = [
    { id: "1", name: "Round 1: Ideation", status: "completed" },
    { id: "2", name: "Round 2: Prototype", status: "active" },
    { id: "3", name: "Round 3: Final Pitch", status: "pending" },
  ];

  return NextResponse.json(rounds);
}

// POST: Create a new round
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // TODO: Insert into database here
    console.log("Creating round:", name);

    return NextResponse.json(
      { message: "Round created successfully", data: { name, description } },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 },
    );
  }
}
