import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Subtask from "@/models/Subtask";
import { subtaskSchema } from "@/lib/validations";
import { proxy } from "@/lib/proxy";

async function GETHandler(req: NextRequest) {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const round_id = searchParams.get("round_id");

    try {
        const query = round_id ? { round_id } : {};
        const subtasks = await Subtask.find(query).sort({ created_at: -1 });
        return NextResponse.json(subtasks);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch subtasks" }, { status: 500 });
    }
}

export const GET = proxy(GETHandler, ["admin"]);

async function POSTHandler(req: NextRequest) {
    await connectDB();

    try {
        const body = await req.json();
        const validation = subtaskSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const subtask = await Subtask.create(validation.data);
        return NextResponse.json(subtask, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
    }
}

export const POST = proxy(POSTHandler, ["admin"]);
