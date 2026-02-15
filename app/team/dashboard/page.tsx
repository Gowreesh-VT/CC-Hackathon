"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Countdown from "../../../components/team/Countdown";
import InstructionCard from "../../../components/team/InstructionCard";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import Team from "@/models/Team";
import Round from "@/models/Round";

type Props = {};

export default async function Page({}: Props) {
  await connectDB();

  const session = await getServerSession(authOptions);

  const email = session?.user?.email ?? null;

  const user = email ? await User.findOne({ email }).lean() : null;
  const team = user?.team_id ? await Team.findById(user.team_id).lean() : null;

  const activeRound = await Round.findOne({ is_active: true }).lean();

  const teamName = team?.team_name ?? "Unknown Team";
  const track = team?.track ?? "-";
  const endTime = activeRound?.end_time
    ? new Date(activeRound.end_time).toISOString()
    : new Date(Date.now() + 1000 * 60 * 60).toISOString();
  const currentRound = activeRound;

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="text-sm text-gray-400">Team</div>
            <div className="text-2xl md:text-3xl font-bold">
              {teamName} — <span className="text-lime-400">{track}</span>
            </div>
          </div>

          <div className="mt-3 md:mt-0">
            <Countdown endTime={endTime} />
          </div>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <InstructionCard
              status={currentRound?.is_active ? "ready" : "locked"}
            />
            <div className="mt-3 text-sm text-gray-300">
              {currentRound?.round_number
                ? `Round ${currentRound.round_number} —`
                : "No active round"}{" "}
              {currentRound?.is_active ? "Active now" : ""}
            </div>
            <div className="mt-4">
              <a
                href="/team/rounds"
                className="inline-block bg-lime-500 text-black px-4 py-2 rounded-md"
              >
                View Rounds
              </a>
            </div>
          </div>

          <aside className="hidden md:block">
            <div className="rounded-lg bg-neutral-900 p-4 border border-neutral-800">
              <div className="text-xs text-gray-400">Current Round</div>
              <div className="font-semibold text-white mt-1">
                {currentRound ? `Round ${currentRound.round_number}` : "—"}
              </div>
              <div className="text-sm mt-2">
                <span className="text-gray-300">Status:- </span>
                <span
                  className={`px-2 py-1 rounded ${
                    currentRound?.is_active
                      ? "bg-lime-600 text-black"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {currentRound?.is_active
                    ? "active"
                    : currentRound
                    ? "closed"
                    : "none"}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
