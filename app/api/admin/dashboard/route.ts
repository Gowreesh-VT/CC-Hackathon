import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Fetch real stats from database later
  const stats = {
    message: "Admin Dashboard API working",
    totalTeams: 0,
    activeRounds: 0,
    pendingSubmissions: 0,
  };

  return NextResponse.json(stats, { status: 200 });
}
