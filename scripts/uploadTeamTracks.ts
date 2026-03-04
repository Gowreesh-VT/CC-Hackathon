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

const args = process.argv.slice(2);
const fileArgIndex = args.indexOf("--file");
const fileArg = fileArgIndex >= 0 ? args[fileArgIndex + 1] : undefined;

const CSV_FILE = fileArg
  ? path.resolve(process.cwd(), fileArg)
  : path.join(__dirname, "Additional_details.csv");

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

function parseCsvLine(line: string) {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      cols.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  cols.push(current.trim());
  return cols;
}

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "_");

const pickHeaderIndex = (headers: string[], aliases: string[]) => {
  for (const alias of aliases) {
    const idx = headers.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
};

async function run() {
  await connectDB();

  if (!fs.existsSync(CSV_FILE)) {
    console.error(`CSV file not found: ${CSV_FILE}`);
    process.exit(1);
  }

  const csv = fs.readFileSync(CSV_FILE, "utf-8");
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    console.error("CSV is empty or has no data rows.");
    process.exit(1);
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const teamNameIdx = pickHeaderIndex(headers, ["teamname", "team_name", "team"]);
  const emailIdx = pickHeaderIndex(headers, ["email", "email_address", "mail"]);
  const trackIdx = pickHeaderIndex(headers, ["tracks", "track", "track_name"]);
  const teamSizeIdx = pickHeaderIndex(headers, ["teamsize", "team_size", "size", "members"]);
  const mobileIdx = pickHeaderIndex(headers, [
    "mobilenumber",
    "mobile_number",
    "mobile",
    "phone",
    "phone_number",
    "contact_number",
    "team_lead_contact_number",
  ]);

  if (
    teamNameIdx < 0 ||
    emailIdx < 0 ||
    trackIdx < 0 ||
    teamSizeIdx < 0 ||
    mobileIdx < 0
  ) {
    console.error("Missing required columns.");
    console.error("Found headers:", headers.join(", "));
    process.exit(1);
  }

  const tracks = await Track.find({}).select("_id name").lean();
  const trackByName = new Map<string, any>();
  tracks.forEach((track: any) => {
    trackByName.set(String(track.name || "").trim().toLowerCase(), track);
  });

  let usersCreated = 0;
  let teamsCreated = 0;
  let teamsUpdated = 0;
  let teamsUnchanged = 0;
  let skipped = 0;
  const createdTeams: Array<{ team_name: string; email: string }> = [];
  const updatedTeams: Array<{ team_name: string; email: string }> = [];
  const unchangedTeams: Array<{ team_name: string; email: string }> = [];
  const skippedRows: Array<{
    row: number;
    reason: string;
    team_name: string;
    email: string;
  }> = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const team_name = (cols[teamNameIdx] || "").trim();
    const email = (cols[emailIdx] || "").trim().toLowerCase();
    const track_name = (cols[trackIdx] || "").trim();
    const mobile_number = (cols[mobileIdx] || "").trim();
    const team_size_raw = (cols[teamSizeIdx] || "").trim();
    const team_size = Number(team_size_raw);

    if (!team_name || !email || !track_name || !mobile_number || !team_size_raw) {
      console.log(`Skipped row ${i + 1}: Missing required values`);
      skipped += 1;
      skippedRows.push({
        row: i + 1,
        reason: "Missing required values",
        team_name,
        email,
      });
      continue;
    }

    if (!Number.isFinite(team_size) || team_size < 1) {
      console.log(`Skipped row ${i + 1}: Invalid teamSize "${team_size_raw}"`);
      skipped += 1;
      skippedRows.push({
        row: i + 1,
        reason: `Invalid teamSize "${team_size_raw}"`,
        team_name,
        email,
      });
      continue;
    }

    try {
      const track = trackByName.get(track_name.toLowerCase());
      if (!track) {
        console.log(`Skipped row ${i + 1}: Track not found -> ${track_name}`);
        skipped += 1;
        skippedRows.push({
          row: i + 1,
          reason: `Track not found -> ${track_name}`,
          team_name,
          email,
        });
        continue;
      }

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          role: "team",
        });
        usersCreated += 1;
        console.log(`User created -> ${email}`);
      }

      let team = await Team.findOne({ user_id: user._id });
      if (!team) {
        team = await Team.findOne({ team_name });
      }

      if (!team) {
        team = await Team.create({
          team_name,
          user_id: user._id,
          track_id: track._id,
          mobile_number,
          team_size: Math.trunc(team_size),
          rounds_accessible: [],
        });

        teamsCreated += 1;
        createdTeams.push({ team_name, email });
        console.log(`Team created -> ${team_name}`);
      } else {
        let changed = false;

        if (team.team_name !== team_name) {
          team.team_name = team_name;
          changed = true;
        }
        if (team.track_id?.toString() !== track._id.toString()) {
          team.track_id = track._id;
          changed = true;
        }
        if ((team.mobile_number || "") !== mobile_number) {
          team.mobile_number = mobile_number;
          changed = true;
        }
        if ((team.team_size || 0) !== Math.trunc(team_size)) {
          team.team_size = Math.trunc(team_size);
          changed = true;
        }

        if (changed) {
          await team.save();
          teamsUpdated += 1;
          updatedTeams.push({ team_name, email });
          console.log(`Team updated -> ${team_name}`);
        } else {
          teamsUnchanged += 1;
          unchangedTeams.push({ team_name, email });
          console.log(`Unchanged -> ${team_name}`);
        }
      }

      if (!user.team_id || user.team_id.toString() !== team._id.toString()) {
        user.team_id = team._id;
        await user.save();
      }
    } catch (err) {
      console.error(`Error row ${i + 1}:`, err);
      skipped += 1;
      skippedRows.push({
        row: i + 1,
        reason: "Unexpected error",
        team_name,
        email,
      });
    }
  }

  console.log("\nDONE");
  console.log("CSV file:", CSV_FILE);
  console.log("Users created:", usersCreated);
  console.log("Teams created:", teamsCreated);
  console.log("Teams updated:", teamsUpdated);
  console.log("Teams unchanged:", teamsUnchanged);
  console.log("Skipped:", skipped);

  if (skippedRows.length > 0) {
    console.log("\nSkipped rows (first 20):");
    skippedRows.slice(0, 20).forEach((s) => {
      console.log(
        `  row ${s.row}: ${s.reason} | team="${s.team_name}" | email="${s.email}"`,
      );
    });
  }

  await mongoose.disconnect();
  process.exit(0);
}

run();
