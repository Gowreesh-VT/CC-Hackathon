import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import RoundOptions from "@/models/RoundOptions";
import Round from "@/models/Round";
import { isRound2 } from "@/lib/roundPolicy";
import { proxy } from "@/lib/proxy";

/**
 * POST /api/admin/rounds/[roundId]/allocate
 * Body: { allocations: [{ teamId: string; subtaskIds: [string, string] }] }
 *
 * Manually assigns exactly 2 subtask options to each team.
 * Team will then pick one from the 2 options themselves.
 * Does NOT set `selected` - that is the team's choice.
 */
async function POSTHandler(
  request: NextRequest,
  { params }: { params: Promise<{ roundId: string }> },
) {
  await connectDB();
  const { roundId } = await params;

  try {
    const round = await Round.findById(roundId).select("round_number").lean();
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }
    const roundNumber = (round as any).round_number;
    if (!(roundNumber === 1 || isRound2(roundNumber))) {
      return NextResponse.json(
        { error: "Team-level allocation is available only for Rounds 1 and 2" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const allocations: { teamId: string; subtaskIds: string[] }[] =
      body.allocations || [];

    if (!Array.isArray(allocations) || allocations.length === 0) {
      return NextResponse.json(
        { error: "allocations must be a non-empty array" },
        { status: 400 },
      );
    }

    await Promise.all(
      allocations.map(async ({ teamId, subtaskIds }) => {
        const normalizedOptions = [...new Set(subtaskIds)].slice(0, 2);
        const existing = await RoundOptions.findOne({
          team_id: teamId,
          round_id: roundId,
        })
          .select("selected")
          .lean();

        const previouslySelectedId = existing?.selected?.toString();
        const keepPreviousSelection =
          previouslySelectedId &&
          normalizedOptions.includes(previouslySelectedId);

        const update: any = {
          $set: {
            team_id: teamId,
            round_id: roundId,
            options: normalizedOptions,
            // Reset pairing state — ensures stale pair fields don't persist
            assignment_mode: "team",
            pair_id: null,
            priority_team_id: null,
            paired_team_id: null,
            published_at: null,
            auto_assigned: false,
          },
        };

        if (!keepPreviousSelection) {
          update.$set.selected = null;
          update.$set.selected_at = null;
        }

        return RoundOptions.findOneAndUpdate(
          { team_id: teamId, round_id: roundId },
          update,
          { upsert: true, new: true },
        );
      }),
    );

    return NextResponse.json({
      message: "Subtask options allocated successfully",
      count: allocations.length,
    });
  } catch (error) {
    console.error("Error allocating subtasks:", error);
    return NextResponse.json(
      { error: "Failed to allocate subtasks" },
      { status: 500 },
    );
  }
}

export const POST = proxy(POSTHandler, ["admin"]);
