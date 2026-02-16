import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Submission from "@/models/Submission";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const body = await req.json();
  const { roundId, fileUrl, githubLink, overview } = body;

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user?.team_id)
    return NextResponse.json({ error: "no team" }, { status: 400 });

  try {
    const doc = await Submission.create({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
      file_url: fileUrl,
      github_link: githubLink,
      overview,
    });
    return NextResponse.json({ ok: true, submission: doc });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user?.team_id)
    return NextResponse.json({ error: "no team" }, { status: 400 });

  try {
    const submissions = await Submission.find({ team_id: user.team_id })
      .populate("round_id", "round_number title")
      .sort({ submitted_at: -1 })
      .lean();

    return NextResponse.json(submissions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
