"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

  useEffect(() => {
    if (rounds.length === 0) {
      setLoadingStats(false);
      return;
    }

    const fetchRoundStats = async () => {
      const stats: Record<string, RoundStats> = {};

      for (const round of rounds) {
        try {
          const response = await fetch(
            `/api/judge/assigned-teams?round_id=${round._id}`,
          );

          if (response.ok) {
            const teams = await response.json();
            const assignedTeams = Array.isArray(teams) ? teams.length : 0;
            let pending = 0;
            let scored = 0;

            if (Array.isArray(teams)) {
              teams.forEach((team: any) => {
                if (team.status === "scored") scored++;
                else pending++;
              });
            }

            stats[round._id] = { assignedTeams, pending, scored };
          }
        } catch {
          stats[round._id] = { assignedTeams: 0, pending: 0, scored: 0 };
        }
      }

      setRoundStats(stats);
      setLoadingStats(false);
    };

    fetchRoundStats();
  }, [rounds]);

  const roundsWithStats = rounds.map((round: any) => ({
    ...round,
    ...(roundStats[round._id] ?? { assignedTeams: 0, pending: 0, scored: 0 }),
  }));

  const showSkeleton = isLoading || loadingStats;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Evaluation Rounds
        </h1>
      </header>

      <Card className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Available Rounds
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-h-96 overflow-auto rounded-xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Round</TableHead>
                  <TableHead className="text-center">
                    Assigned Teams
                  </TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Scored</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {showSkeleton ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-border/50">
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>

                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-4 w-10" />
                      </TableCell>

                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-5 w-10 rounded-full" />
                      </TableCell>

                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-5 w-10 rounded-full" />
                      </TableCell>

                      <TableCell className="text-center">
                        <Skeleton className="mx-auto h-5 w-16 rounded-full" />
                      </TableCell>

                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-24 rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : roundsWithStats.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-40 text-center text-muted-foreground"
                    >
                      No rounds available yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  roundsWithStats.map((round: any) => (
                    <TableRow
                      key={round._id}
                      className="border-border/50 transition hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        Round {round.round_number}
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {round.assignedTeams}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {round.pending}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant="default">
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
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push(`/judge/rounds/${round._id}`)
                          }
                        >
                          View Teams
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
