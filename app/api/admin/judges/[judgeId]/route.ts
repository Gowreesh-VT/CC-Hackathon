import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Judge from "@/models/Judge";
import User from "@/models/User";
import JudgeAssignment from "@/models/JudgeAssignment";

// PATCH: Update judge details (name and/or email)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ judgeId: string }> },
) {
  await connectDB();
  const { judgeId } = await params;

  try {
    const body = await request.json();
    const { name, email } = body;

    // Find the judge
    const judge = await Judge.findById(judgeId).populate("user_id");
    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    // Update judge name if provided
    if (name) {
      judge.name = name;
    }

    // Update user email if provided
    if (email && judge.user_id) {
      // Check if email is already used by another user
      const existingUser = await User.findOne({
        email,
        _id: { $ne: judge.user_id._id },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already in use" },
          { status: 400 },
        );
      }

      // Update the user email
      await User.findByIdAndUpdate(judge.user_id._id, { email });
    }

    // Save judge updates
    await judge.save();

    // Return updated judge
    const updatedJudge = await Judge.findById(judgeId)
      .populate("user_id", "email")
      .lean();

    return NextResponse.json(
      {
        message: "Judge updated successfully",
        judge: {
          id: updatedJudge?._id.toString(),
          name: updatedJudge?.name,
          email: updatedJudge?.user_id?.email || "N/A",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating judge:", error);
    return NextResponse.json(
      { error: "Failed to update judge" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ judgeId: string }> },
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
    await User.deleteOne({ _id: judge.user_id });

    return NextResponse.json({
      message: "Judge removed successfully",
    });
  } catch (error) {
    console.error("Error deleting judge:", error);
    return NextResponse.json(
      { error: "Failed to delete judge" },
      { status: 500 },
    );
  }
}
