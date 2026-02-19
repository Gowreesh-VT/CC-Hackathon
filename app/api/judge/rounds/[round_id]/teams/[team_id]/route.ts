import { connectDB } from "@/config/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Judge from "@/models/Judge";
import Team from "@/models/Team";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import JudgeAssignment from "@/models/JudgeAssignment";
import { scoreSchema } from "@/lib/validations";
import { proxy } from "@/lib/proxy";

async function getJudgeFromSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await User.findOne({ email: session.user.email });
  if (!user) return null;

  const judge = await Judge.findOne({ user_id: user._id });
  if (!judge) return null;

  return { judge, user };
}

/* =========================
   GET TEAM DETAILS
========================= */

async function GETHandler(
  _req: NextRequest,
  context: { params: Promise<{ round_id: string; team_id: string }> },
) {
  await connectDB();

  const { round_id: paramRoundId, team_id } = await context.params;

  let round_id = paramRoundId;
  if (round_id === "active") {
    const Round = await import("@/models/Round").then((m) => m.default);
    const activeRound = await Round.findOne({ is_active: true });
    if (activeRound) {
      round_id = activeRound._id.toString();
    } else {
      return new Response(JSON.stringify({ error: "No active round found" }), {
        status: 404,
      });
    }
  }

  const team = await Team.findById(team_id);
  if (!team) {
    return new Response(JSON.stringify({ error: "Team not found" }), {
      status: 404,
    });
  }

  // IDOR CHECK: Ensure the judge is assigned to this team for this round
  const judgeSession = await getJudgeFromSession();
  if (judgeSession?.judge) {
    const assignment = await JudgeAssignment.findOne({
      judge_id: judgeSession.judge._id,
      team_id,
      round_id,
    });

    if (!assignment) {
      return new Response(JSON.stringify({ error: "Forbidden: You are not assigned to this team." }), {
        status: 403,
      });
    }
  } else {
    // If not a judge (and not caught by earlier check?), what then?
    // withRole ensures we are at least logged in as judge or admin.
    // However, getJudgeFromSession might return null if DB is inconsistent.
    return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 });
  }

  const selection = await TeamSubtaskSelection.findOne({
    team_id,
    round_id,
  }).populate("subtask_id");

  const submission = await Submission.findOne({
    team_id,
    round_id,
  }).sort({ submitted_at: -1 });

  // Get the score and remarks for this team if available
  let score = null;
  let remarks = "";
  let status = "pending";

  if (judgeSession?.judge) {
    const scoreDoc = await Score.findOne({
      judge_id: judgeSession.judge._id,
      team_id,
      round_id,
    });

    if (scoreDoc) {
      score = scoreDoc.score;
      remarks = scoreDoc.remarks || "";
      status = scoreDoc.status || "pending";
    }
  }

  return Response.json({
    team: {
      team_id: team._id,
      team_name: team.team_name,
      track: team.track,
    },
    selected_subtask: selection ? selection.subtask_id : null,
    submission: submission
      ? {
        file_url: submission.file_url,
        github_link: submission.github_link,
        submitted_at: submission.submitted_at,
      }
      : null,
    score,
    remarks,
    status,
  });
}

export const GET = proxy(GETHandler, ["judge", "admin"]);

/* =========================
   POST SCORE
========================= */

async function POSTHandler(
  req: NextRequest,
  context: { params: Promise<{ round_id: string; team_id: string }> },
) {
  await connectDB();

  const ids = await getJudgeFromSession();
  if (!ids?.judge) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
    });
  }

  const { round_id: paramRoundId, team_id } = await context.params;

  let round_id = paramRoundId;
  if (round_id === "active") {
    const Round = await import("@/models/Round").then((m) => m.default);
    const activeRound = await Round.findOne({ is_active: true });
    if (activeRound) {
      round_id = activeRound._id.toString();
    } else {
      return new Response(JSON.stringify({ error: "No active round found" }), {
        status: 404,
      });
    }
  }

  const body = await req.json().catch(() => ({}));

  // Zod Validation
  const validation = scoreSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.flatten().fieldErrors }), {
      status: 400,
    });
  }

  const { score: scoreValue, remarks } = validation.data;

  const assignment = await JudgeAssignment.findOne({
    judge_id: ids.judge._id,
    team_id,
    round_id,
  });

  if (!assignment) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  const doc = await Score.findOneAndUpdate(
    {
      judge_id: ids.judge._id,
      team_id,
      round_id,
    },
    {
      score: scoreValue,
      remarks: remarks || "",
      status: "scored",
      updated_at: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  return Response.json({ data: doc });
}

export const POST = proxy(POSTHandler, ["judge", "admin"]);

/* =========================
   UPDATE SCORE
========================= */

async function PUTHandler(
  req: NextRequest,
  context: { params: Promise<{ round_id: string; team_id: string }> },
) {
  await connectDB();

  const ids = await getJudgeFromSession();
  if (!ids?.judge) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
    });
  }

  const { round_id: paramRoundId, team_id } = await context.params;

  let round_id = paramRoundId;
  if (round_id === "active") {
    const Round = await import("@/models/Round").then((m) => m.default);
    const activeRound = await Round.findOne({ is_active: true });
    if (activeRound) {
      round_id = activeRound._id.toString();
    } else {
      return new Response(JSON.stringify({ error: "No active round found" }), {
        status: 404,
      });
    }
  }

  const body = await req.json().catch(() => ({}));

  // Zod Validation
  const validation = scoreSchema.safeParse(body);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.flatten().fieldErrors }), {
      status: 400,
    });
  }

  const { score: scoreValue, remarks } = validation.data;

  const assignment = await JudgeAssignment.findOne({
    judge_id: ids.judge._id,
    team_id,
    round_id,
  });

  if (!assignment) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  const updated = await Score.findOneAndUpdate(
    {
      judge_id: ids.judge._id,
      team_id,
      round_id,
    },
    {
      score: scoreValue,
      remarks: remarks || "",
      status: "scored",
      updated_at: new Date(),
    },
    {
      new: true,
    },
  );

  if (!updated) {
    return new Response(JSON.stringify({ error: "Score entry not found" }), {
      status: 404,
    });
  }

  return Response.json({ data: updated });
}

export const PUT = proxy(PUTHandler, ["judge", "admin"]);
