import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { proxy } from "@/lib/proxy";

async function GETHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roundId = searchParams.get("roundId");

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  // Validated by withRole, but needed for user lookup
  if (!email) return NextResponse.json({ selection: null });

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user?.team_id) return NextResponse.json({ selection: null });

  const sel = await TeamSubtaskSelection.findOne({
    team_id: user.team_id,
    round_id: roundId,
  }).lean();
  return NextResponse.json({ selection: sel });
}

export const GET = proxy(GETHandler, ["team"]);

async function POSTHandler(req: NextRequest) {
  const body = await req.json();
  const { roundId, subtaskId } = body;

  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user?.team_id)
    return NextResponse.json({ error: "no team" }, { status: 400 });

  try {
    const doc = await TeamSubtaskSelection.create({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
      subtask_id: new mongoose.Types.ObjectId(subtaskId),
    });
    return NextResponse.json({ ok: true, selection: doc });
  } catch (err: any) {
    if (err.code === 11000) {
      const existing = await TeamSubtaskSelection.findOne({
        team_id: user.team_id,
        round_id: roundId,
      }).lean();
      return NextResponse.json({ ok: true, selection: existing });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const POST = proxy(POSTHandler, ["team"]);
