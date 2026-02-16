import { connectDB } from "@/config/db"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import User from "@/models/User"
import Judge from "@/models/Judge"
import JudgeAssignment from "@/models/JudgeAssignment"
import Score from "@/models/Score"

export async function GET(req: NextRequest) {
  await connectDB()

  const url = new URL(req.url)
  const roundId = url.searchParams.get("round_id")

  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthenticated" }), {
      status: 401,
    })
  }

  const user = await User.findOne({ email: session.user.email })
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    })
  }

  const judge = await Judge.findOne({ user_id: user._id })
  if (!judge) {
    return new Response(JSON.stringify({ error: "Judge profile not found" }), {
      status: 404,
    })
  }

  const query: any = { judge_id: judge._id }

  if (roundId) {
    query.round_id = roundId
  } else {
    // Default to active round
    const Round = await import("@/models/Round").then(m => m.default);
    const activeRound = await Round.findOne({ is_active: true });
    if (activeRound) {
      query.round_id = activeRound._id;
    }
  }

  const assignments = await JudgeAssignment.find(query).populate("team_id")

  const results = await Promise.all(
    assignments.map(async (a: any) => {
      const team = a.team_id
      if (!team) return null;


      const existing = await Score.findOne({
        judge_id: judge._id,
        team_id: team._id,
        round_id: a.round_id,
      })

      return {
        team_id: team._id,
        team_name: team.team_name,
        status: existing ? "scored" : "pending",
      }
    })
  )

  const filteredResults = results.filter((r) => r !== null);

  return Response.json({ data: filteredResults })
}
