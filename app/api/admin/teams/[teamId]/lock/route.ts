import { NextResponse, NextRequest } from "next/server";
import { proxy } from "@/lib/proxy";

async function PATCHHandler(
  request: NextRequest,
  context: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await context.params;

  return NextResponse.json({
    message: `Team ${teamId} selection has been LOCKED.`,
    isLocked: true,
    timestamp: new Date().toISOString(),
  });
}

export const PATCH = proxy(PATCHHandler, ["admin"]);
