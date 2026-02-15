import { NextResponse } from "next/server";

// GET: List all teams
export async function GET() {
  const dummyTeams = [
    { id: "t1", name: "Code Warriors", members: ["Alice", "Bob"], round: 1 },
    { id: "t2", name: "Null Pointers", members: ["Charlie", "Dave"], round: 2 },
  ];
  return NextResponse.json(dummyTeams);
}

// POST: Add a new team
export async function POST(request: Request) {
  const body = await request.json();
  // Simulate adding a team
  return NextResponse.json(
    { message: "Team added successfully", team: { id: "t3", ...body } },
    { status: 201 },
  );
}
