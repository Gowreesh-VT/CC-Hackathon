import { NextResponse } from "next/server";

// GET: List all judges
export async function GET() {
  const dummyJudges = [
    { id: "j1", name: "Dr. Smith", expertise: "AI/ML" },
    { id: "j2", name: "Prof. Doe", expertise: "Web Dev" },
  ];
  return NextResponse.json(dummyJudges);
}

// POST: Add a new judge
export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json(
    { message: "Judge added successfully", judge: { id: "j3", ...body } },
    { status: 201 },
  );
}
