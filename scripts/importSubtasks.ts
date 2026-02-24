import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Track from "../models/Track";
import Subtask from "../models/Subtask";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config();

const args = process.argv.slice(2);
const hasFlag = (name: string) => args.includes(`--${name}`);
const arg = (name: string, fallback?: string) => {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  return args[idx + 1] ?? fallback;
};

const csvFile = arg("file");
const apply = hasFlag("apply");

if (!csvFile) {
  console.error(
    "Usage: npx tsx scripts/importSubtasks.ts --file /absolute/path/to/csv [--apply]",
  );
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI missing. Set it in .env.local or environment.");
  process.exit(1);
}

const parseCsvLine = (line: string): string[] => {
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

const normalize = (value: string) => value.trim().replace(/\s+/g, " ");
const normalizeKey = (value: string) => normalize(value).toLowerCase();

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const splitTitleAndDescription = (raw: string) => {
  const text = normalize(raw);
  if (!text) {
    return { title: "", description: "" };
  }

  const colonIndex = text.indexOf(":");
  if (colonIndex > 0) {
    const title = normalize(text.slice(0, colonIndex));
    const description = normalize(text.slice(colonIndex + 1));
    return { title, description: description || text };
  }

  // Fallback if no colon: use first 80 chars as title, keep full as description
  const title = text.length > 80 ? `${text.slice(0, 80)}...` : text;
  return { title, description: text };
};

async function run() {
  await mongoose.connect(MONGODB_URI as string, {
    dbName: "cc_hackathon",
    bufferCommands: false,
  });

  const raw = fs.readFileSync(csvFile as string, "utf-8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    console.error("CSV file is empty.");
    process.exit(1);
  }

  const first = parseCsvLine(lines[0]).map((c) => normalizeKey(c));
  const hasHeader =
    first.some((c) => c.includes("track")) &&
    first.some(
      (c) =>
        c.includes("subtask") ||
        c.includes("description") ||
        c.includes("problem") ||
        c.includes("task"),
    );

  const startIndex = hasHeader ? 1 : 0;

  // Build existing (track_id + title) set to avoid duplicates.
  const existing = await Subtask.find({})
    .select("track_id title")
    .lean();
  const existingSet = new Set<string>(
    existing.map(
      (s) => `${s.track_id.toString()}::${normalizeKey(String(s.title || ""))}`,
    ),
  );

  let total = 0;
  let created = 0;
  let skipped = 0;
  let missingTrack = 0;
  let duplicate = 0;
  const addedSubtasks: Array<{ track: string; title: string }> = [];

  for (let i = startIndex; i < lines.length; i += 1) {
    total += 1;
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 2) {
      skipped += 1;
      continue;
    }

    const trackName = normalize(cols[0] || "");
    const rawSubtask = normalize(cols[1] || "");

    if (!trackName || !rawSubtask) {
      skipped += 1;
      continue;
    }

    const track = await Track.findOne({
      name: { $regex: new RegExp(`^${escapeRegex(trackName)}$`, "i") },
    })
      .select("_id name")
      .lean();

    if (!track) {
      missingTrack += 1;
      skipped += 1;
      console.log(`Skipped row ${i + 1}: track not found -> "${trackName}"`);
      continue;
    }

    const { title, description } = splitTitleAndDescription(rawSubtask);
    if (!title || !description) {
      skipped += 1;
      continue;
    }

    const key = `${track._id.toString()}::${normalizeKey(title)}`;
    if (existingSet.has(key)) {
      duplicate += 1;
      skipped += 1;
      continue;
    }

    if (apply) {
      await Subtask.create({
        title,
        description,
        track_id: track._id,
        is_active: true,
      });
    }

    existingSet.add(key);
    created += 1;
    addedSubtasks.push({ track: track.name, title });
  }

  await mongoose.disconnect();

  console.log("");
  console.log(`Mode: ${apply ? "APPLY (writes enabled)" : "DRY RUN (no writes)"}`);
  console.log(`Rows processed: ${total}`);
  console.log(`Subtasks to create${apply ? "d" : ""}: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Skipped (missing track): ${missingTrack}`);
  console.log(`Skipped (duplicate): ${duplicate}`);

  if (addedSubtasks.length > 0) {
    console.log("");
    console.log(
      `${apply ? "Added" : "Will add"} subtasks (${addedSubtasks.length}):`,
    );
    addedSubtasks.forEach((item, index) => {
      console.log(`${index + 1}. [${item.track}] ${item.title}`);
    });
  }
}

run().catch(async (error) => {
  console.error("Import failed:", error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
