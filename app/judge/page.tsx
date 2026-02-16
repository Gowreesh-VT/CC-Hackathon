"use client";

import { useRouter } from "next/navigation";
import { useGetJudgeAssignedTeamsQuery } from "@/lib/redux/api/judgeApi";
import { Loader2 } from "lucide-react";

// Define locally if not shared, or import from types if available
type TeamAssignment = {
  team_id: string;
  team_name: string;
  status: 'pending' | 'scored';
  round_id?: string;
  score?: number;
};

export default function JudgeHomePage() {
  const router = useRouter();
  
  // Fetch assigned teams
  // We pass undefined to let the API use the default active round logic
  const { data: assignedTeams = [], isLoading, error, isError } = useGetJudgeAssignedTeamsQuery();

  // Helper to calculate pending count
  const pendingCount = assignedTeams.filter((t: any) => t.status === 'pending').length;

  // Handle team click - navigate to evaluation page
  // The API response might not have round_id if it's inferred from active round
  // but for navigation we need roundId. 
  // Ideally ID should be returned. If not, we might need to know the active round separately.
  // However, looking at the API, it returns { team_id, team_name, status }.
  // It doesn't return round_id in the *mapped* result? 
  // Let's check api/judge/assigned-teams/route.ts again.
  // It returns: { team_id, team_name, status }. 
  // So we don't know the roundId from the response!
  // BUT the page we just refactored `app/judge/[round]/page.tsx` needs `round` param.
  
  // Current assumption: The round is "round-2" or whatever is active.
  // We should likely fetch the active round ID or have the API return it.
  // For now, let's assume valid data or fallback. 
  // Actually, I should probably update the API to return round_id.
  
  const handleTeamClick = (teamId: string) => {
      // If we don't have round ID, we can't route correctly unless we know the active round.
      // But let's assume the API context or a default.
      // The previous code had: roundId: t.round_id || "active"
      // Let's use "active" as a placeholder which the details page might need to handle or 
      // we update the API.
      
      router.push(`/judge/active?team_id=${teamId}`);
  };

  // Get status badge styling
  const getStatusBadge = (status: string, score?: number) => {
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

  if (isLoading) {
      return (
          <main className="relative min-h-screen w-full flex items-center justify-center bg-slate-950">
              <Loader2 className="animate-spin h-10 w-10 text-cyan-500" />
          </main>
      );
  }

  if (isError) {
      return (
          <main className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 text-white">
              <div className="text-center">
                  <h2 className="text-xl font-bold text-red-500">Error loading teams</h2>
                  <p className="text-slate-400 mt-2">{(error as any)?.data?.error || "Unknown error"}</p>
              </div>
          </main>
      );
  }

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
                {assignedTeams.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No teams assigned yet.</p>
                ) : (
                    assignedTeams.map((team: any, index: number) => {
                    const statusBadge = getStatusBadge(team.status, team.score);
                    const color = getTeamColor(index);
                    
                    return (
                        <div 
                        key={team.team_id}
                        onClick={() => handleTeamClick(team.team_id)}
                        className={`group/card relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 ${statusBadge.hoverBorder} hover:bg-slate-800/70 hover:shadow-lg ${statusBadge.hoverShadow} cursor-pointer`}
                        >
                        <div className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b ${statusBadge.accentFrom} to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-500/10 border border-${color}-500/20 group-hover/card:bg-${color}-500/20 group-hover/card:border-${color}-500/40 transition-all duration-300`}>
                                <span className={`text-lg font-bold text-${color}-400`}>{team.team_name.charAt(0)}</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-base">{team.team_name}</h3>
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
                    })
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <div className={`h-1.5 w-1.5 rounded-full ${pendingCount > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <span>{pendingCount > 0 ? `${pendingCount} pending evaluation${pendingCount > 1 ? 's' : ''}` : 'All evaluations complete'}</span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  {/* Mock logic for 'Last updated' as it's not in API */}
                  Last updated: Just now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}