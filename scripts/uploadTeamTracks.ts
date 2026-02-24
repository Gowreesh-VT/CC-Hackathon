import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config({ path: ".env.local" });

import User from "../models/User";
import Team from "../models/Team";
import Track from "../models/Track";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.join(__dirname, "parti_3.csv");

const MONGO_URI = process.env.MONGODB_URI as string;

if (!MONGO_URI) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected");
}

async function run() {

  await connectDB();

  const csv = fs.readFileSync(CSV_FILE, "utf-8");

  const lines = csv.split("\n");

  let usersCreated = 0;
  let teamsCreated = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {

    const line = lines[i].trim();

    if (!line) continue;

    const [team_name_raw, email_raw, track_name_raw] = line.split(",");

    const team_name = team_name_raw.trim();
    const email = email_raw.trim().toLowerCase();
    const track_name = track_name_raw.trim();

    try {

      // STEP 1: FIND TRACK (DO NOT CREATE)
      const track = await Track.findOne({ name: track_name });

      if (!track) {
        console.log(`Skipped: Track not found → ${track_name}`);
        skipped++;
        continue;
      }

      // STEP 2: FIND OR CREATE USER
      let user = await User.findOne({ email });

      if (!user) {

        user = await User.create({
          email,
          role: "team"
        });

        usersCreated++;

        console.log(`User created → ${email}`);

      }

      // STEP 3: CHECK IF TEAM EXISTS
      let team = await Team.findOne({ team_name });

      if (team) {

        console.log(`Skipped: Team already exists → ${team_name}`);
        skipped++;
        continue;

      }

      // STEP 4: CREATE TEAM
      team = await Team.create({
        team_name,
        user_id: user._id,
        track_id: track._id,
        rounds_accessible: []
      });

      teamsCreated++;

      console.log(`Team created → ${team_name}`);

      // STEP 5: UPDATE USER.team_id
      user.team_id = team._id;
      await user.save();

    }
    catch (err) {

      console.error("Error:", err);
      skipped++;

    }

  }

  console.log("\nDONE");
  console.log("Users created:", usersCreated);
  console.log("Teams created:", teamsCreated);
  console.log("Skipped:", skipped);

  process.exit(0);

}

run();