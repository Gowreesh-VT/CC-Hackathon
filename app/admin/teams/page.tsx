"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define team type
type Team = {
  id: string;
  name: string;
  score: number;
  scoreTrend: 'up' | 'down' | 'neutral';
  submissionStatus: 'submitted' | 'in-progress' | 'pending';
  currentRound: string;
  track: string;
  isLocked: boolean;
  isShortlisted: boolean;
  isEliminated: boolean;
};

export default function AdminTeamsPage() {
  // State management
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const teamsPerPage = 4;

  // Mock teams data - would come from API
  const [teams, setTeams] = useState<Team[]>([
    { id: "team-alpha", name: "Team Alpha", score: 72, scoreTrend: "up", submissionStatus: "submitted", currentRound: "Round 2", track: "AI", isLocked: false, isShortlisted: false, isEliminated: false },
    { id: "team-beta", name: "Team Beta", score: 85, scoreTrend: "up", submissionStatus: "in-progress", currentRound: "Round 2", track: "WEB3", isLocked: false, isShortlisted: false, isEliminated: false },
    { id: "team-gamma", name: "Team Gamma", score: 64, scoreTrend: "neutral", submissionStatus: "pending", currentRound: "Round 1", track: "FINTECH", isLocked: false, isShortlisted: false, isEliminated: false },
    { id: "team-delta", name: "Team Delta", score: 91, scoreTrend: "up", submissionStatus: "submitted", currentRound: "Round 2", track: "AI", isLocked: false, isShortlisted: false, isEliminated: false },
  ]);

  // Pagination
  const totalPages = Math.ceil(teams.length / teamsPerPage);
  const startIndex = (currentPage - 1) * teamsPerPage;
  const endIndex = startIndex + teamsPerPage;
  const currentTeams = teams.slice(startIndex, endIndex);

  // Handle team row click
  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(selectedTeamId === teamId ? null : teamId);
  };

  // Handle lock submissions
  const handleLockSubmissions = async () => {
    if (!selectedTeamId) {
      alert("Please select a team first");
      return;
    }

    const confirmed = window.confirm(`Lock submissions for ${teams.find(t => t.id === selectedTeamId)?.name}?`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeams(prev => prev.map(team => 
        team.id === selectedTeamId ? { ...team, isLocked: !team.isLocked } : team
      ));
      console.log("Toggled lock for team:", selectedTeamId);
    } catch (error) {
      console.error("Failed to lock submissions:", error);
      alert("Failed to lock submissions");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle shortlist
  const handleShortlist = async () => {
    if (!selectedTeamId) {
      alert("Please select a team first");
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeams(prev => prev.map(team => 
        team.id === selectedTeamId ? { ...team, isShortlisted: !team.isShortlisted } : team
      ));
      console.log("Toggled shortlist for team:", selectedTeamId);
    } catch (error) {
      console.error("Failed to shortlist:", error);
      alert("Failed to shortlist team");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle eliminate
  const handleEliminate = async () => {
    if (!selectedTeamId) {
      alert("Please select a team first");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to eliminate ${teams.find(t => t.id === selectedTeamId)?.name}? This action is serious.`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTeams(prev => prev.map(team => 
        team.id === selectedTeamId ? { ...team, isEliminated: !team.isEliminated } : team
      ));
      console.log("Toggled elimination for team:", selectedTeamId);
    } catch (error) {
      console.error("Failed to eliminate:", error);
      alert("Failed to eliminate team");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit details
  const handleEditDetails = () => {
    if (!selectedTeamId) {
      alert("Please select a team first");
      return;
    }

    const team = teams.find(t => t.id === selectedTeamId);
    console.log("Edit team:", team);
    // In production, open a modal or navigate to edit page
    alert(`Edit details for ${team?.name}`);
  };

  // Handle pagination
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Get submission status badge
  const getSubmissionStatusBadge = (status: Team['submissionStatus']) => {
    switch (status) {
      case 'submitted':
        return {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          dot: 'bg-emerald-400',
          label: 'SUBMITTED',
          pulse: false
        };
      case 'in-progress':
        return {
          bg: 'bg-cyan-500/10',
          text: 'text-cyan-400',
          border: 'border-cyan-500/20',
          dot: 'bg-cyan-400',
          label: 'IN PROGRESS',
          pulse: true
        };
      case 'pending':
        return {
          bg: 'bg-slate-600/30',
          text: 'text-slate-400',
          border: 'border-slate-600/20',
          dot: 'bg-slate-500',
          label: 'PENDING',
          pulse: false
        };
    }
  };

  // Get track badge color
  const getTrackColor = (track: string) => {
    const trackColors: Record<string, { bg: string; text: string; border: string }> = {
      'AI': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
      'WEB3': { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/20' },
      'FINTECH': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    };
    return trackColors[track] || trackColors['AI'];
  };

  // Get team avatar color
  const getTeamColor = (index: number) => {
    const colors = ['cyan', 'violet', 'fuchsia', 'emerald'];
    return colors[index % colors.length];
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId);

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
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
        {/* Header */}
        <div className="mb-4 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-mono text-violet-300 tracking-wider">TEAM REGISTRY</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Teams Database
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">Monitor and manage all participating teams</p>
        </div>

        {/* Teams Table Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Teams</h2>
                    <p className="text-xs font-mono text-slate-500">REGISTERED: {teams.length}</p>
                  </div>
                </div>
                
                {/* Selected team indicator */}
                {selectedTeamId && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">Selected:</span>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400 border border-cyan-500/20">
                      {selectedTeam?.name}
                    </span>
                    <button 
                      onClick={() => setSelectedTeamId(null)}
                      className="h-6 w-6 rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-red-500/50 hover:text-red-400 flex items-center justify-center"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">TEAM</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">SCORE</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">SUBMISSION STATUS</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">CURRENT ROUND</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">TRACK</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTeams.map((team, index) => {
                      const color = getTeamColor(index);
                      const statusBadge = getSubmissionStatusBadge(team.submissionStatus);
                      const trackColor = getTrackColor(team.track);
                      const isSelected = selectedTeamId === team.id;
                      
                      return (
                        <tr 
                          key={team.id}
                          onClick={() => handleTeamClick(team.id)}
                          className={`group/row border-b border-slate-800/50 transition-all duration-300 cursor-pointer ${
                            isSelected ? 'bg-slate-800/70 border-cyan-500/30' : 'hover:bg-slate-800/50'
                          } ${team.isEliminated ? 'opacity-50' : ''}`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-8 rounded-lg bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center transition-all duration-300 ${
                                isSelected ? `bg-${color}-500/30 border-${color}-500/40` : `group-hover/row:bg-${color}-500/20`
                              }`}>
                                <span className={`text-xs font-bold text-${color}-400`}>{team.name.charAt(5)}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-semibold text-white">{team.name}</span>
                                {team.isEliminated && (
                                  <span className="text-[10px] font-mono text-red-400">ELIMINATED</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-white">{team.score}</span>
                              <span className={`text-xs font-mono ${
                                team.scoreTrend === 'up' ? 'text-emerald-400' : 
                                team.scoreTrend === 'down' ? 'text-red-400' : 
                                'text-slate-500'
                              }`}>
                                {team.scoreTrend === 'up' ? '↑' : team.scoreTrend === 'down' ? '↓' : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 rounded-full ${statusBadge.bg} px-2.5 py-1 text-xs font-mono ${statusBadge.text} border ${statusBadge.border}`}>
                              <div className={`h-1.5 w-1.5 rounded-full ${statusBadge.dot} ${statusBadge.pulse ? 'animate-pulse' : ''}`} />
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-mono text-slate-300">{team.currentRound}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full ${trackColor.bg} px-2.5 py-1 text-xs font-mono ${trackColor.text} border ${trackColor.border}`}>
                              {team.track}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              {team.isLocked && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-mono text-yellow-400 border border-yellow-500/20">
                                  🔒 LOCKED
                                </span>
                              )}
                              {team.isShortlisted && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
                                  ⭐ SHORTLISTED
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-4">
                <div className="text-xs font-mono text-slate-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, teams.length)} of {teams.length} teams
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-700/50 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:text-slate-400"
                  >
                    <svg className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-700/50 hover:text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:text-slate-400"
                  >
                    <svg className="h-4 w-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Actions Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Team Actions</h2>
                  <p className="text-xs font-mono text-slate-500">BULK_OPERATIONS</p>
                </div>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                {selectedTeamId 
                  ? `Selected: ${selectedTeam?.name}. Choose an action below.`
                  : 'Click any team row to reveal actions like locking submissions or shortlisting.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleLockSubmissions}
                  disabled={!selectedTeamId || isLoading}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-yellow-500/50 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  <span>{selectedTeam?.isLocked ? 'Unlock' : 'Lock'} submissions</span>
                </button>

                <button 
                  onClick={handleShortlist}
                  disabled={!selectedTeamId || isLoading}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                  <span>{selectedTeam?.isShortlisted ? 'Remove from' : 'Add to'} shortlist</span>
                </button>

                <button 
                  onClick={handleEliminate}
                  disabled={!selectedTeamId || isLoading}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-red-500/50 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span>{selectedTeam?.isEliminated ? 'Restore' : 'Eliminate'}</span>
                </button>

                <button 
                  onClick={handleEditDetails}
                  disabled={!selectedTeamId || isLoading}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700 disabled:hover:shadow-none"
                >
                  <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <span>Edit details</span>
                </button>
              </div>

              {/* Info Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedTeamId ? 'Actions enabled for selected team' : 'Click any team row to activate controls'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}