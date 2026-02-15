"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define types
type Subtask = {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'active' | 'inactive';
};

type TeamAssignment = {
  teamId: string;
  teamName: string;
  previousOption: string;
  chosenOption: string;
  nextTaskA: string;
  nextTaskB: string;
};

export default function AdminRoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params?.round_id as string || "round-2";
  
  // State management
  const [isRoundActive, setIsRoundActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [roundDuration, setRoundDuration] = useState("3h 24m");

  // Subtasks state
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { id: "subtask-a", name: "Subtask A", difficulty: "Medium", status: "active" },
    { id: "subtask-b", name: "Subtask B", difficulty: "Hard", status: "active" },
  ]);

  // Team assignments state
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([
    {
      teamId: "team-alpha",
      teamName: "Team Alpha",
      previousOption: "Option 1",
      chosenOption: "Option 2",
      nextTaskA: "",
      nextTaskB: ""
    }
  ]);

  // Available tasks for dropdowns
  const [availableTasks] = useState([
    { value: "task-1", label: "Task 1" },
    { value: "task-2", label: "Task 2" },
    { value: "task-3", label: "Task 3" },
    { value: "task-4", label: "Task 4" },
  ]);

  // Handle create subtask
  const handleCreateSubtask = async () => {
    setIsCreatingSubtask(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSubtask: Subtask = {
        id: `subtask-${String.fromCharCode(65 + subtasks.length)}`.toLowerCase(),
        name: `Subtask ${String.fromCharCode(65 + subtasks.length)}`,
        difficulty: "Medium",
        status: "active"
      };
      
      setSubtasks([...subtasks, newSubtask]);
      console.log("Created subtask:", newSubtask);
    } catch (error) {
      console.error("Failed to create subtask:", error);
      alert("Failed to create subtask");
    } finally {
      setIsCreatingSubtask(false);
    }
  };

  // Handle edit subtask
  const handleEditSubtask = (subtaskId: string) => {
    console.log("Edit subtask:", subtaskId);
    // In production, open a modal or navigate to edit page
    alert(`Edit subtask: ${subtaskId}`);
  };

  // Handle delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this subtask?");
    if (!confirmed) return;

    try {
      setSubtasks(subtasks.filter(st => st.id !== subtaskId));
      console.log("Deleted subtask:", subtaskId);
    } catch (error) {
      console.error("Failed to delete subtask:", error);
      alert("Failed to delete subtask");
    }
  };

  // Handle start round
  const handleStartRound = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRoundActive(true);
      console.log("Round started:", roundId);
    } catch (error) {
      console.error("Failed to start round:", error);
      alert("Failed to start round");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stop round
  const handleStopRound = async () => {
    const confirmed = window.confirm("Are you sure you want to stop this round?");
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsRoundActive(false);
      console.log("Round stopped:", roundId);
    } catch (error) {
      console.error("Failed to stop round:", error);
      alert("Failed to stop round");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle team task assignment change
  const handleTaskAssignment = (teamId: string, taskType: 'nextTaskA' | 'nextTaskB', value: string) => {
    setTeamAssignments(prev => prev.map(team => 
      team.teamId === teamId 
        ? { ...team, [taskType]: value }
        : team
    ));
    console.log(`Assigned ${taskType} to team ${teamId}:`, value);
  };

  // Handle save assignments
  const handleSaveAssignments = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("Saved team assignments:", teamAssignments);
      alert("Assignments saved successfully!");
    } catch (error) {
      console.error("Failed to save assignments:", error);
      alert("Failed to save assignments");
    } finally {
      setIsLoading(false);
    }
  };

  // Get subtask color
  const getSubtaskColor = (index: number) => {
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
      <div className="absolute top-20 -right-20 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />

      {/* Content */}
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
        {/* Header with Back Button */}
        <div className="mb-4 space-y-4">
          <button 
            onClick={() => router.push('/admin/rounds')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-mono">Back to Rounds</span>
          </button>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
              <span className="text-xs font-mono text-fuchsia-300 tracking-wider">ROUND CONFIGURATION</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {roundId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Details
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-sm">Configure subtasks and manage team progression</p>
          </div>
        </div>

        {/* Round Subtasks Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Round Subtasks</h2>
                    <p className="text-xs font-mono text-slate-500">TASK_COUNT: {subtasks.length}</p>
                  </div>
                </div>
                
                {/* Create Subtask Button */}
                <button 
                  onClick={handleCreateSubtask}
                  disabled={isCreatingSubtask}
                  className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center gap-2 rounded-[10px] bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 group-hover/btn:bg-slate-900/50">
                    {isCreatingSubtask ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    <span>{isCreatingSubtask ? 'Creating...' : 'Create subtask'}</span>
                  </div>
                </button>
              </div>

              {/* Subtasks List */}
              <div className="space-y-3">
                {subtasks.map((subtask, index) => {
                  const color = getSubtaskColor(index);
                  const letter = String.fromCharCode(65 + index);
                  
                  return (
                    <div key={subtask.id} className={`group/card relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 hover:border-${color}-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-${color}-500/10`}>
                      <div className={`absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-${color}-400 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300`} />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${color}-500/10 border border-${color}-500/20 group-hover/card:bg-${color}-500/20 group-hover/card:border-${color}-500/40 transition-all duration-300`}>
                            <span className={`text-lg font-bold text-${color}-400`}>{letter}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-base">{subtask.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                                ACTIVE
                              </span>
                              <span className="text-xs font-mono text-slate-500">Difficulty: {subtask.difficulty}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditSubtask(subtask.id)}
                            className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-700/50 hover:text-violet-400"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 transition-all duration-300 hover:border-red-500/50 hover:bg-slate-700/50 hover:text-red-400"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Round Status Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Round Status</h2>
                    <p className="text-xs font-mono text-slate-500">CONTROL_PANEL</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isRoundActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className={`text-xs font-mono ${isRoundActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isRoundActive ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Start Round Button */}
                <button 
                  onClick={handleStartRound}
                  disabled={isLoading || isRoundActive}
                  className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isLoading || !isRoundActive}
                  className="group/btn relative overflow-hidden rounded-xl border-2 border-slate-700 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:border-red-500/50 hover:bg-slate-800/70 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>

              {/* Info Footer */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Control round lifecycle</span>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  Duration: {roundDuration}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Teams Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-cyan-500 to-violet-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                  <svg className="h-5 w-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Selected Teams</h2>
                  <p className="text-xs font-mono text-slate-500">ASSIGNMENT_MATRIX</p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-800/50">
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-fuchsia-400 tracking-wider">TEAM</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-fuchsia-400 tracking-wider">PREVIOUS OPTION</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-fuchsia-400 tracking-wider">CHOSEN OPTION</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-fuchsia-400 tracking-wider">NEXT TASK A</th>
                      <th className="px-4 py-3 text-left text-xs font-mono font-semibold text-fuchsia-400 tracking-wider">NEXT TASK B</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamAssignments.map((team) => (
                      <tr key={team.teamId} className="group/row border-b border-slate-800/50 transition-all duration-300 hover:bg-slate-800/50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover/row:bg-cyan-500/20 transition-all duration-300">
                              <span className="text-xs font-bold text-cyan-400">{team.teamName.charAt(5)}</span>
                            </div>
                            <span className="font-semibold text-white">{team.teamName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-slate-700/50 px-3 py-1 text-xs font-mono text-slate-300">
                            {team.previousOption}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400 border border-cyan-500/20">
                            {team.chosenOption}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Select 
                            value={team.nextTaskA} 
                            onValueChange={(value) => handleTaskAssignment(team.teamId, 'nextTaskA', value)}
                          >
                            <SelectTrigger className="w-36 border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800/70 hover:border-cyan-500/50 transition-all duration-300 h-9 rounded-lg text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="border-slate-700 bg-slate-800 text-white">
                              {availableTasks.slice(0, 2).map((task) => (
                                <SelectItem 
                                  key={task.value} 
                                  value={task.value} 
                                  className="hover:bg-slate-700 focus:bg-slate-700 text-xs"
                                >
                                  {task.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-4">
                          <Select 
                            value={team.nextTaskB} 
                            onValueChange={(value) => handleTaskAssignment(team.teamId, 'nextTaskB', value)}
                          >
                            <SelectTrigger className="w-36 border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800/70 hover:border-violet-500/50 transition-all duration-300 h-9 rounded-lg text-xs">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="border-slate-700 bg-slate-800 text-white">
                              {availableTasks.slice(2, 4).map((task) => (
                                <SelectItem 
                                  key={task.value} 
                                  value={task.value} 
                                  className="hover:bg-slate-700 focus:bg-slate-700 text-xs"
                                >
                                  {task.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 mt-4">
                <div className="text-xs font-mono text-slate-500">
                  {teamAssignments.length} team configured
                </div>
                <button 
                  onClick={handleSaveAssignments}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-slate-800/70 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>Save assignments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}