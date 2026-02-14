"use client";

import React, { useState } from "react";
import type { SubtaskSummary } from "./SubtaskCard";

type Props = {
  subtask: SubtaskSummary;
  allowFileUpload?: boolean;
  roundId?: string | undefined;
  onFinalSubmitted: (payload: {
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
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [final, setFinal] = useState(false);

  const canSubmit = (githubUrl || docUrl) && !busy && !final;

  async function handleFinalSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      if (file) {
        const fd = new FormData();
        if (roundId) fd.append("roundId", roundId);
        fd.append("subtaskId", subtask.id);
        fd.append("file", file);
        if (githubUrl) fd.append("githubLink", githubUrl);
        if (docUrl) fd.append("file_url", docUrl);
        const res = await fetch("/api/team/submission", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (res.ok) {
          setFinal(true);
          onFinalSubmitted({
            subtaskId: subtask.id,
            githubUrl,
            docUrl,
            fileName: file.name,
          });
        } else {
          console.error(data);
        }
      } else {
        const payload = {
          roundId: roundId ?? "",
          subtaskId: subtask.id,
          fileUrl: docUrl,
          githubLink: githubUrl,
        };
        const res = await fetch("/api/team/submission", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setFinal(true);
          onFinalSubmitted({ subtaskId: subtask.id, githubUrl, docUrl });
        } else {
          console.error(data);
        }
      }
    } catch (e) {
      console.error(e);
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
            className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
          />
        </label>

        <label className="block mt-3">
          <div className="text-xs text-gray-400">Document URL</div>
          <input
            value={docUrl}
            onChange={(e) => setDocUrl(e.target.value)}
            placeholder="https://drive.google.com/your-doc"
            className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 text-white"
          />
        </label>

        {allowFileUpload && (
          <label className="block mt-3">
            <div className="text-xs text-gray-400">Upload PDF</div>
            <input
              accept="application/pdf"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm text-gray-200"
            />
            {file && (
              <div className="text-xs text-gray-300 mt-1">
                Selected: {file.name}
              </div>
            )}
          </label>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleFinalSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 rounded-md font-medium ${
              final
                ? "bg-gray-600 text-white cursor-default"
                : "bg-lime-500 hover:bg-lime-600 text-black"
            }`}
          >
            {final
              ? "Final Submitted"
              : busy
              ? "Submitting..."
              : "Final Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
