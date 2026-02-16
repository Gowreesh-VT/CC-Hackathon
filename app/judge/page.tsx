"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define types
type TeamAssignment = {
  id: string;
  name: string;
  status: 'pending' | 'scored';
  roundId: string;
  score?: number;
  lastUpdated: string;
};

export default function JudgeHomePage() {
  const router = useRouter();
  
  // State for teams and loading
  const [assignedTeams, setAssignedTeams] = useState<TeamAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const res = await fetch(`/api/judge/assigned-teams`);
      const data = await res.json();
      
      if (data.data) {
        const mapped = data.data.map((t: any) => ({
          id: t.team_id,
          name: t.team_name,
          status: t.status,
          roundId: t.round_id || "active", // Fallback if API doesn't return it
          lastUpdated: "Just now" 
        }));
        setAssignedTeams(mapped);
      }
    } catch (error) {
      console.error("Failed to fetch teams", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Removed hardcoded currentRound
  const pendingCount = assignedTeams.filter(t => t.status === 'pending').length;

  // Handle team click - navigate to evaluation page
  const handleTeamClick = (team: TeamAssignment) => {
    router.push(`/judge/${team.roundId}?team_id=${team.id}`);
  };

  // Get status badge styling
  const getStatusBadge = (status: TeamAssignment['status'], score?: number) => {
    if (status === 'scored') {
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-400',
        label: 'SCORED',
        description: score ? `Score: ${score}` : 'Review complete',
        pulse: false,
        hoverBorder: 'hover:border-emerald-500/50',
        hoverShadow: 'hover:shadow-emerald-500/10',
        accentFrom: 'from-emerald-400'
      };
    }
    return {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      border: 'border-yellow-500/20',
      dot: 'bg-yellow-400',
      label: 'PENDING',
      description: 'Awaiting review',
      pulse: true,
      hoverBorder: 'hover:border-yellow-500/50',
      hoverShadow: 'hover:shadow-yellow-500/10',
      accentFrom: 'from-yellow-400'
    };
  };

  // Get team avatar color
  const getTeamColor = (index: number) => {
    const colors = ['cyan', 'violet', 'fuchsia', 'emerald'];
    return colors[index % colors.length];
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px] animate-pulse" />

      {/* Content */}
      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        {/* Header */}
        <div className="mb-4 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-300 tracking-wider">JUDGE PORTAL</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Evaluation Dashboard
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">Review and score your assigned teams</p>
        </div>

        {/* Assigned Teams Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Assigned Teams</h2>
                    <p className="text-xs font-mono text-slate-500">YOUR_QUEUE: {assignedTeams.length}</p>
                  </div>
                </div>
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400 border border-cyan-500/20">
                  ACTIVE ROUND
                </span>
              </div>

              {/* Teams List */}
              <div className="space-y-3">
                {assignedTeams.map((team, index) => {
                  const statusBadge = getStatusBadge(team.status, team.score);
                  const color = getTeamColor(index);
                  
                  return (
                    <div 
                      key={team.id}
                      onClick={() => handleTeamClick(team)}
                      className={`group/card relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 ${statusBadge.hoverBorder} hover:bg-slate-800/70 hover:shadow-lg ${statusBadge.hoverShadow} cursor-pointer`}
                    >
                      <div className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b ${statusBadge.accentFrom} to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-500/10 border border-${color}-500/20 group-hover/card:bg-${color}-500/20 group-hover/card:border-${color}-500/40 transition-all duration-300`}>
                            <span className={`text-lg font-bold text-${color}-400`}>{team.name.charAt(5)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-base">{team.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center gap-1.5 rounded-full ${statusBadge.bg} px-2.5 py-1 text-xs font-mono ${statusBadge.text} border ${statusBadge.border}`}>
                                <div className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot} ${statusBadge.pulse ? 'animate-pulse' : ''}`} />
                                {statusBadge.label}
                              </span>
                              <span className="text-xs font-mono text-slate-500">{statusBadge.description}</span>
                            </div>
                          </div>
                        </div>
                        
                        <button className={`flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-${color}-500/50 hover:bg-slate-700/50 hover:text-${color}-400`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <div className={`h-1.5 w-1.5 rounded-full ${pendingCount > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span>{pendingCount > 0 ? `${pendingCount} pending evaluation${pendingCount > 1 ? 's' : ''}` : 'All evaluations complete'}</span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Last updated: {assignedTeams[0]?.lastUpdated || 'Just now'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}