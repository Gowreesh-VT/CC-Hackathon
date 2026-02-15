import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Judge from "@/models/Judge";
import JudgeAssignment from "@/models/JudgeAssignment";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Assuming authOptions is exported from here

// GET: List all judges with their assigned teams
export async function GET() {
  await connectDB();

  try {
    // Populate user info (email)
    const judges = await Judge.find({}).populate("user_id", "email").lean();

    const judgesWithAssignments = await Promise.all(
      judges.map(async (judge: any) => {
        const assignments = await JudgeAssignment.find({
          judge_id: judge._id,
        }).lean();

        // aggregate team IDs matching the judge
        const assignedTeamIds = assignments.map((a) => a.team_id.toString());

        return {
          id: judge._id.toString(),
          name: judge.name,
          email: judge.user_id?.email || "N/A",
          assignedTeams: assignedTeamIds,
          assignedTeamsCount: assignedTeamIds.length,
        };
      })
    );

    return NextResponse.json(judgesWithAssignments);
  } catch (error) {
    console.error("Error fetching judges:", error);
    return NextResponse.json(
      { error: "Failed to fetch judges" },
      { status: 500 }
    );
  }
}

// POST: Add a new judge
export async function POST(request: Request) {
  await connectDB();

  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Create a User for the judge first (if they need login)
    // For now, assuming we just create a Judge record linked to a User
    // If we only have name/email in the UI, we might need to create a dummy user or handle it differently.

    // For the hackathon context, usually we just create a Judge entry
    // But the Judge model has `user_id` required and ref to `User`.
    // So we MUST create a User first or find one.

    // Simplify: Create a User with role 'judge'
    const existingUser = await User.findOne({ email });
    let userId;

    if (existingUser) {
      userId = existingUser._id;
      // Optionally update role if needed
    } else {
      const newUser = await User.create({
        name,
        email,
        password: password || "password123", // Default password or generated
        role: "judge"
      });
      userId = newUser._id;
    }

    const newJudge = await Judge.create({
      user_id: userId,
      name: name,
    });

    return NextResponse.json(
      {
        message: "Judge added successfully",
        judge: {
          id: newJudge._id.toString(),
          name: newJudge.name,
          email: email,
          assignedTeams: [],
          assignedTeamsCount: 0
        }
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating judge:", error);
    return NextResponse.json(
      { error: "Failed to create judge" },
      { status: 500 }
    );
  }
}
