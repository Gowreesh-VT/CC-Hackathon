import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/config/db";
import Judge from "@/models/Judge";
import JudgeAssignment from "@/models/JudgeAssignment";
import User from "@/models/User";
import { judgeSchema } from "@/lib/validations";
import { proxy } from "@/lib/proxy";

// GET: List all judges with their assigned teams
async function GETHandler(req: NextRequest) {
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

export const GET = proxy(GETHandler, ["admin"]);

// POST: Add a new judge
async function POSTHandler(request: NextRequest) {
  await connectDB();

  try {
    const body = await request.json();

    const validation = judgeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // Simplify: Create a User with role 'judge'
    const existingUser = await User.findOne({ email });
    let userId;

    if (existingUser) {
      if (existingUser.role !== "judge" && existingUser.role !== "admin") {
        return NextResponse.json({ error: "Email is already registered as a Team or other role." }, { status: 400 });
      }

      // Check if judge profile already exists for this user
      const existingJudge = await Judge.findOne({ user_id: existingUser._id });
      if (existingJudge) {
        return NextResponse.json({ error: "Judge profile already exists for this email." }, { status: 400 });
      }

      userId = existingUser._id;
    } else {
      const newUser = await User.create({
        name,
        email,
        password_hash: "password123", // Default password or generated (TODO: Email this)
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

export const POST = proxy(POSTHandler, ["admin"]);
