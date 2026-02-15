import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ judgeId: string }> },
) {
  const { judgeId } = await params;
  const body = await request.json(); // Expecting { teamId: string }

  return NextResponse.json({
    message: `Judge ${judgeId} assigned to Team ${body.teamId}`,
    success: true,
  });
}
