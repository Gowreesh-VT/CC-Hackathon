import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import RoundOptions from "@/models/RoundOptions";
import User from "@/models/User";
import Team from "@/models/Team";
import Subtask from "@/models/Subtask";
import Round from "@/models/Round";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { proxy } from "@/lib/proxy";
import { z } from "zod";
import { isRound3, isRound4, canAccessRound } from "@/lib/roundPolicy";
import { resolveRound3PairTimeout } from "@/lib/pairing";

const subtaskSelectionSchema = z.object({
  subtaskId: z.string().min(1, "Subtask ID is required"),
});


async function POSTHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // proxy() already verified authentication and the "team" role.
  // Re-read the session to extract the user's email for the DB lookup.
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id: roundId } = await context.params;

  if (!mongoose.isValidObjectId(roundId)) {
    return NextResponse.json({ error: "Invalid round ID" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email }).lean();
  if (!user?.team_id) {
    return NextResponse.json({ error: "no team" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validation = subtaskSelectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { subtaskId } = validation.data;

    // Verify round exists
    const round = await Round.findById(roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const team = await Team.findById(user.team_id).lean();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const roundAccessContext = await Round.find({
      round_number: { $in: [2, 3, 4] },
    })
      .select("_id round_number")
      .lean();

    if (!canAccessRound(team, round as any, roundAccessContext as any[])) {
      return NextResponse.json(
        { error: "You do not have access to this round" },
        { status: 403 },
      );
    }

    if (!round.is_active) {
      return NextResponse.json(
        { error: "Round is locked. Selection is not allowed yet." },
        { status: 403 },
      );
    }

    if (isRound4(round.round_number)) {
      return NextResponse.json(
        { error: "Round 4 does not require subtask selection" },
        { status: 400 },
      );
    }

    let existingOption = await RoundOptions.findOne({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
    });

    if (!existingOption || !existingOption.options?.length) {
      return NextResponse.json(
        { error: "No subtask options have been assigned for this round" },
        { status: 403 },
      );
    }

    if (isRound3(round.round_number) && existingOption.assignment_mode === "pair") {
      await resolveRound3PairTimeout(roundId, user.team_id.toString());
      existingOption = await RoundOptions.findOne({
        team_id: user.team_id,
        round_id: new mongoose.Types.ObjectId(roundId),
      });
      if (!existingOption) {
        return NextResponse.json(
          { error: "Round options unavailable for this team" },
          { status: 404 },
        );
      }

      const isPriorityTeam =
        existingOption.priority_team_id?.toString() === user.team_id.toString();
      const priorityOption = existingOption.priority_team_id
        ? await RoundOptions.findOne({
          team_id: existingOption.priority_team_id,
          round_id: new mongoose.Types.ObjectId(roundId),
        })
        : null;

      if (!isPriorityTeam) {
        if (!priorityOption?.selected) {
          return NextResponse.json(
            { error: "Waiting for priority team selection" },
            { status: 403 },
          );
        }
        return NextResponse.json(
          { error: "Subtask is automatically assigned for your team in Round 3" },
          { status: 403 },
        );
      }

      if (existingOption.selected) {
        return NextResponse.json(
          { error: "Selection already finalized for this pair" },
          { status: 403 },
        );
      }
    }

    // Finality guard for Rounds 1 & 2: once a team has selected a subtask, lock it in.
    if (!isRound3(round.round_number) && existingOption.selected) {
      return NextResponse.json(
        { error: "Subtask selection is already finalised and cannot be changed" },
        { status: 403 },
      );
    }

    const assignedOptionIds = (existingOption.options || []).map((opt: any) =>
      opt.toString(),
    );
    if (!assignedOptionIds.includes(subtaskId)) {
      return NextResponse.json(
        { error: "Selected subtask is not assigned to this team" },
        { status: 403 },
      );
    }

    // Verify subtask exists
    const subtask = await Subtask.findById(subtaskId);
    if (!subtask) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }

    // Update the selected subtask
    existingOption.selected = new mongoose.Types.ObjectId(subtaskId);
    existingOption.selected_at = new Date();
    existingOption.auto_assigned = false;
    await existingOption.save();

    if (isRound3(round.round_number) && existingOption.assignment_mode === "pair") {
      const optionIds = (existingOption.options || []).map((opt: any) =>
        opt.toString(),
      );
      const remainingId = optionIds.find((id: string) => id !== subtaskId);
      if (remainingId && existingOption.paired_team_id) {
        await RoundOptions.findOneAndUpdate(
          {
            team_id: existingOption.paired_team_id,
            round_id: new mongoose.Types.ObjectId(roundId),
          },
          {
            $set: {
              selected: new mongoose.Types.ObjectId(remainingId),
              selected_at: new Date(),
              auto_assigned: false,
            },
          },
          { new: true },
        );
      }
    }

    const populated = await RoundOptions.findById(existingOption._id)
      .populate("selected", "title description")
      .lean();

    return NextResponse.json({
      message: "Subtask selection updated successfully",
      roundOption: {
        id: populated._id.toString(),
        team_id: populated.team_id.toString(),
        round_id: populated.round_id.toString(),
        selected: populated.selected
          ? {
            id: (populated.selected as any)._id.toString(),
            title: (populated.selected as any).title,
            description: (populated.selected as any).description,
          }
          : null,
        selected_at: populated.selected_at,
      },
    });
  } catch (err: any) {
    console.error("Error in subtask selection:", err);
    return NextResponse.json(
      { error: "Failed to update subtask selection" },
      { status: 500 },
    );
  }
}

export const POST = proxy(POSTHandler, ["team"]);

// GET: Retrieve current subtask selection for the round
async function GETHandler(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  // proxy() already verified authentication and the "team" role.
  // Re-read the session to extract the user's email for the DB lookup.
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const { id: roundId } = await context.params;

  if (!mongoose.isValidObjectId(roundId)) {
    return NextResponse.json({ error: "Invalid round ID" }, { status: 400 });
  }

  await connectDB();

  const user = await User.findOne({ email }).lean();
  if (!user?.team_id) {
    return NextResponse.json({ error: "no team" }, { status: 400 });
  }

  try {
    const round = await Round.findById(roundId).lean();
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const team = await Team.findById(user.team_id).lean();
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const roundAccessContext = await Round.find({
      round_number: { $in: [2, 3, 4] },
    })
      .select("_id round_number")
      .lean();

    if (!canAccessRound(team, round as any, roundAccessContext as any[])) {
      return NextResponse.json(
        { error: "You do not have access to this round" },
        { status: 403 },
      );
    }

    const roundOption = await RoundOptions.findOne({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
    })
      .populate("selected", "title description")
      .populate("options", "title description")
      .lean();

    if (!roundOption) {
      return NextResponse.json({
        roundOption: null,
      });
    }

    if (isRound3((round as any).round_number) && roundOption.assignment_mode === "pair") {
      await resolveRound3PairTimeout(roundId, user.team_id.toString());
    }

    const refreshedRoundOption = await RoundOptions.findOne({
      team_id: user.team_id,
      round_id: new mongoose.Types.ObjectId(roundId),
    })
      .populate("selected", "title description")
      .populate("options", "title description")
      .lean();

    if (!refreshedRoundOption) {
      return NextResponse.json({ roundOption: null });
    }

    return NextResponse.json({
      roundOption: {
        id: refreshedRoundOption._id.toString(),
        team_id: refreshedRoundOption.team_id.toString(),
        round_id: refreshedRoundOption.round_id.toString(),
        assignment_mode: refreshedRoundOption.assignment_mode || "team",
        priority_team_id:
          refreshedRoundOption.priority_team_id?.toString?.() || null,
        paired_team_id:
          refreshedRoundOption.paired_team_id?.toString?.() || null,
        auto_assigned: refreshedRoundOption.auto_assigned || false,
        options: (refreshedRoundOption.options as any[]).map((opt) => ({
          id: opt._id.toString(),
          title: opt.title,
          description: opt.description,
        })),
        selected: refreshedRoundOption.selected
          ? {
            id: (refreshedRoundOption.selected as any)._id.toString(),
            title: (refreshedRoundOption.selected as any).title,
            description: (refreshedRoundOption.selected as any).description,
          }
          : null,
        selected_at: refreshedRoundOption.selected_at,
      },
    });
  } catch (err: any) {
    console.error("Error retrieving subtask selection:", err);
    return NextResponse.json(
      { error: "Failed to retrieve subtask selection" },
      { status: 500 },
    );
  }
}

export const GET = proxy(GETHandler, ["team"]);
