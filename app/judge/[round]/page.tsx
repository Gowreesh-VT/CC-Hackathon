"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Define types
type TeamInfo = {
  id: string;
  name: string;
  chosenTask: string;
  submittedFiles: { name: string; url: string; type: string }[];
  submittedLinks: string[];
};

type Evaluation = {
  score: string;
  remarks: string;
};

export default function JudgeRoundPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const roundId = params?.round as string || "round-2";
  const teamId = searchParams?.get('team_id') || "";

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation>({
    score: "",
    remarks: ""
  });

  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);

  useEffect(() => {
    if (!teamId) return;

    const fetchTeamDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/judge/rounds/${roundId}/teams/${teamId}`);
        const data = await res.json();
        
        if (data.data) {
          const { team, submission, selected_subtask } = data.data;
          
          setTeamInfo({
            id: team.team_id,
            name: team.team_name,
            chosenTask: selected_subtask ? selected_subtask.title : "No task selected",
            submittedFiles: submission?.file_url ? [{ name: "Submission File", url: submission.file_url, type: "file" }] : [],
            submittedLinks: submission?.github_link ? [submission.github_link] : []
          });
        }
      } catch (error) {
        console.error("Error fetching team details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamDetails();
  }, [teamId, roundId]);

  // Handle input change
  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and limit to 0-100
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 100)) {
      setEvaluation(prev => ({ ...prev, score: value }));
    }
  };

  const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEvaluation(prev => ({ ...prev, remarks: e.target.value }));
  };

  // Handle submit evaluation
  const handleSubmitEvaluation = async () => {
    // Validation
    if (!evaluation.score) {
      alert("Please enter a score");
      return;
    }

    if (parseInt(evaluation.score) < 0 || parseInt(evaluation.score) > 100) {
      alert("Score must be between 0 and 100");
      return;
    }

    const confirmed = window.confirm(
      `Submit evaluation for ${teamInfo?.name}?\n\nScore: ${evaluation.score}\nRemarks: ${evaluation.remarks || 'None'}`
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/judge/rounds/${roundId}/teams/${teamId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: parseInt(evaluation.score),
          remarks: evaluation.remarks
        })
      });

      if (!res.ok) throw new Error("Failed to submit");
      
      console.log("Submitted evaluation:", {
        teamId,
        roundId,
        score: parseInt(evaluation.score),
        remarks: evaluation.remarks
      });
      
      alert(`Evaluation submitted successfully!\n\nTeam: ${teamInfo?.name}\nScore: ${evaluation.score}`);
      
      // Navigate back to judge home
      router.push('/judge');
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      alert("Failed to submit evaluation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'pdf':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'archive':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };



  if (isLoading || !teamInfo) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center">
         <div className="flex flex-col items-center gap-4">
             <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
             <p className="text-slate-400 font-mono animate-pulse">Loading team data...</p>
         </div>
      </main>
    )
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
      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
        {/* Header with Back Button */}
        <div className="mb-4 space-y-4">
          <button 
            onClick={() => router.push('/judge')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-mono">Back to Dashboard</span>
          </button>
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-mono text-violet-300 tracking-wider">EVALUATION MODE</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {teamInfo.name} Review
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-sm">{roundId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} submission evaluation</p>
          </div>
        </div>

        {/* Team Details Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Team Details</h2>
                  <p className="text-xs font-mono text-slate-500">SUBMISSION_INFO</p>
                </div>
              </div>

              {/* Chosen Task */}
              <div className="mb-6">
                <div className="text-xs font-mono text-slate-400 tracking-wider mb-2">CHOSEN TASK</div>
                <p className="text-sm text-white">{teamInfo.chosenTask}</p>
              </div>

              {/* Submitted Files */}
              {teamInfo.submittedFiles.length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-mono text-slate-400 tracking-wider mb-3">SUBMITTED FILES</div>
                  <div className="space-y-2">
                    {teamInfo.submittedFiles.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/70"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-white">{file.name}</div>
                          <div className="text-xs text-slate-500">{file.type.toUpperCase()}</div>
                        </div>
                        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Links */}
              {teamInfo.submittedLinks.length > 0 && (
                <div>
                  <div className="text-xs font-mono text-slate-400 tracking-wider mb-3">SUBMITTED LINKS</div>
                  <div className="space-y-2">
                    {teamInfo.submittedLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/50 transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800/70"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                          <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </div>
                        <div className="flex-1 text-sm text-violet-400 font-mono truncate">{link}</div>
                        <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evaluation Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
          
          <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Evaluation</h2>
                  <p className="text-xs font-mono text-slate-500">SCORING_MATRIX</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Score Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Score</span>
                    <span className="text-xs font-mono text-slate-500">(0-100)</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter score"
                    value={evaluation.score}
                    onChange={handleScoreChange}
                    maxLength={3}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 transition-all duration-300 hover:bg-slate-800/70 hover:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                  />
                  {evaluation.score && (
                    <p className="text-xs font-mono text-cyan-400">
                      Score entered: {evaluation.score}/100
                    </p>
                  )}
                </div>

                {/* Remarks Textarea */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>Remarks</span>
                    <span className="text-xs font-mono text-slate-500">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Add feedback"
                    value={evaluation.remarks}
                    onChange={handleRemarksChange}
                    rows={6}
                    maxLength={1000}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 transition-all duration-300 hover:bg-slate-800/70 hover:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-slate-500">Provide constructive feedback for the team</p>
                    <p className="text-xs font-mono text-slate-500">{evaluation.remarks.length}/1000</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 mt-6 border-t border-slate-800">
                <button 
                  onClick={handleSubmitEvaluation}
                  disabled={isSubmitting || !evaluation.score}
                  className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 group-hover/btn:bg-slate-900/50">
                    {isSubmitting ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Submit Evaluation</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}