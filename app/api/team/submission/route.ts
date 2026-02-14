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

  const contentType = req.headers.get("content-type") || "";
  let roundId: string | undefined;
  let fileUrl: string | undefined;
  let githubLink: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    roundId = form.get("roundId")?.toString();
    githubLink = form.get("githubLink")?.toString();
    const file = form.get("file") as File | null;
    if (file) {
      // placeholder: we don't store file blobs in DB; save filename as reference
      fileUrl = file.name;
    }
  } else {
    const body = await req.json();
    roundId = body.roundId;
    fileUrl = body.fileUrl;
    githubLink = body.githubLink || body.githubLink;
  }

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
    });
    return NextResponse.json({ ok: true, submission: doc });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
