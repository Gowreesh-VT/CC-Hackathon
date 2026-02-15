"use client";

import React, { useMemo, useState } from "react";
import type { SubtaskSummary } from "./SubtaskCard";
import SubtaskCard from "./SubtaskCard";
import SubmissionForm from "./SubmissionForm";

type Props = {
  initial: SubtaskSummary[];
  roundId?: string;
  allowFileUpload?: boolean;
};

export default function RoundInteraction({
  initial,
  roundId,
  allowFileUpload,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [submittedPayload, setSubmittedPayload] = useState<null | {
    subtaskId: string;
    githubUrl?: string;
    docUrl?: string;
  }>(null);

  const selected = useMemo(
    () => initial.find((s) => s.id === selectedId) ?? null,
    [initial, selectedId]
  );

  function handleSelect(id: string) {
    if (locked) return;

    // persist selection server-side
    (async () => {
      try {
        const res = await fetch("/api/team/selection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roundId, subtaskId: id }),
        });
        const data = await res.json();
        if (res.ok) {
          setSelectedId(id);
          setLocked(true);
        } else if (data?.selection) {
          setSelectedId(data.selection.subtask_id?.toString() ?? id);
          setLocked(true);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }

  function handleFinalSubmitted(payload: {
    subtaskId: string;
    githubUrl?: string;
    docUrl?: string;
  }) {
    setSubmittedPayload(payload);
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initial.map((s) => (
          <SubtaskCard
            key={s.id}
            subtask={s}
            selected={s.id === selectedId}
            disabled={locked && s.id !== selectedId}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selected && (
        <div className="mt-6">
          <SubmissionForm
            subtask={selected}
            roundId={roundId}
            allowFileUpload={allowFileUpload}
            onFinalSubmitted={handleFinalSubmitted}
          />
        </div>
      )}

      {submittedPayload && (
        <div className="mt-6 p-4 rounded bg-neutral-900 text-white">
          <div className="font-semibold">Submission Complete</div>
          <div className="text-sm text-gray-300">
            Subtask: {submittedPayload.subtaskId}
          </div>
        </div>
      )}
    </div>
  );
}
