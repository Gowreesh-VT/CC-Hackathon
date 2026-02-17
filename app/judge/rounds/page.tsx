"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/loading-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAdminRoundsQuery } from "@/lib/redux/api/adminApi";
import { useGetJudgeAssignedTeamsQuery } from "@/lib/redux/api/judgeApi";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";

type RoundStats = {
  assignedTeams: number;
  pending: number;
  scored: number;
};

export default function JudgeRoundsPage() {
  const router = useRouter();
  const { data: rounds = [], isLoading } = useGetAdminRoundsQuery();
  const [roundStats, setRoundStats] = useState<Record<string, RoundStats>>({});
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setBreadcrumbs([{ label: "Rounds", href: "/judge/rounds" }]);
  }, []);

  // Fetch team data for each round to calculate stats
  useEffect(() => {
    if (rounds.length === 0) {
      setLoadingStats(false);
      return;
    }

    const fetchRoundStats = async () => {
      const stats: Record<string, RoundStats> = {};

      // Fetch teams for each round (RTK Query will cache these)
      for (const round of rounds) {
        try {
          // We need to fetch from the API directly or use the hook
          // For now, we'll calculate from the data if available
          const roundId = round._id;

          // Simulate fetching teams for this round
          // This will be fetched lazily when needed, but we'll calculate stats
          const response = await fetch(
            `/api/judge/assigned-teams?round_id=${roundId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            const teams = await response.json();
            const assignedTeams = Array.isArray(teams) ? teams.length : 0;
            let pending = 0;
            let scored = 0;

            if (Array.isArray(teams)) {
              teams.forEach((team: any) => {
                // Check status field from Score model
                if (team.status === "scored") {
                  scored++;
                } else if (team.status === "pending" || !team.status) {
                  pending++;
                }
              });
            }

            stats[roundId] = {
              assignedTeams,
              pending,
              scored,
            };
          }
        } catch (error) {
          console.error(`Failed to fetch teams for round ${round._id}:`, error);
          // Fallback to 0 counts
          stats[round._id] = {
            assignedTeams: 0,
            pending: 0,
            scored: 0,
          };
        }
      }

      setRoundStats(stats);
      setLoadingStats(false);
    };

    fetchRoundStats();
  }, [rounds]);

  // Calculate stats for each round
  const roundsWithStats = rounds.map((round: any) => {
    const stats = roundStats[round._id] || {
      assignedTeams: 0,
      pending: 0,
      scored: 0,
    };

    return {
      ...round,
      ...stats,
    };
  });

  if (isLoading || loadingStats) {
    return <LoadingState message="Loading rounds..." />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Evaluation Rounds
        </h1>
      </header>

      <Card
        className={cn(
          "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="size-5 text-muted-foreground" />
            Available rounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roundsWithStats.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">No rounds available yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-96 rounded-xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-semibold">Round</TableHead>
                    <TableHead className="text-center font-semibold">
                      Assigned Teams
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Pending
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Scored
                    </TableHead>
                    <TableHead className="text-center font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roundsWithStats.map((round: any) => (
                    <TableRow
                      key={round._id}
                      className="border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      <TableCell className="font-medium">
                        Round {round.round_number}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1">
                          <Users className="size-4 text-muted-foreground" />
                          {round.assignedTeams}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/10"
                        >
                          {round.pending}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="default"
                          className="bg-green-500/10 text-green-700 hover:bg-green-500/10"
                        >
                          {round.scored}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={round.is_active ? "default" : "secondary"}
                        >
                          {round.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() =>
                            router.push(`/judge/rounds/${round._id}`)
                          }
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          View Teams
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
