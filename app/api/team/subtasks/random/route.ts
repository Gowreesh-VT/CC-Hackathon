import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Subtask from "@/models/Subtask";
import { proxy } from "@/lib/proxy";

async function GETHandler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roundId = searchParams.get("roundId");

  if (!roundId)
    return NextResponse.json({ error: "missing roundId" }, { status: 400 });

  await connectDB();

  const subs = await Subtask.aggregate([
    { $match: { round_id: new (require("mongoose").Types.ObjectId)(roundId) } },
    { $sample: { size: 2 } },
  ]);

  const payload = subs.map((s: any) => ({
    id: s._id.toString(),
    title: s.title,
    description: s.description,
  }));

  return NextResponse.json(payload);
}

export const GET = proxy(GETHandler, ["team"]);
