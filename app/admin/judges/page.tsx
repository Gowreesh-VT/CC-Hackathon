"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Gavel, Plus, UserPlus, Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Judge, TeamDetail } from "@/lib/redux/api/types";
import {
  useGetJudgesQuery,
  useGetTeamsQuery,
  useCreateJudgeMutation,
  useDeleteJudgeMutation,
  useAssignTeamsToJudgeMutation,
} from "@/lib/redux/api/adminApi";
import { toast } from "sonner";

export default function AdminJudgesPage() {
  // State management
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);
  const [isAddingJudge, setIsAddingJudge] = useState(false);
  const [isAssigningTeams, setIsAssigningTeams] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  // RTK Query hooks
  const { data: judges = [], isLoading: isLoadingJudges } = useGetJudgesQuery();
  const { data: teams = [], isLoading: isLoadingTeams } = useGetTeamsQuery();
  const [createJudge] = useCreateJudgeMutation();
  const [deleteJudge] = useDeleteJudgeMutation();
  const [assignTeams] = useAssignTeamsToJudgeMutation();

  // Handle add judge
  const handleAddJudge = async () => {
    setIsAddingJudge(true);
    try {
      const judgeName = prompt("Enter judge name:");
      const judgeEmail = prompt("Enter judge email:");
      
      if (!judgeName || !judgeEmail) {
        setIsAddingJudge(false);
        return;
      }
      
      await createJudge({ name: judgeName, email: judgeEmail }).unwrap();
      toast.success(`Judge ${judgeName} added successfully!`);
    } catch (error) {
      console.error("Failed to add judge:", error);
      toast.error("Failed to add judge");
    } finally {
      setIsAddingJudge(false);
    }
  };

  // Handle judge row click
  const handleJudgeClick = (judgeId: string) => {
    setSelectedJudgeId(selectedJudgeId === judgeId ? null : judgeId);
  };

  // Handle assign teams
  const handleAssignTeams = () => {
    if (!selectedJudgeId) {
      toast.error("Please select a judge first");
      return;
    }
    setShowAssignmentModal(true);
  };

  // Handle team assignment toggle
  const selectedJudge = judges.find(j => j.id === selectedJudgeId);
  const [tempAssignedTeams, setTempAssignedTeams] = useState<string[]>([]);
  
  // When opening modal, initialize temp state
  const openAssignmentModal = () => {
      if (selectedJudge) {
          setTempAssignedTeams(selectedJudge.assignedTeams || []);
          setShowAssignmentModal(true);
      }
  };

  const handleToggleTeamSelection = (teamId: string) => {
      setTempAssignedTeams(prev => 
          prev.includes(teamId) 
            ? prev.filter(id => id !== teamId)
            : [...prev, teamId]
      );
  };

  const saveAssignments = async () => {
      if (!selectedJudgeId) return;
      setIsAssigningTeams(true);
      try {
          await assignTeams({ 
              judgeId: selectedJudgeId, 
              teamIds: tempAssignedTeams, 
              roundId: ""
          }).unwrap();
          toast.success("Assignments updated successfully");
          setShowAssignmentModal(false);
      } catch (error) {
          console.error("Failed to assign teams:", error);
          toast.error("Failed to assign teams");
      } finally {
          setIsAssigningTeams(false);
      }
  };


  // Handle remove judge
  const handleRemoveJudge = async (judgeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const judge = judges.find(j => j.id === judgeId);
    if(confirm(`Remove ${judge?.name} from the judge panel?`)) {
        try {
            await deleteJudge(judgeId).unwrap();
            if (selectedJudgeId === judgeId) {
                setSelectedJudgeId(null);
            }
            toast.success("Judge removed successfully");
        } catch (error) {
            console.error("Failed to remove judge:", error);
            toast.error("Failed to remove judge");
        }
    }
  };

  // Get judge initials
  const getJudgeInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get assigned team names
  const getAssignedTeamNames = (teamIds: string[] = []) => {
    return teamIds.map(id => teams.find(t => t.id === id)?.name || id);
  };

  if (isLoadingJudges || isLoadingTeams) {
      return (
          <div className="flex items-center justify-center min-h-screen bg-slate-950">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
          </div>
      );
  }

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
            <span className="text-xs font-mono text-violet-300 tracking-wider">JUDGE PANEL</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Judges Management
            </span>
          </h1>
          <p className="text-slate-400 font-mono text-sm">Configure judges and team assignments</p>
        </div>

        {/* Judges Table Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Judges</h2>
                    <p className="text-xs font-mono text-slate-500">PANEL_SIZE: {judges.length}</p>
                  </div>
                </div>
                
                {/* Add Judge Button */}
                <button 
                  onClick={handleAddJudge}
                  disabled={isAddingJudge}
                  className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center gap-2 rounded-[10px] bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 group-hover/btn:bg-slate-900/50">
                    {isAddingJudge ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    <span>{isAddingJudge ? 'Adding...' : 'Add judge'}</span>
                  </div>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">NAME</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">EMAIL</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">ASSIGNED TEAMS</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-cyan-400 tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {judges.map((judge, index) => {
                      const isSelected = selectedJudgeId === judge.id;
                      const gradients = [
                        'from-cyan-500 to-violet-500',
                        'from-violet-500 to-fuchsia-500',
                        'from-fuchsia-500 to-cyan-500'
                      ];
                      const gradient = gradients[index % gradients.length];
                      
                      return (
                        <tr 
                          key={judge.id}
                          onClick={() => handleJudgeClick(judge.id)}
                          className={`group/row border-b border-slate-800/50 transition-all duration-300 cursor-pointer ${
                            isSelected ? 'bg-slate-800/70 border-cyan-500/30' : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center ${
                                isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''
                              }`}>
                                <span className="text-sm font-bold text-white">{getJudgeInitials(judge.name)}</span>
                              </div>
                              <div>
                                <div className="font-semibold text-white">{judge.name}</div>
                                <div className="text-xs font-mono text-slate-500">JUDGE_{String(index + 1).padStart(2, '0')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm text-slate-300">{judge.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-white">{judge.assignedTeams?.length || 0}</span>
                              <span className="text-xs font-mono text-slate-500">teams</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              onClick={(e) => handleRemoveJudge(judge.id, e)}
                              className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-red-500/50 hover:bg-slate-700/50 hover:text-red-400"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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
                  {judges.length} {judges.length === 1 ? 'judge' : 'judges'} active
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>All judges verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Team Assignments</h2>
                    <p className="text-xs font-mono text-slate-500">EVALUATION_DISTRIBUTION</p>
                  </div>
                </div>

                <button
                  onClick={openAssignmentModal}
                  disabled={!selectedJudgeId}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800/70 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Manage Assignments
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-6">
                {selectedJudgeId 
                  ? `Managing assignments for ${selectedJudge?.name}. Click "Manage Assignments" to modify.`
                  : 'Select a judge from the table above to manage their team assignments.'}
              </p>

              {/* Current assignments display */}
              {selectedJudgeId && selectedJudge && (
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-400 tracking-wider mb-2">CURRENT ASSIGNMENTS</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedJudge.assignedTeams && selectedJudge.assignedTeams.length > 0 ? (
                      getAssignedTeamNames(selectedJudge.assignedTeams).map((teamName, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-mono text-cyan-400 border border-cyan-500/20"
                        >
                          {teamName}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">No teams assigned yet</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment Modal */}
        {showAssignmentModal && selectedJudge && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="relative w-full max-w-2xl">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-30 blur-lg" />
              
              <div className="relative rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
                
                <div className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Assign Teams</h3>
                      <p className="text-sm text-slate-400 mt-1">Select teams for {selectedJudge.name}</p>
                    </div>
                    <button
                      onClick={() => setShowAssignmentModal(false)}
                      className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-red-500/50 hover:text-red-400"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Team Selection */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {teams.map((team) => {
                      const isAssigned = tempAssignedTeams.includes(team.id);
                      
                      return (
                        <button
                          key={team.id}
                          onClick={() => handleToggleTeamSelection(team.id)}
                          disabled={isAssigningTeams}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                            isAssigned 
                              ? 'border-cyan-500/50 bg-cyan-500/10' 
                              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800/70'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                              isAssigned ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-slate-700/50'
                            }`}>
                              <span className={`text-sm font-bold ${isAssigned ? 'text-cyan-400' : 'text-slate-400'}`}>
                                {team.name.charAt(0)}
                              </span>
                            </div>
                            <span className={`font-semibold ${isAssigned ? 'text-cyan-400' : 'text-white'}`}>
                              {team.name}
                            </span>
                          </div>
                          
                          {isAssigned && (
                            <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                    <div className="text-xs font-mono text-slate-500">
                      {tempAssignedTeams.length} of {teams.length} teams assigned
                    </div>
                    <button
                      onClick={saveAssignments}
                      disabled={isAssigningTeams}
                      className="rounded-lg bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 px-6 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAssigningTeams ? <Loader2 className="w-4 h-4 animate-spin" /> : "Done"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}