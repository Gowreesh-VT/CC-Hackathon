"use client";
import React, { useEffect } from "react";
import CountDown from "../../components/team/Countdown";
import Link from "next/link";
import { useGetTeamDashboardQuery } from "@/lib/redux/api/teamApi";
import { LoadingState } from "@/components/loading-state";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertCircle, Trophy, Timer } from "lucide-react";
import { cn, ensureAbsoluteUrl } from "@/lib/utils";

export default function TeamDashboardPage() {
  const { data: dashboardData, isLoading } = useGetTeamDashboardQuery();

  // Set breadcrumbs for team dashboard
  useEffect(() => {
    setBreadcrumbs([]);
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." fullScreen={true} />;
  }

  // Fallback if data is missing or error
  const teamName = dashboardData?.team_name ?? "Unknown Team";
  const track = dashboardData?.track ?? "-";
  // The API returns 'current_round', not 'activeRound'
  const activeRound = dashboardData?.current_round;
  const currentRoundSubtask = dashboardData?.current_round_subtask;
  const currentRoundSubmission = dashboardData?.current_round_submission;
  const currentRoundScore = dashboardData?.current_round_score;
  const totalScore = dashboardData?.total_score ?? 0;
  const latestRoundScore = dashboardData?.latest_round_score;

  // Use current time + 1h if no end time, or data from API
  const endTime = activeRound?.end_time
    ? new Date(activeRound.end_time).toISOString()
    : new Date(Date.now() + 1000 * 60 * 60).toISOString();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {teamName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track: {track}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Team Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Round</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeRound ? `Round ${activeRound.round_number}` : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeRound?.is_active ? "Active now" : "Not active"}
            </p>
          </CardContent>
        </Card>

        {/* Countdown Timer Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Time Remaining
            </CardTitle>
            <Timer className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              <CountDown endTime={endTime} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeRound?.is_active
                ? `Until round ends`
                : `Next round starts soon`}
            </p>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {activeRound?.is_active ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
          </CardHeader>
          <CardContent>
            <Badge
              variant={activeRound?.is_active ? "default" : "secondary"}
              className={cn(
                activeRound?.is_active &&
                  "bg-green-500/10 text-green-700 hover:bg-green-500/10",
              )}
            >
              {activeRound?.is_active ? "Active" : "Closed"}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Submissions {activeRound?.submission_enabled ? "open" : "closed"}
            </p>
          </CardContent>
        </Card>

        {/* Score Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalScore > 0 ? totalScore : "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all rounds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Round Score Card */}
      {latestRoundScore && (
        <Card
          className={cn(
            "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Latest Round Evaluation (Round {latestRoundScore.round_number})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    SCORE
                  </p>
                  <p className="text-lg font-bold">
                    {latestRoundScore.score !== null
                      ? `${latestRoundScore.score}/10`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    STATUS
                  </p>
                  <Badge variant="default">
                    {latestRoundScore.status === "scored"
                      ? "Evaluated"
                      : "Pending"}
                  </Badge>
                </div>
              </div>

              {latestRoundScore.remarks && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    JUDGE REMARKS
                  </p>
                  <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
                    {latestRoundScore.remarks}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Round Subtask Card */}
      <Card
        className={cn(
          "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Current Round Subtask
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentRoundSubtask ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {currentRoundSubtask.title}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {currentRoundSubtask.description}
                </p>
                {currentRoundSubtask.track && (
                  <Badge variant="secondary" className="mt-3">
                    {currentRoundSubtask.track}
                  </Badge>
                )}
              </div>
              {currentRoundSubtask.statement && (
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    PROBLEM STATEMENT
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {currentRoundSubtask.statement}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Link href={`/team/rounds/${activeRound?._id}`}>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No subtask selected for this round.
              </p>
              {activeRound?._id ? (
                <Link href={`/team/rounds/${activeRound._id}`}>
                  <Button size="sm">Select a Subtask</Button>
                </Link>
              ) : (
                <Badge variant="secondary">No active round</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Round Submission Card */}
      <Card
        className={cn(
          "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Current Round Submission
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentRoundSubmission ? (
            <div className="space-y-4">
              <div className="grid gap-4">
                {currentRoundSubmission.file_url && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      FILE / DOCUMENT
                    </p>
                    <a
                      href={ensureAbsoluteUrl(currentRoundSubmission.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      View Document
                    </a>
                  </div>
                )}

                {currentRoundSubmission.github_link && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      GITHUB REPOSITORY
                    </p>
                    <a
                      href={ensureAbsoluteUrl(
                        currentRoundSubmission.github_link,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {currentRoundSubmission.github_link}
                    </a>
                  </div>
                )}

                {currentRoundSubmission.submission_text && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      SUBMISSION TEXT
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {currentRoundSubmission.submission_text}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                Submitted on{" "}
                {currentRoundSubmission.submitted_at
                  ? new Date(
                      currentRoundSubmission.submitted_at,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </div>

              {activeRound?.submission_enabled && (
                <div className="flex gap-2">
                  <Link href={`/team/rounds/${activeRound?._id}`}>
                    <Button size="sm" variant="outline">
                      Update Submission
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                No submission yet for this round.
              </p>
              {activeRound?.submission_enabled ? (
                <Link href={`/team/rounds/${activeRound?._id}`}>
                  <Button size="sm">Submit Now</Button>
                </Link>
              ) : (
                <Badge variant="secondary">Submissions Closed</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Round Scores Card */}
      {dashboardData?.all_round_scores &&
        dashboardData.all_round_scores.length > 0 && (
          <Card
            className={cn(
              "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                All Round Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.all_round_scores.map(
                  (roundScore: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border/50 bg-muted/30 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            Round {roundScore.round_number}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-medium text-muted-foreground">
                              SCORE
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              {roundScore.score !== null
                                ? `${roundScore.score}/10`
                                : "-"}
                            </p>
                          </div>
                          <Badge
                            variant={
                              roundScore.status === "scored"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {roundScore.status === "scored"
                              ? "Evaluated"
                              : "Pending"}
                          </Badge>
                        </div>
                      </div>
                      {roundScore.remarks && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            JUDGE REMARKS
                          </p>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {roundScore.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
