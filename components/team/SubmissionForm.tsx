"use client";

import React, { useState } from "react";
import type { SubtaskSummary } from "./SubtaskCard";

type Props = {
  subtask: SubtaskSummary;
  allowFileUpload?: boolean;
  roundId?: string | undefined;
  onFinalSubmitted?: (payload: {
    subtaskId: string;
    githubUrl?: string;
    docUrl?: string;
    fileName?: string;
  }) => void;
};

export default function SubmissionForm({
  subtask,
  onFinalSubmitted,
  allowFileUpload,
  roundId,
}: Props) {
  const [githubUrl, setGithubUrl] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [overview, setOverview] = useState("");
  const [busy, setBusy] = useState(false);
  const [final, setFinal] = useState(false);

  const canSubmit = (githubUrl || docUrl) && !busy && !final;

  async function handleFinalSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const payload = {
        roundId: roundId ?? "",
        subtaskId: subtask.id,
        fileUrl: docUrl,
        githubLink: githubUrl,
        overview: overview,
      };

      const res = await fetch("/api/team/submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setFinal(true);
        onFinalSubmitted?.({ 
            subtaskId: subtask.id, 
            githubUrl, 
            docUrl,
            fileName: overview ? "Overview provided" : undefined
        });
      } else {
        console.error(data);
        alert("Submission failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      console.error(e);
      alert("Submission error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 w-full max-w-2xl">
      <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
        <div className="text-sm text-gray-300">Submitting for</div>
        <div className="font-semibold text-white">{subtask.title}</div>

        <label className="block mt-4">
          <div className="text-xs text-gray-400">GitHub URL</div>
          <input
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/your-repo"
            className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-1 focus:ring-lime-500 outline-none"
          />
        </label>

        <label className="block mt-3">
          <div className="text-xs text-gray-400">Presentation Link / Document URL</div>
          <input
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://drive.google.com/your-doc"
            className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-1 focus:ring-lime-500 outline-none"
          />
        </label>

        <label className="block mt-3">
          <div className="text-xs text-gray-400">Project Overview (Optional)</div>
          <textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Brief description of your project..."
            rows={3}
            className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white focus:ring-1 focus:ring-lime-500 outline-none resize-none"
          />
        </label>

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleFinalSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              final
                ? "bg-gray-600 text-white cursor-default"
                : canSubmit 
                    ? "bg-lime-500 hover:bg-lime-600 text-black"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {final
              ? "Submitted Successfully"
              : busy
              ? "Submitting..."
              : "Final Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
