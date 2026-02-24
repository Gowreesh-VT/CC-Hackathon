import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// load env vars
dotenv.config({ path: ".env.local" });

// import your existing User model
import User from "../models/User";

// recreate __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB URI
const MONGO_URI = process.env.MONGODB_URI as string;

// CSV file path
const CSV_FILE = path.join(__dirname, "participants_2.csv");

// connect to MongoDB
async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    await mongoose.connect(MONGO_URI, {
      dbName: "cc_hackathon",
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}

// bulk insert users
async function bulkAddUsers() {

  await connectDB();

  if (!fs.existsSync(CSV_FILE)) {
    console.error("❌ participants.csv not found");
    process.exit(1);
  }

  const csv = fs.readFileSync(CSV_FILE, "utf-8");

  const lines = csv.split("\n");

  let inserted = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {

    const line = lines[i].trim();

    if (!line) continue;

    const values = line.split(",");

    const email = values[0]?.trim();

    if (!email) continue;

    const role = values[1]?.trim() || "team";

    try {

      const exists = await User.findOne({ email });

      if (exists) {
        console.log("⏭ Skipped:", email);
        skipped++;
        continue;
      }

      await User.create({
        email,
        role,
        // created_at auto handled by schema
      });

      console.log("✅ Inserted:", email);
      inserted++;

    } catch (error) {
      console.error("❌ Error inserting:", email, error);
    }
  }

  console.log("\n🎉 Done!");
  console.log("Inserted:", inserted);
  console.log("Skipped:", skipped);

  process.exit(0);
}

// run script
bulkAddUsers();