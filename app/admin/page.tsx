"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminHomePage() {
  // State management
  const [selectedRound, setSelectedRound] = useState<string>("");
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [submissionsEnabled, setSubmissionsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState("2m ago");

  // Mock data - would come from API in production
  const [stats, setStats] = useState({
    totalTeams: 42,
    submissions: 128,
    avgScore: 8.4,
    currentRoundSubmissions: 34,
    pendingReviews: 12
  });

  // Handle round selection
  const handleRoundSelect = (value: string) => {
    setSelectedRound(value);
    // In production, fetch round-specific data here
    console.log("Selected round:", value);
  };

  // Handle start round
  const handleStartRound = async () => {
    if (!selectedRound) {
      alert("Please select a round first");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRoundActive(true);
      setSubmissionsEnabled(true);
      setLastSync("Just now");
      console.log("Round started:", selectedRound);
    } catch (error) {
      console.error("Failed to start round:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stop round
  const handleStopRound = async () => {
    if (!selectedRound) {
      alert("Please select a round first");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to stop this round? This will close submissions.");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRoundActive(false);
      setSubmissionsEnabled(false);
      setLastSync("Just now");
      console.log("Round stopped:", selectedRound);
    } catch (error) {
      console.error("Failed to stop round:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle submissions
  const handleToggleSubmissions = async () => {
    if (!selectedRound) {
      alert("Please select a round first");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSubmissionsEnabled(!submissionsEnabled);
      setLastSync("Just now");
      console.log("Submissions toggled:", !submissionsEnabled);
    } catch (error) {
      console.error("Failed to toggle submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />

      {/* Content */}
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        {/* Header */}
        <div className="mb-4 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-mono text-violet-300 tracking-wider">ADMIN CONSOLE</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Command Center
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">System administration and round control</p>
        </div>

        {/* Teams Overview Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Teams Overview</h2>
                    <p className="text-xs font-mono text-slate-500">AGGREGATE_METRICS</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400 border border-emerald-500/20">
                  LIVE
                </span>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                Quick glance at total teams, active submissions, and aggregate scores.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">TOTAL TEAMS</span>
                    <span className="text-xs font-mono text-cyan-400">↑ 8</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.totalTeams}</div>
                  <div className="mt-3 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 w-4/5" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">SUBMISSIONS</span>
                    <span className="text-xs font-mono text-emerald-400">↑ 12</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.submissions}</div>
                  <div className="mt-3 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 w-3/4" />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-500">AVG SCORE</span>
                    <span className="text-xs font-mono text-violet-400">↑ 5%</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stats.avgScore}</div>
                  <div className="mt-3 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 w-[84%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Round Status Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Current Round Status</h2>
                    <p className="text-xs font-mono text-slate-500">
                      {selectedRound ? selectedRound.toUpperCase().replace("-", "_") : "NO_ROUND_SELECTED"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isRoundActive && submissionsEnabled ? 'bg-emerald-400 animate-pulse' : isRoundActive ? 'bg-yellow-400' : 'bg-slate-500'}`} />
                  <span className={`text-xs font-mono ${isRoundActive && submissionsEnabled ? 'text-emerald-400' : isRoundActive ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {isRoundActive && submissionsEnabled ? 'ACCEPTING' : isRoundActive ? 'PAUSED' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                Live submission count and pending evaluation queue for this round.
              </p>

              {/* Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800/70">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-white">{stats.currentRoundSubmissions}</span>
                        <span className="text-xs font-mono text-slate-500">submissions</span>
                      </div>
                      <p className="text-xs text-slate-400">This round</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-slate-800/70">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                        <svg className="h-4 w-4 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-white">{stats.pendingReviews}</span>
                        <span className="text-xs font-mono text-slate-500">pending</span>
                      </div>
                      <p className="text-xs text-slate-400">Awaiting review</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Round Controls Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-violet-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                  <svg className="h-5 w-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Round Controls</h2>
                  <p className="text-xs font-mono text-slate-500">SYSTEM_MANAGEMENT</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Round Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 tracking-wider">SELECT ROUND</label>
                  <Select value={selectedRound} onValueChange={handleRoundSelect} disabled={isLoading}>
                    <SelectTrigger className="w-full border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800/70 hover:border-cyan-500/50 transition-all duration-300 h-12 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                      <SelectValue placeholder="Select a round" />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-slate-800 text-white">
                      <SelectItem value="round-1" className="hover:bg-slate-700 focus:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Round 1</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="round-2" className="hover:bg-slate-700 focus:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          <span>Round 2</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="round-3" className="hover:bg-slate-700 focus:bg-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                          <span>Round 3</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Control Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 tracking-wider">ACTIONS</label>
                  <div className="flex flex-wrap gap-3">
                    {/* Start Round Button */}
                    <button 
                      onClick={handleStartRound}
                      disabled={isLoading || !selectedRound || isRoundActive}
                      className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                      <div className="relative flex items-center gap-2 rounded-[10px] bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 group-hover/btn:bg-slate-900/50">
                        {isLoading && !isRoundActive ? (
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <span>Start round</span>
                      </div>
                    </button>

                    {/* Stop Round Button */}
                    <button 
                      onClick={handleStopRound}
                      disabled={isLoading || !selectedRound || !isRoundActive}
                      className="group/btn relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-red-500/50 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:shadow-none"
                    >
                      <div className="flex items-center gap-2">
                        {isLoading && isRoundActive ? (
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                          </svg>
                        )}
                        <span>Stop round</span>
                      </div>
                    </button>

                    {/* Toggle Submissions Button */}
                    <button 
                      onClick={handleToggleSubmissions}
                      disabled={isLoading || !selectedRound || !isRoundActive}
                      className="group/btn relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:shadow-none"
                    >
                      <div className="flex items-center gap-2">
                        {isLoading && isRoundActive && selectedRound ? (
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        )}
                        <span>{submissionsEnabled ? 'Disable' : 'Enable'} submissions</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Status Info */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <div className={`h-1.5 w-1.5 rounded-full ${isLoading ? 'bg-yellow-400' : 'bg-emerald-400'} animate-pulse`} />
                    <span>{isLoading ? 'Processing...' : 'System operational'}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    Last sync: {lastSync}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}