import { connectDB } from "@/config/db";
import User from "@/models/User";
import Team from "@/models/Team";
import Round from "@/models/Round";
import Judge from "@/models/Judge";
import Subtask from "@/models/Subtask";
import JudgeAssignment from "@/models/JudgeAssignment";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import mongoose from "mongoose";

interface ISeedResult {
  success: boolean;
  message: string;
  data?: any;
}

async function seedDatabase(): Promise<ISeedResult> {
  try {
    await connectDB();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Round.deleteMany({}),
      Judge.deleteMany({}),
      Subtask.deleteMany({}),
      JudgeAssignment.deleteMany({}),
      TeamSubtaskSelection.deleteMany({}),
    ]);

    console.log("✓ Cleared existing data");

    // Create Users - Admin
    const adminUser = await User.create({
      email: "sasanklearner@gmail.com",
      role: "admin",
    });
    console.log("✓ Created Admin User");

    // Create Users - Judge
    const judgeUser = await User.create({
      email: "sasank.v.16@gmail.com",
      role: "judge",
    });
    console.log("✓ Created Judge User");

    // Create Judge Profile
    const judge = await Judge.create({
      user_id: judgeUser._id,
      name: "Judge Sasank",
    });
    console.log("✓ Created Judge Profile");

    // Create Teams
    const teamLeaderUser = await User.create({
      email: "sasank.v2023@vitstudent.ac.in",
      role: "team",
    });

    const team1 = await Team.create({
      team_name: "Code Ninjas",
      track: "Web Development",
      is_locked: false,
      is_shortlisted: false,
      is_eliminated: false,
    });
    await User.updateOne({ _id: teamLeaderUser._id }, { team_id: team1._id });
    console.log("✓ Created Team 1 - Code Ninjas");

    // Create additional team members
    const teamMembers = [
      { email: "alice@vitstudent.ac.in", name: "Alice Dev Squad" },
      { email: "bob@vitstudent.ac.in", name: "Bob's Code Warriors" },
      { email: "charlie@vitstudent.ac.in", name: "Charlie's Tech Team" },
      { email: "diana@vitstudent.ac.in", name: "Diana's Coders" },
    ];

    const teamIds: mongoose.Types.ObjectId[] = [team1._id];

    for (let i = 0; i < teamMembers.length; i++) {
      const user = await User.create({
        email: teamMembers[i].email,
        role: "team",
      });

      const team = await Team.create({
        team_name: teamMembers[i].name,
        track: i % 2 === 0 ? "Web Development" : "Mobile Development",
        is_locked: false,
        is_shortlisted: false,
        is_eliminated: false,
      });

      await User.updateOne({ _id: user._id }, { team_id: team._id });
      teamIds.push(team._id);
      console.log(`✓ Created Team ${i + 2} - ${teamMembers[i].name}`);
    }

    // Create Rounds
    const now = new Date();
    const round1StartTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const round1EndTime = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days from now

    const round2StartTime = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const round2EndTime = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    const round1 = await Round.create({
      round_number: 1,
      start_time: round1StartTime,
      end_time: round1EndTime,
      is_active: true,
      submission_enabled: true,
      instructions:
        "Build a responsive web application that solves a real-world problem.",
    });
    console.log("✓ Created Round 1");

    const round2 = await Round.create({
      round_number: 2,
      start_time: round2StartTime,
      end_time: round2EndTime,
      is_active: false,
      submission_enabled: false,
      instructions:
        "Enhance your solution with advanced features and optimizations.",
    });
    console.log("✓ Created Round 2");

    // Update teams with accessible rounds
    await Team.updateMany(
      { _id: { $in: teamIds } },
      { rounds_accessible: [round1._id, round2._id] },
    );

    // Create Subtasks for Round 1
    const subtask1_1 = await Subtask.create({
      title: "API Development",
      description: "Create a RESTful API with Express.js",
      track: "Web Development",
      round_id: round1._id,
      is_active: true,
      statement:
        "Build a complete REST API with:\n- Authentication\n- CRUD operations\n- Error handling\n- Input validation",
    });

    const subtask1_2 = await Subtask.create({
      title: "React Frontend",
      description: "Build a modern React dashboard",
      track: "Web Development",
      round_id: round1._id,
      is_active: true,
      statement:
        "Create a React application with:\n- Component architecture\n- State management\n- API integration\n- Responsive design",
    });

    const subtask1_3 = await Subtask.create({
      title: "Mobile App",
      description: "Develop a React Native mobile application",
      track: "Mobile Development",
      round_id: round1._id,
      is_active: true,
      statement:
        "Build a mobile app with:\n- Navigation setup\n- User authentication\n- Local storage\n- Push notifications",
    });

    console.log("✓ Created Subtasks for Round 1");

    // Create Subtasks for Round 2
    const subtask2_1 = await Subtask.create({
      title: "Database Optimization",
      description: "Optimize database queries and schema",
      track: "Web Development",
      round_id: round2._id,
      is_active: true,
      statement:
        "Optimize your database:\n- Index creation\n- Query optimization\n- Caching strategy\n- Performance monitoring",
    });

    const subtask2_2 = await Subtask.create({
      title: "UI/UX Enhancement",
      description: "Improve user interface and experience",
      track: "Web Development",
      round_id: round2._id,
      is_active: true,
      statement:
        "Enhance UI/UX:\n- Design improvements\n- Accessibility\n- Animation\n- User feedback",
    });

    console.log("✓ Created Subtasks for Round 2");

    // Create Judge Assignments for Round 1
    for (const teamId of teamIds) {
      await JudgeAssignment.create({
        judge_id: judge._id,
        team_id: teamId,
        round_id: round1._id,
      });
    }
    console.log("✓ Created Judge Assignments");

    // Create Sample Team Subtask Selections
    await TeamSubtaskSelection.create({
      team_id: team1._id,
      round_id: round1._id,
      subtask_id: subtask1_1._id,
    });
    console.log("✓ Created Team Subtask Selections");

    const result = {
      admin: {
        email: "sasanklearner@gmail.com",
        role: "admin",
      },
      judge: {
        email: "sasank.v.16@gmail.com",
        role: "judge",
      },
      teams: [
        {
          email: "sasank.v2023@vitstudent.ac.in",
          teamName: "Code Ninjas",
          role: "team",
        },
        ...teamMembers.map((member, i) => ({
          email: member.email,
          teamName: member.name,
          role: "team",
        })),
      ],
      rounds: [
        {
          number: 1,
          status: "active",
          startTime: round1StartTime,
          endTime: round1EndTime,
        },
        {
          number: 2,
          status: "inactive",
          startTime: round2StartTime,
          endTime: round2EndTime,
        },
      ],
    };

    return {
      success: true,
      message: "Database seeded successfully!",
      data: result,
    };
  } catch (error: any) {
    console.error("❌ Seed Error:", error);
    return {
      success: false,
      message: `Seed failed: ${error.message}`,
    };
  }
}

export default seedDatabase;
