import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import User from "@/models/User";
import Team from "@/models/Team";
import Round from "@/models/Round";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { submissionSchema } from "@/lib/validations";
import { proxy } from "@/lib/proxy";

function canAccessRound(team: any, round: any) {
  const accessibleRoundIds = new Set(
    (team.rounds_accessible || []).map((rid: any) => rid.toString()),
  );

  if (round.round_number === 1) {
    return round.is_active || accessibleRoundIds.has(round._id.toString());
  }

  return accessibleRoundIds.has(round._id.toString());
}

async function POSTHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  // email checks are technically redundant with withRole but good for type safety/finding user
  if (!email)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { id: roundId } = await context.params;
  const body = await req.json();

  const validation = submissionSchema.safeParse({ ...body, roundId });
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { fileUrl, githubLink, overview } = validation.data;

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user?.team_id)
    return NextResponse.json({ error: "no team" }, { status: 400 });

  try {
    const team = await Team.findById(user.team_id).lean();
    if (!team) {
      return NextResponse.json({ error: "team not found" }, { status: 404 });
    }

    // Check if round exists
    const round = await Round.findById(roundId).lean();
    if (!round) {
      return NextResponse.json({ error: "round not found" }, { status: 404 });
    }

    if (!canAccessRound(team, round)) {
      return NextResponse.json(
        { error: "you do not have access to this round" },
        { status: 403 },
      );
    }

    if (!round.is_active) {
      return NextResponse.json(
        { error: "round is locked. submissions are not allowed yet" },
        { status: 403 },
      );
    }

    // Check if submission deadline has passed (skip check if no end_time set)
    if (round.end_time) {
      const now = new Date();
      const endTime = new Date(round.end_time);
      if (now > endTime) {
        return NextResponse.json(
          { error: "submission deadline has passed" },
          { status: 403 },
        );
      }
    }

    const existingSubmission = await Submission.findOne({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
    }).lean();
    if (existingSubmission) {
      return NextResponse.json(
        { error: "submission already exists for this round" },
        { status: 409 },
      );
    }

    const doc = await Submission.create({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
      file_url: fileUrl,
      github_link: githubLink,
      overview,
    });
    return NextResponse.json({ ok: true, submission: doc });
  } catch (err: any) {
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: "submission already exists for this round" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const POST = proxy(POSTHandler, ["team"]);

async function PATCHHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { id: roundId } = await context.params;
  const body = await req.json();

  const validation = submissionSchema.safeParse({ ...body, roundId });
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { fileUrl, githubLink, overview } = validation.data;

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user?.team_id)
    return NextResponse.json({ error: "no team" }, { status: 400 });

  try {
    const team = await Team.findById(user.team_id).lean();
    if (!team) {
      return NextResponse.json({ error: "team not found" }, { status: 404 });
    }

    // Check if round exists
    const round = await Round.findById(roundId).lean();
    if (!round) {
      return NextResponse.json({ error: "round not found" }, { status: 404 });
    }

    if (!canAccessRound(team, round)) {
      return NextResponse.json(
        { error: "you do not have access to this round" },
        { status: 403 },
      );
    }

    if (!round.is_active) {
      return NextResponse.json(
        { error: "round is locked. submissions are not allowed yet" },
        { status: 403 },
      );
    }

    // Check if submission deadline has passed (skip check if no end_time set)
    if (round.end_time) {
      const now = new Date();
      const endTime = new Date(round.end_time);
      if (now > endTime) {
        return NextResponse.json(
          { error: "submission deadline has passed" },
          { status: 403 },
        );
      }
    }

    // Find existing submission for this team and round
    const submission = await Submission.findOne({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
    });

    if (!submission) {
      return NextResponse.json(
        { error: "submission not found" },
        { status: 404 },
      );
    }

    // Update only the provided fields
    if (fileUrl !== undefined) submission.file_url = fileUrl;
    if (githubLink !== undefined) submission.github_link = githubLink;
    if (overview !== undefined) submission.overview = overview;
    // Keep original submitted_at timestamp

    const updatedDoc = await submission.save();
    return NextResponse.json({ ok: true, submission: updatedDoc });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const PATCH = proxy(PATCHHandler, ["team"]);

async function GETHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email)
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { id: roundId } = await context.params;

  await connectDB();
  const user = await User.findOne({ email }).lean();
  if (!user?.team_id)
    return NextResponse.json({ error: "no team" }, { status: 400 });

  try {
    const team = await Team.findById(user.team_id).lean();
    if (!team) {
      return NextResponse.json({ error: "team not found" }, { status: 404 });
    }

    const round = await Round.findById(roundId).lean();
    if (!round) {
      return NextResponse.json({ error: "round not found" }, { status: 404 });
    }

    if (!canAccessRound(team, round)) {
      return NextResponse.json(
        { error: "you do not have access to this round" },
        { status: 403 },
      );
    }

    // Find submission for this specific round
    const submission = await Submission.findOne({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
    })
      .populate("round_id", "round_number")
      .lean();

    if (!submission) {
      return NextResponse.json({
        submission: null,
        score: null,
      });
    }

    // Fetch scores for this submission
    const scores = await Score.find({
      submission_id: submission._id,
      status: "scored",
    }).lean();

    const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0);

    const submissionWithScore = {
      ...submission,
      score:
        scores.length > 0
          ? {
              score: totalScore,
              status: "scored",
              remarks: scores[0]?.remarks || "",
              num_judges: scores.length,
            }
          : null,
    };

    return NextResponse.json(submissionWithScore);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const GET = proxy(GETHandler, ["team"]);
