import { connectDB } from "@/config/db"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import User from "@/models/User"
import Judge from "@/models/Judge"
import Team from "@/models/Team"
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection"
import Submission from "@/models/Submission"
import Score from "@/models/Score"
import JudgeAssignment from "@/models/JudgeAssignment"

async function getJudgeFromSession() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await User.findOne({ email: session.user.email })
  if (!user) return null

  const judge = await Judge.findOne({ user_id: user._id })
  if (!judge) return null

  return { judge, user }
}

/* =========================
   GET TEAM DETAILS
========================= */

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ round_id: string; team_id: string }> }
) {
  await connectDB()

  const { round_id, team_id } = await context.params

  const team = await Team.findById(team_id)
  if (!team) {
    return new Response(JSON.stringify({ error: "Team not found" }), {
      status: 404,
    })
  }

  const selection = await TeamSubtaskSelection.findOne({
    team_id,
    round_id,
  }).populate("subtask_id")

  const submission = await Submission.findOne({
    team_id,
    round_id,
  }).sort({ submitted_at: -1 })

  return Response.json({
    data: {
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
    },
  })
}

/* =========================
   POST SCORE
========================= */

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ round_id: string; team_id: string }> }
) {
  await connectDB()

  const ids = await getJudgeFromSession()
  if (!ids?.judge) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
    })
  }

  const { round_id, team_id } = await context.params
  const body = await req.json().catch(() => ({}))
  const { score: scoreValue, remarks } = body

  if (typeof scoreValue !== "number") {
    return new Response(JSON.stringify({ error: "Invalid score" }), {
      status: 400,
    })
  }

  const assignment = await JudgeAssignment.findOne({
    judge_id: ids.judge._id,
    team_id,
    round_id,
  })

  if (!assignment) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    })
  }

  const doc = await Score.create({
    judge_id: ids.judge._id,
    team_id,
    round_id,
    score: scoreValue,
    remarks: remarks || "",
  })

  return Response.json({ data: doc })
}

/* =========================
   UPDATE SCORE
========================= */

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ round_id: string; team_id: string }> }
) {
  await connectDB()

  const ids = await getJudgeFromSession()
  if (!ids?.judge) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
    })
  }

  const { round_id, team_id } = await context.params
  const body = await req.json().catch(() => ({}))
  const { score: scoreValue, remarks } = body

  if (typeof scoreValue !== "number") {
    return new Response(JSON.stringify({ error: "Invalid score" }), {
      status: 400,
    })
  }

  const assignment = await JudgeAssignment.findOne({
    judge_id: ids.judge._id,
    team_id,
    round_id,
  })

  if (!assignment) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    })
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
      updated_at: new Date(),
    },
    {
      new: true,
    }
  )

  if (!updated) {
    return new Response(JSON.stringify({ error: "Score entry not found" }), {
      status: 404,
    })
  }

  return Response.json({ data: updated })
}
