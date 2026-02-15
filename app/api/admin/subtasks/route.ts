import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Subtask from "@/models/Subtask";

export async function GET(request: Request) {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const round_id = searchParams.get("round_id");

    try {
        const query = round_id ? { round_id } : {};
        const subtasks = await Subtask.find(query).sort({ created_at: -1 });
        return NextResponse.json(subtasks);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch subtasks" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    await connectDB();
    try {
        const body = await request.json();
        const subtask = await Subtask.create(body);
        return NextResponse.json(subtask, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
    }
}
