"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Medal, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type SortMetric =
  | "total"
  | "normalized"
  | "r1"
  | "r2"
  | "r3"
  | "r4sec"
  | "r4faculty";

export default function LeaderboardPage() {
  const { data: teams = [], isLoading } = useGetAdminTeamsQuery();
  const [sortBy, setSortBy] = useState<SortMetric>("total");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    setBreadcrumbs([{ label: "Leaderboard", href: "/admin/leaderboard" }]);
  }, []);

  const teamsByTrack = useMemo(
    () =>
      Object.entries(
        teams.reduce<Record<string, typeof teams>>((acc, team) => {
          const track = team.track || "Unassigned";
          if (!acc[track]) acc[track] = [];
          acc[track].push(team);
          return acc;
        }, {}),
      )
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([track, groupedTeams]) => {
          const enriched = groupedTeams.map((team) => {
            const roundMap = new Map(
              (team.round_scores || []).map((rs) => [rs.round_number, rs]),
            );
            const r1 = roundMap.get(1)?.score ?? null;
            const r2 = roundMap.get(2)?.score ?? null;
            const r3 = roundMap.get(3)?.score ?? null;
            const r4sec = roundMap.get(4)?.sec_score ?? null;
            const r4faculty = roundMap.get(4)?.faculty_score ?? null;
            const normalizedScore =
              r4sec !== null
                ? (0.2 * (r1 ?? 0)) +
                  (0.2 * (r2 ?? 0)) +
                  (0.2 * (r3 ?? 0)) +
                  (0.4 * r4sec)
                : null;

            return {
              ...team,
              r1,
              r2,
              r3,
              r4sec,
              r4faculty,
              normalized_score: normalizedScore,
            };
          });

          const metricValue = (team: (typeof enriched)[number]) => {
            switch (sortBy) {
              case "r1":
                return team.r1;
              case "r2":
                return team.r2;
              case "r3":
                return team.r3;
              case "r4sec":
                return team.r4sec;
              case "r4faculty":
                return team.r4faculty;
              case "normalized":
                return team.normalized_score;
              case "total":
              default:
                return team.cumulative_score ?? 0;
            }
          };

          const sortedTeams = [...enriched].sort((a, b) => {
            const aMetric = metricValue(a);
            const bMetric = metricValue(b);
            const aMissing = aMetric === null || aMetric === undefined;
            const bMissing = bMetric === null || bMetric === undefined;

            if (aMissing && bMissing) {
              return a.team_name.localeCompare(b.team_name);
            }
            if (aMissing) return 1;
            if (bMissing) return -1;

            const diff = Number(aMetric) - Number(bMetric);
            if (diff === 0) {
              return a.team_name.localeCompare(b.team_name);
            }
            return sortOrder === "desc" ? -diff : diff;
          });

          let lastScore: number | null = null;
          let lastRank = 0;
          const rankedTeams = sortedTeams.map((team, index) => {
            const score = metricValue(team);
            if (lastScore === null || score !== lastScore) {
              lastRank = index + 1;
              lastScore = score ?? null;
            }
            return { ...team, rank: lastRank };
          });

          return [track, rankedTeams] as const;
        }),
    [teams, sortBy, sortOrder],
  );

  if (isLoading) return <LoadingState message="Loading leaderboard..." />;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
          <Trophy className="size-7 text-amber-500" />
          Leaderboard
        </h1>
      </header>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <ArrowUpDown className="mr-1 h-3.5 w-3.5" />
              Sorting Active
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Metric: {sortBy === "total"
                ? "Total Score"
                : sortBy === "normalized"
                ? "Normalized Score"
                : sortBy.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              Order: {sortOrder === "desc" ? "High to Low" : "Low to High"}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Sort By
              </p>
              <Select value={sortBy} onValueChange={(value: SortMetric) => setSortBy(value)}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Select sort metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Total Score</SelectItem>
                  <SelectItem value="normalized">Normalized Score</SelectItem>
                  <SelectItem value="r1">Round 1</SelectItem>
                  <SelectItem value="r2">Round 2</SelectItem>
                  <SelectItem value="r3">Round 3</SelectItem>
                  <SelectItem value="r4sec">Round 4 SEC</SelectItem>
                  <SelectItem value="r4faculty">Round 4 Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Order
              </p>
              <Select
                value={sortOrder}
                onValueChange={(value: "desc" | "asc") => setSortOrder(value)}
              >
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to Low</SelectItem>
                  <SelectItem value="asc">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                <Badge variant="outline">{track}</Badge>
                <span className="text-muted-foreground text-sm font-normal">
                  {groupedTeams.length} team(s)
                </span>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Ranked by {sortBy === "total" ? "Total" : sortBy === "normalized" ? "Normalized" : sortBy.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-130 overflow-auto rounded-md border border-border/60">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
                    <TableRow>
                      <TableHead className="w-20">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">R1</TableHead>
                      <TableHead className="text-right">R2</TableHead>
                      <TableHead className="text-right">R3</TableHead>
                      <TableHead className="text-right">R4 SEC</TableHead>
                      <TableHead className="text-right">R4 Faculty</TableHead>
                      <TableHead className="text-right">Total Score</TableHead>
                      <TableHead className="text-right">Normalized Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedTeams.map((team) => {
                      const medalTone =
                        team.rank === 1
                          ? "text-amber-500"
                          : team.rank === 2
                          ? "text-slate-400"
                          : team.rank === 3
                          ? "text-orange-500"
                          : "text-muted-foreground";

                      return (
                        <TableRow key={team.id} className="hover:bg-muted/30">
                          <TableCell className="font-semibold">
                            <span className="inline-flex items-center gap-1.5">
                              {team.rank <= 3 && <Medal className={`h-4 w-4 ${medalTone}`} />}
                              #{team.rank}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">{team.team_name}</TableCell>
                          <TableCell className="text-right">{team.r1 ?? "—"}</TableCell>
                          <TableCell className="text-right">{team.r2 ?? "—"}</TableCell>
                          <TableCell className="text-right">{team.r3 ?? "—"}</TableCell>
                          <TableCell className="text-right">{team.r4sec ?? "—"}</TableCell>
                          <TableCell className="text-right">{team.r4faculty ?? "—"}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {team.cumulative_score ?? 0}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {team.normalized_score !== null
                              ? team.normalized_score.toFixed(2)
                              : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
