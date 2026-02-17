import { connectDB } from "@/config/db";
import User from "@/models/User";
import Team from "@/models/Team";
import Round from "@/models/Round";
import Judge from "@/models/Judge";
import Subtask from "@/models/Subtask";
import JudgeAssignment from "@/models/JudgeAssignment";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";
import Score from "@/models/Score";
import TeamSubtaskDisplay from "@/models/TeamSubtaskDisplay";
import ShortlistedTeam from "@/models/ShortlistedTeam";
import FinalTask from "@/models/FinalTask";
import mongoose from "mongoose";

interface ISeedResult {
  success: boolean;
  message: string;
  data?: any;
}

// Configuration - Easily change these values
const SEED_CONFIG = {
  admin: {
    email: "sasanklearner@gmail.com",
    role: "admin",
  },
  judge: {
    email: "sasank.v.16@gmail.com",
    role: "judge",
    name: "Judge Sasank",
  },
  teamLeader: {
    email: "sasank.v2023@vitstudent.ac.in",
    role: "team",
    teamName: "Code Ninjas",
    track: "Web Development",
  },
  teamMembers: [
    { email: "alice@vitstudent.ac.in", name: "Alice Dev Squad" },
    { email: "bob@vitstudent.ac.in", name: "Bob's Code Warriors" },
    { email: "charlie@vitstudent.ac.in", name: "Charlie's Tech Team" },
    { email: "diana@vitstudent.ac.in", name: "Diana's Coders" },
  ],
};

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
      Submission.deleteMany({}),
      Score.deleteMany({}),
      TeamSubtaskDisplay.deleteMany({}),
      ShortlistedTeam.deleteMany({}),
      FinalTask.deleteMany({}),
    ]);

    console.log("✓ Cleared existing data");

    // Create Users - Admin
    const adminUser = await User.create({
      email: SEED_CONFIG.admin.email,
      role: SEED_CONFIG.admin.role,
    });
    console.log("✓ Created Admin User");

    // Create Users - Judge
    const judgeUser = await User.create({
      email: SEED_CONFIG.judge.email,
      role: SEED_CONFIG.judge.role,
    });
    console.log("✓ Created Judge User");

    // Create Judge Profile
    const judge = await Judge.create({
      user_id: judgeUser._id,
      name: SEED_CONFIG.judge.name,
    });
    console.log("✓ Created Judge Profile");

    // Create Teams
    const teamLeaderUser = await User.create({
      email: SEED_CONFIG.teamLeader.email,
      role: SEED_CONFIG.teamLeader.role,
    });

    const team1 = await Team.create({
      team_name: SEED_CONFIG.teamLeader.teamName,
      track: SEED_CONFIG.teamLeader.track,
      is_locked: false,
      is_shortlisted: false,
      is_eliminated: false,
    });
    await User.updateOne({ _id: teamLeaderUser._id }, { team_id: team1._id });
    console.log("✓ Created Team 1 - " + SEED_CONFIG.teamLeader.teamName);

    // Create additional team members
    const teamIds: mongoose.Types.ObjectId[] = [team1._id];

    for (let i = 0; i < SEED_CONFIG.teamMembers.length; i++) {
      const user = await User.create({
        email: SEED_CONFIG.teamMembers[i].email,
        role: "team",
      });

      const team = await Team.create({
        team_name: SEED_CONFIG.teamMembers[i].name,
        track: i % 2 === 0 ? "Web Development" : "Mobile Development",
        is_locked: false,
        is_shortlisted: false,
        is_eliminated: false,
      });

      await User.updateOne({ _id: user._id }, { team_id: team._id });
      teamIds.push(team._id);
      console.log(
        `✓ Created Team ${i + 2} - ${SEED_CONFIG.teamMembers[i].name}`,
      );
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

    // Create Sample Submissions for Team 1
    const submission1 = await Submission.create({
      team_id: team1._id,
      round_id: round1._id,
      file_url: "https://docs.google.com/document/d/example1",
      github_link: "https://github.com/code-ninjas/api-project",
      overview:
        "Built a robust REST API using Express.js with JWT authentication, MongoDB integration, and comprehensive error handling. Includes endpoints for user management, data CRUD operations, and rate limiting.",
      submitted_at: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
      is_locked: false,
    });
    console.log("✓ Created Sample Submission 1");

    // Create Scores for Sample Submission
    const score1 = await Score.create({
      judge_id: judge._id,
      team_id: team1._id,
      round_id: round1._id,
      score: 8,
      remarks:
        "Excellent API design with proper error handling and authentication. Could improve on documentation and unit test coverage.",
      status: "scored",
    });
    console.log("✓ Created Sample Score 1");

    // Create additional submissions for other teams
    const submission2 = await Submission.create({
      team_id: teamIds[1],
      round_id: round1._id,
      file_url: "https://docs.google.com/document/d/example2",
      github_link: "https://github.com/alice-squad/react-dashboard",
      overview:
        "Created a modern React dashboard with Redux state management, Material-UI components, and real-time data updates. Features include user authentication, dark mode, and responsive design.",
      submitted_at: new Date(now.getTime() + 10 * 60 * 60 * 1000),
      is_locked: false,
    });

    const score2 = await Score.create({
      judge_id: judge._id,
      team_id: teamIds[1],
      round_id: round1._id,
      score: 7,
      remarks:
        "Good React practices and UI design. State management could be optimized. Missing some accessibility features.",
      status: "scored",
    });
    console.log("✓ Created Additional Sample Submissions and Scores");

    // Create TeamSubtaskDisplay for teams
    for (let i = 0; i < teamIds.length; i++) {
      await TeamSubtaskDisplay.create({
        team_id: teamIds[i],
        round_id: round1._id,
        subtask_id: [subtask1_1._id, subtask1_2._id][i % 2],
        shown_at: new Date(round1StartTime.getTime() + 1 * 60 * 60 * 1000),
      });
    }
    console.log("✓ Created Team Subtask Displays");

    // Create Shortlisted Teams
    const shortlistedTeam1 = await ShortlistedTeam.create({
      team_id: team1._id,
      round_id: round1._id,
      shortlisted_at: new Date(),
    });

    const shortlistedTeam2 = await ShortlistedTeam.create({
      team_id: teamIds[1],
      round_id: round1._id,
      shortlisted_at: new Date(),
    });
    console.log("✓ Created Shortlisted Teams");

    // Create Final Task
    const finalTask = await FinalTask.create({
      title: "Grand Finale: Build Complete Battle Management System",
      description:
        "Deploy a full-stack application that manages team battles with real-time updates, leaderboards, and analytics.",
      is_released: true,
      released_at: new Date(),
    });
    console.log("✓ Created Final Task");

    const result = {
      admin: {
        email: SEED_CONFIG.admin.email,
        role: SEED_CONFIG.admin.role,
      },
      judge: {
        email: SEED_CONFIG.judge.email,
        role: SEED_CONFIG.judge.role,
        name: SEED_CONFIG.judge.name,
      },
      teams: [
        {
          email: SEED_CONFIG.teamLeader.email,
          teamName: SEED_CONFIG.teamLeader.teamName,
          track: SEED_CONFIG.teamLeader.track,
          role: SEED_CONFIG.teamLeader.role,
          hasSubmission: true,
          hasScore: true,
          shortlisted: true,
        },
        ...SEED_CONFIG.teamMembers.map((member, i) => ({
          email: member.email,
          teamName: member.name,
          track: i % 2 === 0 ? "Web Development" : "Mobile Development",
          role: "team",
          hasSubmission: i === 0,
          hasScore: i === 0,
          shortlisted: i === 0,
        })),
      ],
      rounds: [
        {
          number: 1,
          status: "active",
          startTime: round1StartTime,
          endTime: round1EndTime,
          submissions: 2,
          scores: 2,
        },
        {
          number: 2,
          status: "inactive",
          startTime: round2StartTime,
          endTime: round2EndTime,
          submissions: 0,
          scores: 0,
        },
      ],
      subtasks: {
        round1: [
          {
            title: "API Development",
            track: "Web Development",
            description: "Create a RESTful API with Express.js",
          },
          {
            title: "React Frontend",
            track: "Web Development",
            description: "Build a modern React dashboard",
          },
          {
            title: "Mobile App",
            track: "Mobile Development",
            description: "Develop a React Native mobile application",
          },
        ],
        round2: [
          {
            title: "Database Optimization",
            track: "Web Development",
            description: "Optimize database queries and schema",
          },
          {
            title: "UI/UX Enhancement",
            track: "Web Development",
            description: "Improve user interface and experience",
          },
        ],
      },
      scores: [
        {
          team: "Code Ninjas",
          round: 1,
          score: 8,
          status: "scored",
          remarks:
            "Excellent API design with proper error handling and authentication.",
        },
        {
          team: "Alice Dev Squad",
          round: 1,
          score: 7,
          status: "scored",
          remarks:
            "Good React practices and UI design. Could optimize state management.",
        },
      ],
      finalTask: {
        title: "Grand Finale: Build Complete Battle Management System",
        description:
          "Deploy a full-stack application that manages team battles with real-time updates, leaderboards, and analytics.",
        released: true,
      },
      summary: {
        totalTeams: 5,
        totalRounds: 2,
        totalSubtasks: 5,
        submissionsCreated: 2,
        scoresCreated: 2,
        shortlistedTeams: 2,
      },
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
