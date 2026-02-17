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

export default function Page() {
  const params = useParams();
  const id = params.id as string;
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string | null>(
    null,
  );
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isEditingSubmission, setIsEditingSubmission] = useState(false);

  const { data, isLoading, error } = useGetTeamRoundDetailsQuery(id);
  const [selectSubtask, { isLoading: isSelecting }] =
    useSelectSubtaskMutation();

  // Set breadcrumbs for team round details
  useEffect(() => {
    if (data?.round) {
      setBreadcrumbs([
        { label: "Rounds", href: "/team/rounds" },
        {
          label: `Round ${data.round.round_number || id}`,
          href: `/team/rounds/${id}`,
        },
      ]);
    }
  }, [data, id]);

  // Countdown timer
  useEffect(() => {
    if (!data?.round?.end_time) return;

    const calculateTimeRemaining = () => {
      const endTime = new Date(data.round.end_time).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setTimeRemaining("Time's up!");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let timeStr = "";
      if (days > 0) timeStr += `${days}d `;
      if (hours > 0) timeStr += `${hours}h `;
      if (minutes > 0) timeStr += `${minutes}m `;
      timeStr += `${seconds}s`;

      setTimeRemaining(timeStr);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [data?.round?.end_time]);

  if (isLoading) {
    return (
      <LoadingState message="Loading round details..." fullScreen={true} />
    );
  }

  if (error || !data || !data.round) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-foreground text-center mb-4">
              Round not found or error loading data.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { round, selection, subtask, submission, initialSubtasks, score } =
    data;
  console.log("Round details data:", data);

  // Check if round has ended
  const isRoundEnded = round.end_time
    ? new Date().getTime() > new Date(round.end_time).getTime()
    : false;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // If subtask is selected
  if (selection) {
    return (
      <div className="space-y-8">
        <header className="flex justify-between w-full items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Round {round.round_number}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your submission and track progress
            </p>
          </div>
          {/* Countdown Timer */}
          <div className="rounded-lg border border-border/50 bg-muted/30 p-4 shrink-0 ml-4">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-yellow-600" />
              <p className="text-xs font-medium text-muted-foreground">
                TIME REMAINING
              </p>
            </div>
            <p
              className={`text-lg font-bold whitespace-nowrap ${
                timeRemaining === "Time's up!"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {timeRemaining || "Calculating..."}
            </p>
          </div>
        </header>

        {/* Round Details */}
        <Card>
          <CardHeader>
            <CardTitle>Round Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {round.instructions && (
                <div className="w-full">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    INSTRUCTIONS
                  </p>
                  <p className="text-sm text-foreground w-full">
                    {round.instructions}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    START TIME
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-foreground">
                      {formatDate(round.start_time)}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    END TIME
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-foreground">
                      {formatDate(round.end_time)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Subtask Details */}
        {subtask && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Selected Subtask
                  </CardTitle>
                  {subtask.track && (
                    <Badge variant="secondary" className="mt-3">
                      {subtask.track}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {subtask.title}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {subtask.description}
                </p>
              </div>

              {subtask.statement && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    PROBLEM STATEMENT
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {subtask.statement}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submission Section */}
        {submission ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Submission Received
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Submitted on {formatDate(submission.submitted_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingSubmission ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {submission.github_link && (
                      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          GITHUB REPOSITORY
                        </p>
                        <a
                          href={ensureAbsoluteUrl(submission.github_link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {submission.github_link}
                        </a>
                      </div>
                    )}
                    {submission.file_url && (
                      <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          FILE / DOCUMENT
                        </p>
                        <a
                          href={ensureAbsoluteUrl(submission.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Document
                        </a>
                      </div>
                    )}
                  </div>

                  {submission.overview && (
                    <div className="pt-4 border-t rounded-lg border-b border-l border-r border-border/50 bg-muted/30 p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        PROJECT OVERVIEW
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {submission.overview}
                      </p>
                    </div>
                  )}

                  {score && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-3">
                        EVALUATION
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            SCORE
                          </p>
                          <p className="text-2xl font-bold text-foreground">
                            {score.score}/10
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Status:{" "}
                            <Badge variant="secondary" className="ml-1">
                              {score.status}
                            </Badge>
                          </p>
                        </div>

                        {score.remarks && (
                          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              JUDGE REMARKS
                            </p>
                            <p className="text-sm text-foreground whitespace-pre-wrap">
                              {score.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!isRoundEnded && (
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingSubmission(true)}
                      >
                        Edit Submission
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your submission below
                  </p>

                  {submission.submission_text && (
                    <div className="mb-6 rounded-lg border border-border/50 bg-muted/30 p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        CURRENT PROJECT OVERVIEW
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {submission.submission_text}
                      </p>
                    </div>
                  )}

                  <SubmissionForm
                    subtask={{
                      id: subtask?._id || "",
                      title: subtask?.title || "",
                    }}
                    roundId={id}
                    allowFileUpload={true}
                    disabled={isRoundEnded}
                    isEditing={true}
                    submission={submission}
                    onSuccess={() => setIsEditingSubmission(false)}
                    onCancel={() => setIsEditingSubmission(false)}
                  />
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create Submission</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isRoundEnded
                  ? "Submission period has ended for this round"
                  : "Submit your work for the selected subtask"}
              </p>
            </CardHeader>
            <CardContent>
              {isRoundEnded ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Submission Deadline Passed
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The round ended on {formatDate(round.end_time)}. Submissions
                    are no longer accepted.
                  </p>
                </div>
              ) : (
                <SubmissionForm
                  subtask={{
                    id: subtask?._id || "",
                    title: subtask?.title || "",
                  }}
                  roundId={id}
                  allowFileUpload={true}
                  disabled={isRoundEnded}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // If no subtask selected - show subtask options
  return (
    <div className="space-y-8">
      <header className="flex justify-between w-full items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Round {round.round_number} - Select Subtask
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a subtask to work on for this round
          </p>
        </div>
        {/* Countdown Timer */}
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-4 w-4 text-yellow-600" />
            <p className="text-xs font-medium text-muted-foreground">
              TIME REMAINING
            </p>
          </div>
          <p
            className={`text-lg font-bold ${
              timeRemaining === "Time's up!"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {timeRemaining || "Calculating..."}
          </p>
        </div>
      </header>

      {/* Round Details */}
      <Card>
        <CardHeader>
          <CardTitle>Round Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {round.instructions && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                INSTRUCTIONS
              </p>
              <p className="text-sm text-foreground">{round.instructions}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                START TIME
              </p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-foreground">
                  {formatDate(round.start_time)}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                END TIME
              </p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-foreground">
                  {formatDate(round.end_time)}
                </p>
              </div>
            </div>
          </div>{" "}
        </CardContent>
      </Card>

      {/* Subtask Selection */}
      {initialSubtasks && initialSubtasks.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Available Subtasks
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {initialSubtasks.slice(0, 2).map((task: any) => (
              <Card
                key={task._id}
                className="cursor-pointer hover:shadow-lg transition-shadow border-border/50"
                onClick={() => setSelectedSubtaskId(task._id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    {task.track && (
                      <Badge variant="secondary" className="shrink-0">
                        {task.track}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {task.description}
                  </p>
                </CardHeader>
                <CardContent>
                  {task.statement && (
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                      {task.statement}
                    </p>
                  )}
                  <Button
                    className="w-full"
                    variant={
                      selectedSubtaskId === task._id ? "default" : "outline"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubtaskId(task._id);
                    }}
                  >
                    {selectedSubtaskId === task._id ? "Selected" : "Select"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedSubtaskId && (
            <div className="mt-6">
              <Button
                size="lg"
                onClick={async () => {
                  try {
                    await selectSubtask({
                      roundId: id,
                      subtaskId: selectedSubtaskId,
                    }).unwrap();
                  } catch (error) {
                    console.error("Failed to select subtask:", error);
                  }
                }}
                disabled={isSelecting}
              >
                {isSelecting ? "Confirming..." : "Confirm Selection"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No subtasks available for this round.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
