import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  return NextResponse.json({
    message: `Team ${teamId} selection has been LOCKED.`,
    isLocked: true,
    timestamp: new Date().toISOString(),
  });
}
