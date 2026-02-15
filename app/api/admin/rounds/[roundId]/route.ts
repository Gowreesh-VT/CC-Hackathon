import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await params;
  const body = await request.json(); // Expecting { action: "start" | "stop" | "toggle" }

  let message = "";
  if (body.action === "start") message = `Round ${roundId} started.`;
  else if (body.action === "stop") message = `Round ${roundId} stopped.`;
  else if (body.action === "toggle")
    message = `Submissions for Round ${roundId} toggled.`;
  else message = "Invalid action";

  return NextResponse.json({
    message: message,
    roundId: roundId,
    status: "updated",
  });
}
