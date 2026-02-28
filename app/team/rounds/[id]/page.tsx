"use client";

import { useEffect, useState } from "react";
import {
  useGetTeamRoundDetailsQuery,
  useSelectSubtaskMutation,
} from "@/lib/redux/api/teamApi";
import SubmissionForm from "@/components/team/SubmissionForm";
import { useParams } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Timer } from "lucide-react";
import { ensureAbsoluteUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);

  const { data, isLoading } = useGetTeamRoundDetailsQuery(id);
  const [selectSubtask, { isLoading: isSelecting }] =
    useSelectSubtaskMutation();

  useEffect(() => {
    if (data?.round) {
      setBreadcrumbs([
        { label: "Rounds", href: "/team/rounds" },
        {
          label: `Round ${data.round.round_number}`,
          href: `/team/rounds/${id}`,
        },
      ]);
    }
  }, [data, id]);

  const roundEndTime = data?.round?.end_time ?? null;

  useEffect(() => {
    if (!roundEndTime) return;

    const interval = setInterval(() => {
      const diff =
        new Date(roundEndTime).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeRemaining("Time's up!");
        return;
      }
      const h = Math.floor(diff / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      setTimeRemaining(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [roundEndTime]);

  if (isLoading) {
    return <LoadingState message="Loading round details..." fullScreen />;
  }

  if (!data?.round) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <p className="text-muted-foreground">
              Round not found or failed to load.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { round, subtask, submission, initialSubtasks } = data;
  const pairSubmissionHistory = data?.pair_submission_history ?? [];
  const allTrackSubtasks = data?.all_track_subtasks ?? [];
  const priorityState = data?.priority_state ?? null;
  const isRound3PairMode =
    round.round_number === 3 && data?.selection?.assignment_mode === "pair";
  const hasAssignedSubtaskOptions =
    Array.isArray(initialSubtasks) && initialSubtasks.length > 0;
  const isRoundLocked = !round.is_active;
  const isRoundEnded =
    round.end_time &&
    new Date().getTime() > new Date(round.end_time).getTime();
  const isRoundStarted =
    !!round.is_active ||
    (!!round.start_time &&
      new Date(round.start_time).getTime() <= new Date().getTime());
  const canInteractWithRound = !isRoundLocked && !isRoundEnded;

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  if (round.round_number === 4) {
    return (
      <div className="space-y-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Round {round.round_number}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review all subtasks and both team histories, then submit your final combined solution.
            </p>
          </div>
          {round.end_time && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 shrink-0">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span className="text-xs font-medium">TIME REMAINING</span>
              </div>
              <p className={`text-lg font-bold ${
                timeRemaining === "Time's up!" ? "text-destructive" : "text-primary"
              }`}>
                {timeRemaining || "Calculating..."}
              </p>
            </div>
          )}
        </header>

        <Card>
          <CardHeader>
            <CardTitle>All Track Subtasks</CardTitle>
          </CardHeader>
          <CardContent>
            {allTrackSubtasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subtasks available for your track.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {allTrackSubtasks.map((task: any) => (
                  <Card
                    key={task._id}
                    className="border-2 border-border transition hover:border-primary/50"
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{task.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      {task.statement && (
                        <div className="rounded-md border border-border bg-muted/30 p-3">
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            PROBLEM STATEMENT
                          </p>
                          <p className="line-clamp-4 text-sm">{task.statement}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{submission ? "Edit Submission" : "Create Submission"}</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              subtask={{ id: `round4-${id}`, title: "Round 4 Final Submission" }}
              roundId={id}
              isEditing={!!submission}
              disabled={!canInteractWithRound}
              submission={
                submission
                  ? {
                      github_link: submission.github_link ?? undefined,
                      file_url: submission.file_url ?? undefined,
                      overview: submission.overview ?? undefined,
                    }
                  : undefined
              }
              onSuccess={() => {
                setIsEditingSubmission(false);
                toast.success("Submission updated successfully.");
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ─────────────────────────── SELECTED SUBTASK VIEW ─────────────────────────── */

  if (subtask) {
    return (
      <div className="space-y-8">

        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Round {round.round_number}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your submission and track progress
            </p>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="text-xs font-medium">TIME REMAINING</span>
            </div>
            <p
              className={`text-lg font-bold ${
                timeRemaining === "Time's up!"
                  ? "text-destructive"
                  : "text-primary"
              }`}
            >
              {timeRemaining || "Calculating..."}
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Selected Subtask</CardTitle>
            {subtask.track && (
              <Badge variant="secondary" className="mt-2 w-fit">
                {subtask.track}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-semibold">{subtask.title}</p>
            <p className="text-sm text-muted-foreground">
              {subtask.description}
            </p>

            {subtask.statement && (
              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  PROBLEM STATEMENT
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  {subtask.statement}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {submission ? (
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditingSubmission ? "Edit Submission" : "Submission"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Submitted on {formatDate(submission.submitted_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingSubmission ? (
                <SubmissionForm
                  subtask={{ id: subtask._id, title: subtask.title }}
                  roundId={id}
                  isEditing
                  disabled={!canInteractWithRound}
                  submission={{
                    github_link: submission.github_link ?? undefined,
                    file_url: submission.file_url ?? undefined,
                    overview: submission.overview ?? undefined,
                  }}
                  onSuccess={() => {
                    setIsEditingSubmission(false);
                    toast.success("Submission updated successfully.");
                  }}
                  onCancel={() => setIsEditingSubmission(false)}
                />
              ) : (
                <>
                  {submission.github_link && (
                    <a
                      href={ensureAbsoluteUrl(submission.github_link)}
                      target="_blank"
                      className="block text-sm text-primary hover:underline"
                    >
                      GitHub Repository
                    </a>
                  )}

                  {submission.overview && (
                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        OVERVIEW
                      </p>
                      <p className="whitespace-pre-wrap text-sm">
                        {submission.overview}
                      </p>
                    </div>
                  )}

                  {!isRoundEnded && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingSubmission(true)}
                      disabled={!canInteractWithRound}
                    >
                      Edit Submission
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create Submission</CardTitle>
            </CardHeader>
            <CardContent>
              {isRoundEnded ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
                  <p className="text-sm font-medium">
                    Submission window closed
                  </p>
                </div>
              ) : isRoundLocked ? (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6 text-center">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-yellow-600" />
                  <p className="text-sm font-medium">
                    Round is locked. Submission is not allowed yet.
                  </p>
                </div>
              ) : (
                <SubmissionForm
                  subtask={{ id: subtask._id, title: subtask.title }}
                  roundId={id}
                  allowFileUpload
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  /* ─────────────────────────── SUBTASK SELECTION VIEW ─────────────────────────── */

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Round {round.round_number}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isRoundLocked
              ? "Round is locked. You can view details but cannot select/submits until admin starts it."
              : isRound3PairMode && !priorityState?.is_priority_team && priorityState?.waiting_for_priority
                ? "Waiting for priority team to select first subtask."
              : hasAssignedSubtaskOptions
              ? "Select one of the assigned subtasks to work on. This cannot be changed after confirmation."
              : "Your team is shortlisted. Waiting for admin to assign your subtask options."}
          </p>
        </div>
        {round.end_time && (
          <div className="rounded-lg border border-border bg-muted/50 p-4 shrink-0">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="text-xs font-medium">TIME REMAINING</span>
            </div>
            <p className={`text-lg font-bold ${
              timeRemaining === "Time's up!" ? "text-destructive" : "text-primary"
            }`}>
              {timeRemaining || "Calculating..."}
            </p>
          </div>
        )}
      </header>

      {!hasAssignedSubtaskOptions || (isRound3PairMode && !priorityState?.is_priority_team && priorityState?.waiting_for_priority) ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">
              {isRound3PairMode ? "Waiting for pair priority selection" : "Subtask options not assigned yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {isRound3PairMode
                ? "Your pair's priority team has to choose first. Your subtask will be auto-assigned."
                : "Your team cannot pick a subtask until admin allots options for this round. Please contact admin or check back in a few minutes."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {initialSubtasks.map((task: any) => (
            <Card
              key={task._id}
              className={`transition border-2 ${
                selectedSubtaskId === task._id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-base">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <Button
                  className="w-full"
                  variant={selectedSubtaskId === task._id ? "default" : "outline"}
                  onClick={() => setSelectedSubtaskId(task._id)}
                  disabled={!canInteractWithRound}
                >
                  {selectedSubtaskId === task._id ? "✓ Selected" : "Select this task"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedSubtaskId && (
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={async () => {
              try {
                await selectSubtask({ roundId: id, subtaskId: selectedSubtaskId }).unwrap();
                toast.success("Subtask confirmed! You can now submit your solution.");
              } catch (error: any) {
                toast.error("Failed to confirm: " + (error?.data?.error || "Unknown error"));
              }
            }}
            disabled={isSelecting || !canInteractWithRound}
          >
            {isSelecting ? "Confirming..." : "Confirm Selection →"}
          </Button>
        </div>
      )}
    </div>
  );
}
