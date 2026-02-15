import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Judge from "@/models/Judge";
import User from "@/models/User";
import JudgeAssignment from "@/models/JudgeAssignment";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ judgeId: string }> }
) {
    await connectDB();
    const { judgeId } = await params;

    try {
        // 1. Check if judge exists
        const judge = await Judge.findById(judgeId);
        if (!judge) {
            return NextResponse.json({ error: "Judge not found" }, { status: 404 });
        }

        // 2. Delete Judge record
        await Judge.findByIdAndDelete(judgeId);

        // 3. Delete Assignments for this judge
        await JudgeAssignment.deleteMany({ judge_id: judgeId });

        // 4. Optionally delete User or revert role?
        // If we delete the user, they can't login.
        // Usually admin might delete judge access but keep user?
        // Or just delete user too if they were created just for judging.
        // For now, let's keep user or maybe just update role to 'user'.
        // BUT if the user was created specifically as judge, we probably want to remove them.
        // Let's assume we maintain user but remove judge profile.
        // Or we can check if we should delete user.
        // For safety, let's NOT delete user account automatically unless requested.
        // Just removing Judge profile removes them from the list.

        return NextResponse.json({
            message: "Judge removed successfully"
        });

    } catch (error) {
        console.error("Error deleting judge:", error);
        return NextResponse.json({ error: "Failed to delete judge" }, { status: 500 });
    }
}
