import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { getTeamSession } from "@/lib/getTeamSession";
import Pairing from "@/models/Pairing";
import Round from "@/models/Round";
import Submission from "@/models/Submission";
import { proxy } from "@/lib/proxy";

async function GETHandler(_request: NextRequest) {
  try {
    const { teamId } = await getTeamSession();
    await connectDB();

    const round2 = await Round.findOne({ round_number: 2 }).select("_id").lean();
    if (!round2?._id) return NextResponse.json([]);

    const pair = await Pairing.findOne({
      round_anchor_id: (round2 as any)._id,
      $or: [{ team_a_id: teamId }, { team_b_id: teamId }],
    })
      .populate("team_a_id", "team_name")
      .populate("team_b_id", "team_name")
      .lean();

    if (!pair) return NextResponse.json([]);

    const isTeamA = pair.team_a_id?._id?.toString() === teamId.toString();
    const partner = isTeamA ? pair.team_b_id : pair.team_a_id;
    if (!partner?._id) return NextResponse.json([]);

    const rounds = await Round.find({ round_number: { $in: [1, 2, 3] } })
      .select("_id round_number")
      .lean();
    const roundIds = rounds.map((r: any) => r._id);
    const roundNumMap = new Map(rounds.map((r: any) => [r._id.toString(), r.round_number]));

    const submissions = await Submission.find({
      team_id: { $in: [teamId, partner._id] },
      round_id: { $in: roundIds },
    })
      .sort({ submitted_at: -1 })
      .lean();

    return NextResponse.json(
      submissions.map((sub: any) => ({
        _id: sub._id.toString(),
        team_id: sub.team_id.toString(),
        team_name: sub.team_id.toString() === teamId.toString() ? "Your Team" : partner.team_name,
        is_current_team: sub.team_id.toString() === teamId.toString(),
        round_number: roundNumMap.get(sub.round_id.toString()) || null,
        submitted_at: sub.submitted_at,
        github_link: sub.github_link || null,
        file_url: sub.file_url || null,
        overview: sub.overview || null,
      })),
    );
  } catch (err: any) {
    if (err.status && err.error) {
      return NextResponse.json({ error: err.error }, { status: err.status });
    }
    console.error("GET /api/team/submission/pair error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const GET = proxy(GETHandler, ["team"]);
