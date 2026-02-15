"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define types
type TeamInfo = {
  name: string;
  track: string;
  currentRound: string;
  roundStatus: 'active' | 'upcoming' | 'completed';
};

type RoundInfo = {
  endTime: Date;
  instructions: string[];
};

export default function TeamDashboardPage() {
  const router = useRouter();
  
  // Mock team data
  const [teamInfo] = useState<TeamInfo>({
    name: "Team Alpha",
    track: "AI & Machine Learning",
    currentRound: "Round 2",
    roundStatus: "active"
  });

  // Mock round data - in production, this endTime comes from backend API
  const [roundInfo] = useState<RoundInfo>({
    // Backend should provide the exact end timestamp
    // Example: endTime: new Date('2024-12-31T23:59:59Z')
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), // 2 days 5 hours from now
    instructions: [
      "Select one of the two available subtasks for this round",
      "Complete your chosen task and prepare your submission",
      "Upload your submission as a PDF document before the deadline",
      "Ensure all team members review the submission before finalizing"
    ]
  });

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Update countdown every second
  // This calculates time remaining based on backend-provided endTime
  // The countdown persists across refreshes because it's calculated from the fixed endTime
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = roundInfo.endTime.getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    };

    // Calculate immediately on mount
    updateCountdown();
    
    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [roundInfo.endTime]);

  // Navigate to rounds page
  const handleGoToRounds = () => {
    router.push('/team/rounds');
  };

  // Get status badge
  const getStatusBadge = () => {
    switch (teamInfo.roundStatus) {
      case 'active':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          label: 'ACTIVE',
          pulse: true
        };
      case 'upcoming':
        return {
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          border: 'border-cyan-500/20',
          label: 'UPCOMING',
          pulse: false
        };
      case 'completed':
        return {
          bg: 'bg-slate-600/30',
          text: 'text-slate-400',
          border: 'border-slate-600/20',
          label: 'COMPLETED',
          pulse: false
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />

      {/* Content */}
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        {/* Header */}
        <div className="mb-4 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
            <span className="text-xs font-mono text-fuchsia-300 tracking-wider">TEAM PORTAL</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Team Dashboard
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">Track your progress and manage submissions</p>
        </div>

        {/* Team Snapshot Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Team Snapshot</h2>
                  <p className="text-xs font-mono text-slate-500">TEAM_PROFILE</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="text-xs font-mono text-slate-500 mb-2">TEAM NAME</div>
                  <div className="text-lg font-bold text-white">{teamInfo.name}</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="text-xs font-mono text-slate-500 mb-2">TRACK</div>
                  <div className="text-lg font-bold text-white">{teamInfo.track}</div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="text-xs font-mono text-slate-500 mb-2">CURRENT ROUND</div>
                  <div className="text-lg font-bold text-white">{teamInfo.currentRound}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Round Countdown Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Round Countdown</h2>
                    <p className="text-xs font-mono text-slate-500">TIME_REMAINING</p>
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 rounded-full ${statusBadge.bg} px-3 py-1.5 text-xs font-mono ${statusBadge.text} border ${statusBadge.border}`}>
                  {statusBadge.pulse && <div className={`h-1.5 w-1.5 rounded-full ${statusBadge.text.replace('text-', 'bg-')} animate-pulse`} />}
                  {statusBadge.label}
                </span>
              </div>

              {/* Countdown Display */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{timeRemaining.days}</div>
                  <div className="text-xs font-mono text-slate-500">DAYS</div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{timeRemaining.hours}</div>
                  <div className="text-xs font-mono text-slate-500">HOURS</div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{timeRemaining.minutes}</div>
                  <div className="text-xs font-mono text-slate-500">MINUTES</div>
                </div>

                <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{timeRemaining.seconds}</div>
                  <div className="text-xs font-mono text-slate-500">SECONDS</div>
                </div>
              </div>

              <div className="mt-4 text-center text-sm text-slate-400 font-mono">
                Deadline: {roundInfo.endTime.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-violet-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                  <svg className="h-5 w-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Instructions</h2>
                  <p className="text-xs font-mono text-slate-500">ROUND_GUIDELINES</p>
                </div>
              </div>

              <div className="space-y-3">
                {roundInfo.instructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20">
                        <span className="text-xs font-bold text-fuchsia-400">{index + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{instruction}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGoToRounds}
            className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.98]"
          >
            <div className="relative flex items-center gap-2 rounded-[10px] bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 group-hover/btn:bg-slate-900/50">
              <span>Go to Rounds</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}