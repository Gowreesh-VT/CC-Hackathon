"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define round type
type Round = {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
  submissions: number;
};

export default function AdminRoundsPage() {
  const router = useRouter();
  const [isCreatingRound, setIsCreatingRound] = useState(false);
  
  // Mock rounds data - would come from API
  const [rounds, setRounds] = useState<Round[]>([
    { id: "round-1", name: "Round 1", status: "completed", submissions: 24 },
    { id: "round-2", name: "Round 2", status: "active", submissions: 18 },
    { id: "round-3", name: "Round 3", status: "pending", submissions: 0 },
  ]);

  // Handle round click - navigate to detail page
  const handleRoundClick = (roundId: string) => {
    router.push(`/admin/round/${roundId}`);
  };

  // Handle create round
const handleCreateRound = async () => {
  setIsCreatingRound(true);
  try {
    const response = await fetch('/api/rounds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Round ${rounds.length + 1}`,
        status: 'pending'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create round');
    }

    const newRound: Round = await response.json();
    
    setRounds([...rounds, newRound]);
    console.log("Created new round:", newRound);
    
    // Optionally navigate to the new round
    // router.push(`/admin/round/${newRound.id}`);
  } catch (error) {
    console.error("Failed to create round:", error);
    alert("Failed to create round. Please try again.");
  } finally {
    setIsCreatingRound(false);
  }
};
  // Get status badge styling
  const getStatusBadge = (status: Round['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          label: 'COMPLETED'
        };
      case 'active':
        return {
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          border: 'border-cyan-500/20',
          label: 'ACTIVE'
        };
      case 'pending':
        return {
          bg: 'bg-slate-600/30',
          text: 'text-slate-400',
          border: 'border-slate-600/20',
          label: 'PENDING'
        };
    }
  };

  // Get round icon color
  const getRoundColor = (index: number) => {
    const colors = ['cyan', 'violet', 'fuchsia'];
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
            <span className="text-xs font-mono text-cyan-300 tracking-wider">ROUNDS MANAGEMENT</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Competition Rounds
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">Configure and manage hackathon rounds</p>
        </div>

        {/* Rounds Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Rounds</h2>
                    <p className="text-xs font-mono text-slate-500">TOTAL: {rounds.length}</p>
                  </div>
                </div>
                
                {/* Create Round Button */}
                <button 
                  onClick={handleCreateRound}
                  disabled={isCreatingRound}
                  className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center gap-2 rounded-[10px] bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 group-hover/btn:bg-slate-900/50">
                    {isCreatingRound ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    <span>{isCreatingRound ? 'Creating...' : 'Create round'}</span>
                  </div>
                </button>
              </div>

              {/* Rounds List */}
              <div className="space-y-3">
                {rounds.map((round, index) => {
                  const color = getRoundColor(index);
                  const statusBadge = getStatusBadge(round.status);
                  
                  return (
                    <div 
                      key={round.id}
                      onClick={() => handleRoundClick(round.id)}
                      className={`group/card relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 hover:border-${color}-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-${color}-500/10 cursor-pointer`}
                    >
                      <div className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-${color}-400 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-500/10 border border-${color}-500/20 group-hover/card:bg-${color}-500/20 group-hover/card:border-${color}-500/40 transition-all duration-300`}>
                            <span className={`text-lg font-bold text-${color}-400`}>{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-base">{round.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`rounded-full ${statusBadge.bg} px-2 py-0.5 text-[10px] font-mono ${statusBadge.text} border ${statusBadge.border}`}>
                                {statusBadge.label}
                              </span>
                              <span className="text-xs font-mono text-slate-500">{round.submissions} submissions</span>
                            </div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleRoundClick(round.id);
                          }}
                          className={`flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-${color}-500/50 hover:bg-slate-700/50 hover:text-${color}-400`}
                        >
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
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Live updates enabled</span>
                </div>
                <div className="text-xs font-mono text-slate-500">
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