import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Pairing from "@/models/Pairing";
import Round from "@/models/Round";
import RoundOptions from "@/models/RoundOptions";
import { isRound2 } from "@/lib/roundPolicy";
import { proxy } from "@/lib/proxy";

async function DELETEHandler(
  _req: NextRequest,
  context: { params: Promise<{ roundId: string; pairId: string }> },
) {
  await connectDB();
  const { roundId, pairId } = await context.params;

  const round = await Round.findById(roundId).select("round_number").lean();
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }
  if (!isRound2((round as any).round_number)) {
    return NextResponse.json(
      { error: "Pair management is available only for Round 2" },
      { status: 400 },
    );
  }

  const deleted = await Pairing.findOneAndDelete({
    _id: pairId,
    round_anchor_id: roundId,
  }).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Pair not found" }, { status: 404 });
  }

  const round3 = await Round.findOne({ round_number: 3 }).select("_id").lean();
  if (round3) {
    await RoundOptions.updateMany(
      {
        round_id: (round3 as any)._id,
        team_id: { $in: [deleted.team_a_id, deleted.team_b_id] },
      },
      {
        $set: {
          assignment_mode: "team",
          pair_id: null,
          priority_team_id: null,
          paired_team_id: null,
          published_at: null,
          auto_assigned: false,
          selected: null,
          selected_at: null,
        },
      },
    );
  }

  return NextResponse.json({ message: "Pair removed successfully" });
}

export const DELETE = proxy(DELETEHandler, ["admin"]);
