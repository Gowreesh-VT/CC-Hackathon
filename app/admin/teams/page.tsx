"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Lock,
  Trophy,
  XCircle,
  Users,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockTeams } from "@/lib/mock/adminMockData";
import { cn } from "@/lib/utils";
import type { TeamDetail } from "@/lib/redux/api/types";

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamDetail[]>(mockTeams);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const selectedTeam = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId)
    : null;

  const handleScoreChange = (teamId: string, value: string) => {
    const num = value === "" ? null : Number(value);
    if (Number.isNaN(num) && value !== "") return;
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, score: num ?? null } : t
      )
    );
  };

  const handleLockSubmission = (teamId: string) => {
    // TODO: useLockTeamSubmissionMutation(teamId)
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, isLocked: true, submissionStatus: "locked" as const } : t
      )
    );
    setSelectedTeamId(null);
  };

  const handleShortlist = (teamId: string) => {
    // TODO: useShortlistTeamMutation(teamId)
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, isShortlisted: true } : t
      )
    );
    setSelectedTeamId(null);
  };

  const handleEliminate = (teamId: string) => {
    // TODO: API to mark team as eliminated / remove from next round
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, isShortlisted: false } : t
      )
    );
    setSelectedTeamId(null);
  };

  const submissionStatusVariant = (
    status: TeamDetail["submissionStatus"]
  ): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "submitted":
        return "default";
      case "pending":
        return "secondary";
      case "locked":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Teams
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and edit team details. Select a team to lock submissions,
          shortlist, or eliminate.
        </p>
      </header>

      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-muted-foreground" />
            All teams
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Editable scores and status. Use row actions for lock / shortlist /
            eliminate.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold">Team</TableHead>
                  <TableHead className="font-semibold">Track</TableHead>
                  <TableHead className="font-semibold">Current round</TableHead>
                  <TableHead className="font-semibold">Score</TableHead>
                  <TableHead className="font-semibold">Submission status</TableHead>
                  <TableHead className="w-12 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow
                    key={team.id}
                    className={cn(
                      "cursor-pointer border-border/50 transition-colors",
                      selectedTeamId === team.id && "bg-muted/50"
                    )}
                    data-state={selectedTeamId === team.id ? "selected" : undefined}
                    onClick={() =>
                      setSelectedTeamId((id) => (id === team.id ? null : team.id))
                    }
                  >
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {team.track ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {team.currentRoundName ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={team.score ?? ""}
                        onChange={(e) =>
                          handleScoreChange(team.id, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 w-20 rounded-lg border-border/50 bg-background/80 text-center tabular-nums"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={submissionStatusVariant(team.submissionStatus)}>
                        {team.submissionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg"
                            aria-label="Team actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onClick={() => handleLockSubmission(team.id)}
                            disabled={team.isLocked}
                            className="gap-2"
                          >
                            <Lock className="size-4" />
                            Lock submissions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShortlist(team.id)}
                            className="gap-2"
                          >
                            <Trophy className="size-4" />
                            Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEliminate(team.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <XCircle className="size-4" />
                            Eliminate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Team actions panel: shown when a team is selected */}
      {selectedTeam && (
        <Card
          className={cn(
            "overflow-hidden border-primary/20 bg-card/80 shadow-lg backdrop-blur-sm",
            "dark:border-primary/20 dark:bg-card/80"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg">Team actions</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTeamId(null)}
              className="rounded-lg"
            >
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedTeam.name}</span>
              {" — "}
              Lock submissions, shortlist for the next round, or eliminate.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLockSubmission(selectedTeam.id)}
                disabled={selectedTeam.isLocked}
                className="gap-2 rounded-xl"
              >
                <Lock className="size-4" />
                Lock submissions
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleShortlist(selectedTeam.id)}
                className="gap-2 rounded-xl"
              >
                <Trophy className="size-4" />
                Shortlist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEliminate(selectedTeam.id)}
                className="gap-2 rounded-xl text-destructive hover:text-destructive"
              >
                <XCircle className="size-4" />
                Eliminate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
