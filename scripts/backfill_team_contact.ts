import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Team from "../models/Team";
import User from "../models/User";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const args = process.argv.slice(2);
const arg = (name: string, fallback: string | undefined = undefined) => {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return args[idx + 1] ?? fallback;
};
const hasFlag = (name: string) => args.includes(`--${name}`);

const filePath = arg("file");
const apply = hasFlag("apply");
const noHeader = hasFlag("no-header");

if (!filePath) {
  console.error(
    "Usage: npx tsx scripts/backfill_team_contact.ts --file /absolute/path/to/file.csv [--apply] [--no-header]",
  );
  process.exit(1);
}

const resolveIndex = (value: string | undefined, fallback: number) => {
  if (value === undefined) return fallback;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
};

// 0-based indexes used only in --no-header mode
const emailIndex = resolveIndex(arg("email-index"), 1);
const teamNameIndex = resolveIndex(arg("team-name-index"), 0);
const mobileIndex = resolveIndex(arg("mobile-index"), 3);
const teamSizeIndex = resolveIndex(arg("team-size-index"), 4);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found. Set it in .env.local or environment.");
  process.exit(1);
}

const parseCsvLine = (line: string) => {
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
};

const normalizeHeader = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, "_");

const pickHeaderIndex = (headers: string[], aliases: string[]) => {
  for (const alias of aliases) {
    const idx = headers.indexOf(alias);
    if (idx !== -1) return idx;
  }
  return -1;
};

const main = async () => {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    console.error("CSV file is empty.");
    process.exit(1);
  }

  let startIndex = 0;
  let parsedHeaders: string[] = [];
  if (!noHeader) {
    parsedHeaders = parseCsvLine(lines[0]).map(normalizeHeader);
    startIndex = 1;
  }

  const effectiveEmailIndex = noHeader
    ? emailIndex
    : pickHeaderIndex(parsedHeaders, ["email", "email_id", "mail"]);
  const effectiveTeamNameIndex = noHeader
    ? teamNameIndex
    : pickHeaderIndex(parsedHeaders, ["team_name", "name", "team"]);
  const effectiveMobileIndex = noHeader
    ? mobileIndex
    : pickHeaderIndex(parsedHeaders, [
        "mobile_number",
        "mobilenumber",
        "mobile",
        "phone",
        "phone_number",
        "contact",
        "contact_number",
      ]);
  const effectiveTeamSizeIndex = noHeader
    ? teamSizeIndex
    : pickHeaderIndex(parsedHeaders, ["team_size", "teamsize", "size", "members"]);

  if (effectiveMobileIndex < 0 || effectiveTeamSizeIndex < 0) {
    console.error(
      "Could not detect mobile/team size columns. Use --no-header with --mobile-index and --team-size-index.",
    );
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, {
    dbName: "cc_hackathon",
    bufferCommands: false,
  });

  let totalRows = 0;
  let matchedTeams = 0;
  let updatedTeams = 0;
  let skippedRows = 0;

  const skipped = [];

  for (let i = startIndex; i < lines.length; i += 1) {
    totalRows += 1;
    const cols = parseCsvLine(lines[i]);

    const email = (cols[effectiveEmailIndex] ?? "").trim().toLowerCase();
    const teamName = (cols[effectiveTeamNameIndex] ?? "").trim();
    const mobile = (cols[effectiveMobileIndex] ?? "").trim();
    const teamSizeRaw = (cols[effectiveTeamSizeIndex] ?? "").trim();
    const teamSize = Number(teamSizeRaw);

    if (!mobile || !teamSizeRaw || !Number.isFinite(teamSize) || teamSize < 1) {
      skippedRows += 1;
      skipped.push({
        row: i + 1,
        reason: "Invalid mobile_number or team_size",
        email,
        teamName,
      });
      continue;
    }

    let teamDoc = null;

    if (email) {
      const user = await User.findOne({ email, role: "team" }).select("team_id").lean();
      if (user?.team_id) {
        teamDoc = await Team.findById(user.team_id);
      }
    }

    if (!teamDoc && teamName) {
      teamDoc = await Team.findOne({ team_name: teamName });
    }

    if (!teamDoc) {
      skippedRows += 1;
      skipped.push({
        row: i + 1,
        reason: "Team not found",
        email,
        teamName,
      });
      continue;
    }

    matchedTeams += 1;

    const nextMobile = mobile;
    const nextTeamSize = Math.trunc(teamSize);
    const needsUpdate =
      (teamDoc.mobile_number ?? "") !== nextMobile ||
      (teamDoc.team_size ?? null) !== nextTeamSize;

    if (!needsUpdate) continue;

    if (apply) {
      teamDoc.mobile_number = nextMobile;
      teamDoc.team_size = nextTeamSize;
      await teamDoc.save();
    }
    updatedTeams += 1;
  }

  await mongoose.disconnect();

  console.log("");
  console.log(`Mode: ${apply ? "APPLY (writes enabled)" : "DRY RUN (no writes)"}`);
  console.log(`Rows read: ${totalRows}`);
  console.log(`Teams matched: ${matchedTeams}`);
  console.log(`Teams to update${apply ? "d" : ""}: ${updatedTeams}`);
  console.log(`Rows skipped: ${skippedRows}`);

  if (skipped.length > 0) {
    console.log("");
    console.log("Skipped rows (first 20):");
    skipped.slice(0, 20).forEach((s) => {
      console.log(
        `  row ${s.row}: ${s.reason} | email="${s.email}" | team="${s.teamName}"`,
      );
    });
  }
};

main().catch(async (error) => {
  console.error("Backfill failed:", error);
  try {
    await mongoose.disconnect();
  } catch {
    // no-op
  }
  process.exit(1);
});
