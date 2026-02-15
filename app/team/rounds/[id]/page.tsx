"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define types
type Subtask = {
  id: string;
  name: string;
  description: string;
  difficulty: string;
};

export default function TeamRoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params?.id as string || "round-2";

  // State management
  const [selectedSubtask, setSelectedSubtask] = useState<string | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionLinks, setSubmissionLinks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock subtasks data
  const [subtasks] = useState<Subtask[]>([
    {
      id: "subtask-a",
      name: "Subtask A",
      description: "Build a recommendation engine using collaborative filtering techniques. Implement user-based and item-based approaches.",
      difficulty: "Medium"
    },
    {
      id: "subtask-b",
      name: "Subtask B",
      description: "Create a real-time sentiment analysis system that processes social media data streams and generates insights.",
      difficulty: "Hard"
    }
  ]);

  // Handle subtask selection
  const handleSelectSubtask = (subtaskId: string) => {
    if (selectedSubtask) {
      const confirmed = window.confirm("Are you sure you want to change your selected subtask? This will reset your submission.");
      if (!confirmed) return;
      setSubmissionFile(null);
      setSubmissionLinks("");
    }
    setSelectedSubtask(subtaskId);
    console.log("Selected subtask:", subtaskId);
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF only for Round 1)
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSubmissionFile(file);
      console.log("File selected:", file.name);
    }
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!submissionFile && !submissionLinks.trim()) {
      alert("Please upload a file or provide submission links");
      return;
    }

    const confirmed = window.confirm(
      `Submit your work for ${subtasks.find(s => s.id === selectedSubtask)?.name}?`
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Submitted:", {
        roundId,
        subtaskId: selectedSubtask,
        file: submissionFile?.name,
        links: submissionLinks
      });
      
      alert("Submission successful!");
      // Optionally navigate back
      // router.push('/team/rounds');
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSubtaskData = subtasks.find(s => s.id === selectedSubtask);

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
        <div className="mb-4 space-y-4">
          <button 
            onClick={() => router.push('/team/rounds')}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-mono">Back to Rounds</span>
          </button>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs font-mono text-violet-300 tracking-wider">TASK SELECTION</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                {roundId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </h1>
            <p className="text-slate-400 font-mono text-sm">Choose your subtask and submit your work</p>
          </div>
        </div>

        {/* Selected Subtask Indicator */}
        {selectedSubtask && (
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-mono text-cyan-300">
                  Selected: {selectedSubtaskData?.name}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedSubtask(null);
                  setSubmissionFile(null);
                  setSubmissionLinks("");
                }}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Change Selection
              </button>
            </div>
          </div>
        )}

        {/* Subtasks Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {subtasks.map((subtask, index) => {
            const color = index === 0 ? 'cyan' : 'violet';
            const isSelected = selectedSubtask === subtask.id;
            
            return (
              <div key={subtask.id} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-2xl opacity-0 blur-lg ${isSelected ? 'opacity-30' : 'group-hover:opacity-20'} transition-opacity duration-500`} />
                
                <div className={`relative rounded-2xl border ${isSelected ? `border-${color}-500/50` : 'border-slate-800'} bg-slate-900/80 backdrop-blur-xl overflow-hidden transition-all duration-300`}>
                  <div className={`h-px w-full bg-gradient-to-r from-transparent via-${color}-400 to-transparent`} />
                  
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
                        <span className={`text-lg font-bold text-${color}-400`}>{String.fromCharCode(65 + index)}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{subtask.name}</h3>
                        <p className="text-xs font-mono text-slate-500">Difficulty: {subtask.difficulty}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed mb-6">
                      {subtask.description}
                    </p>

                    <button
                      onClick={() => handleSelectSubtask(subtask.id)}
                      disabled={isSelected}
                      className={`w-full relative overflow-hidden rounded-xl ${
                        isSelected
                          ? `bg-${color}-500/20 border-2 border-${color}-500/50 cursor-default`
                          : `bg-gradient-to-r from-${color}-500 to-${color}-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]`
                      } p-[2px] transition-all duration-300 active:scale-[0.98] disabled:active:scale-100`}
                    >
                      <div className={`relative flex items-center justify-center gap-2 rounded-[10px] ${isSelected ? 'bg-transparent' : 'bg-slate-900'} px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300`}>
                        {isSelected ? (
                          <>
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Selected</span>
                          </>
                        ) : (
                          <span>Select this task</span>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submission Section - Only shown after task selection */}
        {selectedSubtask && (
          <div className="group relative animate-in fade-in duration-500">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 rounded-2xl opacity-0 blur-lg group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent" />
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                    <svg className="h-5 w-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Submission</h2>
                    <p className="text-xs font-mono text-slate-500">UPLOAD_YOUR_WORK</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>Upload PDF</span>
                      <span className="text-xs font-mono text-slate-500">(Max 10MB)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-8 transition-all duration-300 hover:border-fuchsia-500/50 hover:bg-slate-800/70 cursor-pointer"
                      >
                        {submissionFile ? (
                          <div className="flex items-center gap-3">
                            <svg className="h-8 w-8 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="text-left">
                              <div className="text-sm font-semibold text-white">{submissionFile.name}</div>
                              <div className="text-xs text-slate-400">{(submissionFile.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-slate-300 mb-1">Click to upload PDF</p>
                            <p className="text-xs text-slate-500">or drag and drop</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Submission Links */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>Submission Links</span>
                      <span className="text-xs font-mono text-slate-500">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Add GitHub repo, demo links, or any other relevant URLs (one per line)"
                      value={submissionLinks}
                      onChange={(e) => setSubmissionLinks(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder:text-slate-500 transition-all duration-300 hover:bg-slate-800/70 hover:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-slate-800">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || (!submissionFile && !submissionLinks.trim())}
                      className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,70,239,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                      <div className="relative flex items-center justify-center gap-2 rounded-[10px] bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all duration-300">
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
                            <span>Submit Work</span>
                          </>
                        )}
                      </div>
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