import { NextResponse, NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

async function POSTHandler(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await context.params;

  return NextResponse.json({
    message: `Team ${teamId} has been shortlisted for the next round.`,
    newStatus: "qualified",
  });
}

export const POST = proxy(POSTHandler, ["admin"]);
