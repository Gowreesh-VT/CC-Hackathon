import { connectDB } from "@/config/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Judge from "@/models/Judge";
import JudgeAssignment from "@/models/JudgeAssignment";
import Score from "@/models/Score";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";
import { proxy } from "@/lib/proxy";

async function GETHandler(req: NextRequest) {
  await connectDB();

  const url = new URL(req.url);
  const roundId = url.searchParams.get("round_id");

  const session = await getServerSession(authOptions);

  // User verified by withRole, but need details
  const user = await User.findOne({ email: session?.user?.email });
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  const judge = await Judge.findOne({ user_id: user._id });
  if (!judge) {
    return new Response(JSON.stringify({ error: "Judge profile not found" }), {
      status: 404,
    });
  }

  const query: any = { judge_id: judge._id };

  if (roundId) {
    query.round_id = roundId;
  } else {
    // Default to active round
    const Round = await import("@/models/Round").then((m) => m.default);
    const activeRound = await Round.findOne({ is_active: true });
    if (activeRound) {
      query.round_id = activeRound._id;
    }
  }

  const assignments = await JudgeAssignment.find(query).populate("team_id");

  const results = await Promise.all(
    assignments.map(async (a: any) => {
      const team = a.team_id;
      if (!team) {
        console.log(`[JudgeAPI] Assignment ${a._id} has no team_id`);
        return null;
      }

      const existing = await Score.findOne({
        judge_id: judge._id,
        team_id: team._id,
        round_id: a.round_id,
      });

      // Fetch the chosen task/subtask for this round
      const selection = await TeamSubtaskSelection.findOne({
        team_id: team._id,
        round_id: a.round_id,
      }).populate("subtask_id");

      // Fetch the submission for this round
      const submission = await Submission.findOne({
        team_id: team._id,
        round_id: a.round_id,
      }).sort({ submitted_at: -1 });

      return {
        team_id: team._id,
        team_name: team.team_name,
        status: existing?.status || "pending",
        round_id: a.round_id,
        score: existing?.score ?? null,
        remarks: existing?.remarks ?? "",
        selected_subtask: selection?.subtask_id ?? null,
        submission: submission
          ? {
            file_url: submission.file_url,
            github_link: submission.github_link,
            submission_text: submission.submission_text,
            submitted_at: submission.submitted_at,
          }
          : null,
      };
    }),
  );

  const filteredResults = results.filter((r) => r !== null);
  console.log(`[JudgeAPI] Returning ${filteredResults.length} teams`);

  return NextResponse.json(filteredResults);
}

export const GET = proxy(GETHandler, ["judge", "admin"]);
