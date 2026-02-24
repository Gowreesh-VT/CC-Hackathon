"use client";

import { useEffect } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/loading-state";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import { useGetAdminTeamsQuery } from "@/lib/redux/api/adminApi";

export default function LeaderboardPage() {
  const { data: teams = [], isLoading } = useGetAdminTeamsQuery();

  useEffect(() => {
    setBreadcrumbs([{ label: "Leaderboard", href: "/admin/leaderboard" }]);
  }, []);

  if (isLoading) return <LoadingState message="Loading leaderboard..." />;

  const teamsByTrack = Object.entries(
    teams.reduce<Record<string, typeof teams>>((acc, team) => {
      const track = team.track || "Unassigned";
      if (!acc[track]) acc[track] = [];
      acc[track].push(team);
      return acc;
    }, {}),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([track, groupedTeams]) => [
      track,
      (() => {
        const sortedTeams = [...groupedTeams].sort(
          (a, b) => (b.cumulative_score ?? 0) - (a.cumulative_score ?? 0),
        );

        let lastScore: number | null = null;
        let lastRank = 0;

        return sortedTeams.map((team, index) => {
          const score = team.cumulative_score ?? 0;
          if (lastScore === null || score !== lastScore) {
            lastRank = index + 1;
            lastScore = score;
          }
          return { ...team, rank: lastRank };
        });
      })(),
    ] as const);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
          <Trophy className="size-7 text-amber-500" />
          Leaderboard
        </h1>
      </header>

      {teamsByTrack.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No teams found
          </CardContent>
        </Card>
      ) : (
        teamsByTrack.map(([track, groupedTeams]) => (
          <Card key={track}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">{track}</Badge>
                <span className="text-muted-foreground text-sm font-normal">
                  {groupedTeams.length} team(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">Total Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-semibold">#{team.rank}</TableCell>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {team.cumulative_score ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
