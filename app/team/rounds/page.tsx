"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define types
type Round = {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'locked';
  description: string;
};

export default function TeamRoundsPage() {
  const router = useRouter();

  // Mock rounds data
  const [rounds] = useState<Round[]>([
    { id: "round-1", name: "Round 1", status: "completed", description: "Initial qualification round" },
    { id: "round-2", name: "Round 2", status: "active", description: "Technical implementation phase" },
    { id: "round-3", name: "Round 3", status: "locked", description: "Final presentation round" },
  ]);

  // Handle round click
  const handleRoundClick = (round: Round) => {
    if (round.status === 'locked') {
      alert(`${round.name} is not yet available`);
      return;
    }
    router.push(`/team/rounds/${round.id}`);
  };

  // Get status badge
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
      case 'locked':
        return {
          bg: 'bg-slate-600/30',
          text: 'text-slate-400',
          border: 'border-slate-600/20',
          label: 'LOCKED'
        };
    }
  };

  // Get round color
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
      <div className="absolute top-20 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />

      {/* Content */}
      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        {/* Header */}
        <div className="mb-4 space-y-4">
          <button 
            onClick={() => router.push('/team/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-mono">Back to Dashboard</span>
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-300 tracking-wider">ROUNDS OVERVIEW</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                All Rounds
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-sm">Navigate through competition stages</p>
          </div>
        </div>

        {/* Rounds Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Competition Rounds</h2>
                  <p className="text-xs font-mono text-slate-500">TOTAL: {rounds.length}</p>
                </div>
              </div>

              {/* Rounds List */}
              <div className="space-y-3">
                {rounds.map((round, index) => {
                  const color = getRoundColor(index);
                  const statusBadge = getStatusBadge(round.status);
                  const isClickable = round.status !== 'locked';
                  
                  return (
                    <div
                      key={round.id}
                      onClick={() => handleRoundClick(round)}
                      className={`group/card relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 ${
                        isClickable 
                          ? `hover:border-${color}-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-${color}-500/10 cursor-pointer` 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-${color}-400 to-transparent opacity-0 ${isClickable ? 'group-hover/card:opacity-100' : ''} transition-opacity duration-300`} />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-500/10 border border-${color}-500/20 ${isClickable ? `group-hover/card:bg-${color}-500/20 group-hover/card:border-${color}-500/40` : ''} transition-all duration-300`}>
                            <span className={`text-lg font-bold text-${color}-400`}>{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-base mb-1">{round.name}</h3>
                            <p className="text-xs text-slate-400">{round.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1.5 rounded-full ${statusBadge.bg} px-2.5 py-1 text-xs font-mono ${statusBadge.text} border ${statusBadge.border}`}>
                                {statusBadge.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {isClickable && (
                          <button className={`flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-${color}-500/50 hover:bg-slate-700/50 hover:text-${color}-400`}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                        
                        {!isClickable && (
                          <div className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/50">
                            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                <div className="text-xs font-mono text-slate-500">
                  {rounds.filter(r => r.status === 'active').length} active • {rounds.filter(r => r.status === 'completed').length} completed
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Click a round to view details
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}