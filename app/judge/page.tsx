"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import { CheckCircle, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetJudgeAssignedTeamsQuery } from "@/lib/redux/api/judgeApi";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";

type TeamAssignment = {
  team_id: string;
  team_name: string;
  status: "pending" | "scored";
  score?: number;
};

export default function JudgeHomePage() {
  const router = useRouter();

  const {
    data: assignedTeams = [],
    isLoading,
    error,
    isError,
  } = useGetJudgeAssignedTeamsQuery();

  const pendingCount = assignedTeams.filter(
    (t: any) => t.status === "pending",
  ).length;
  const scoredCount = assignedTeams.filter(
    (t: any) => t.status === "scored",
  ).length;

  // Set breadcrumbs for judge dashboard
  useEffect(() => {
    setBreadcrumbs([]);
  }, []);

  const handleTeamClick = (teamId: string) => {
    router.push(`/judge/rounds`);
  };

  if (isLoading) {
    return <LoadingState message="Loading assigned teams..." />;
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Judge Dashboard
          </h1>
        </header>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive font-semibold">
              Error loading teams
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {(error as any)?.data?.error || "Unknown error"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Judge Dashboard
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Total Assigned Teams */}
        <Card
          className={cn(
            "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-muted-foreground" />
              Teams assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-baseline gap-4">
              <span className="text-3xl font-bold tabular-nums text-foreground">
                {assignedTeams.length}
              </span>
              <span className="text-muted-foreground">teams to evaluate</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You have {pendingCount} teams pending evaluation.
            </p>
          </CardContent>
        </Card>

        {/* Evaluation Progress */}
        <Card
          className={cn(
            "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="size-5 text-muted-foreground" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4" />
                  <span className="text-sm font-medium">Pending</span>
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {pendingCount}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="size-4" />
                  <span className="text-sm font-medium">Scored</span>
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {scoredCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teams List */}
        <Card
          className={cn(
            "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm lg:col-span-2",
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-muted-foreground" />
              Your assigned teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedTeams.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-muted-foreground">No teams assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {assignedTeams.map((team: TeamAssignment) => (
                  <div
                    key={team.team_id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => handleTeamClick(team.team_id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <span className="text-sm font-semibold text-primary">
                          {team.team_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {team.team_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {team.status === "scored"
                            ? `Scored: ${team.score || "—"}`
                            : "Awaiting evaluation"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        team.status === "scored" ? "default" : "secondary"
                      }
                    >
                      {team.status === "scored" ? "Scored" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
