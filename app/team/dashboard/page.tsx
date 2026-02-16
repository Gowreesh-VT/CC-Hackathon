"use client";
import React from "react";
import CountDown from "../../../components/team/Countdown";
import InstructionCard from "../../../components/team/InstructionCard";
import Link from "next/link";
import { useGetTeamDashboardQuery } from "@/lib/redux/api/teamApi";
import { Loader2 } from "lucide-react";

export default function TeamDashboardPage() {
  const { data: dashboardData, isLoading } = useGetTeamDashboardQuery();

  if (isLoading) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-neutral-950">
              <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
          </div>
      );
  }

  // Fallback if data is missing or error
  const teamName = dashboardData?.team_name ?? "Unknown Team";
  const track = dashboardData?.track ?? "-";
  // The API returns 'current_round', not 'activeRound'
  const activeRound = dashboardData?.current_round;
  
  // Use current time + 1h if no end time, or data from API
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
            <CountDown endTime={endTime} />
          </div>
        </header>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <InstructionCard
              status={currentRound?.is_active ? "ready" : "locked"}
              instructions={currentRound?.instructions}
            />
            <div className="mt-3 text-sm text-gray-300">
              {currentRound?.round_number
                ? `Round ${currentRound.round_number} —`
                : "No active round"}{" "}
              {currentRound?.is_active ? "Active now" : ""}
            </div>
            <div className="mt-4 flex gap-3">
              <Link
                href="/team/rounds"
                className="inline-block bg-neutral-800 text-white border border-neutral-700 px-4 py-2 rounded-md hover:bg-neutral-700 transition-colors"
              >
                View Rounds
              </Link>
              {currentRound?.is_active && (
                <Link
                  href={`/team/rounds/${currentRound._id}`}
                  className="inline-block bg-lime-500 text-black border border-lime-600 px-4 py-2 rounded-md font-medium hover:bg-lime-400 transition-colors shadow-[0_0_15px_rgba(132,204,22,0.3)]"
                >
                  Submit Now
                </Link>
              )}
            </div>
          </div>

          <aside className="hidden md:block">
            {/* Status Panel - could be a separate component */}
            <div className="rounded-lg bg-neutral-900 p-4 border border-neutral-800">
              <div className="text-xs text-gray-400">Current Round</div>
              <div className="font-semibold text-white mt-1">
                {currentRound ? `Round ${currentRound.round_number}` : "—"}
              </div>
              <div className="text-sm mt-2">
                <span className="text-gray-300">Status: </span>
                <span
                  className={`px-2 py-1 rounded ml-2 ${
                    currentRound?.is_active
                      ? "bg-lime-600 text-black"
                      : "bg-gray-700 text-gray-200"
                  }`}
                >
                  {currentRound?.is_active
                    ? "Active"
                    : currentRound
                    ? "Closed"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
