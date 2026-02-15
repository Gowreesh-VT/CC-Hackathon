import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  return NextResponse.json({
    message: `Team ${teamId} has been shortlisted for the next round.`,
    newStatus: "qualified",
  });
}
