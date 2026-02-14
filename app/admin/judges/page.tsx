"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Gavel, Plus, UserPlus, Users } from "lucide-react";
import { mockJudges, mockTeams, mockRounds } from "@/lib/mock/adminMockData";
import { cn } from "@/lib/utils";
import type { Judge } from "@/lib/redux/api/types";

export default function AdminJudgesPage() {
  const [judges, setJudges] = useState<Judge[]>(mockJudges);
  const [addJudgeOpen, setAddJudgeOpen] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState("");
  const [newJudgeEmail, setNewJudgeEmail] = useState("");

  const [assignOpen, setAssignOpen] = useState<string | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const currentRoundId = mockRounds.find((r) => r.is_active)?.id ?? mockRounds[0]?.id;

  const handleAddJudge = () => {
    // TODO: useCreateJudgeMutation() when backend is ready
    if (!newJudgeName.trim() || !newJudgeEmail.trim()) return;
    setJudges((prev) => [
      ...prev,
      {
        id: `j-${Date.now()}`,
        name: newJudgeName.trim(),
        email: newJudgeEmail.trim(),
        assignedTeamsCount: 0,
      },
    ]);
    setNewJudgeName("");
    setNewJudgeEmail("");
    setAddJudgeOpen(false);
  };

  const openAssign = (judgeId: string) => {
    setAssignOpen(judgeId);
    setSelectedTeamIds(new Set());
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  const handleAssignTeams = () => {
    if (!assignOpen) return;
    // TODO: useAssignTeamsToJudgeMutation({ judgeId: assignOpen, teamIds: [...selectedTeamIds], roundId: currentRoundId })
    console.log("Assign teams", assignOpen, [...selectedTeamIds], currentRoundId);
    const count = selectedTeamIds.size;
    setJudges((prev) =>
      prev.map((j) =>
        j.id === assignOpen
          ? { ...j, assignedTeamsCount: (j.assignedTeamsCount ?? 0) + count }
          : j
      )
    );
    setAssignOpen(null);
    setSelectedTeamIds(new Set());
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Judges
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage judges and assign teams for evaluation in the current round.
        </p>
      </header>

      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gavel className="size-5 text-muted-foreground" />
            All judges
          </CardTitle>
          <Dialog open={addJudgeOpen} onOpenChange={setAddJudgeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <UserPlus className="size-4" />
                Add judge
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add judge</DialogTitle>
                <DialogDescription>
                  Add a new judge. They will log in with Google using this
                  email.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="judge-name">Name</Label>
                  <Input
                    id="judge-name"
                    placeholder="e.g. Alex Kim"
                    value={newJudgeName}
                    onChange={(e) => setNewJudgeName(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="judge-email">Email</Label>
                  <Input
                    id="judge-email"
                    type="email"
                    placeholder="alex@example.com"
                    value={newJudgeEmail}
                    onChange={(e) => setNewJudgeEmail(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddJudgeOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddJudge}
                  disabled={!newJudgeName.trim() || !newJudgeEmail.trim()}
                  className="rounded-xl"
                >
                  Add judge
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Assigned teams</TableHead>
                  <TableHead className="w-40 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {judges.map((judge) => (
                  <TableRow key={judge.id} className="border-border/50">
                    <TableCell className="font-medium">{judge.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {judge.email}
                    </TableCell>
                    <TableCell>{judge.assignedTeamsCount ?? 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssign(judge.id)}
                        className="gap-2 rounded-lg"
                      >
                        <Users className="size-4" />
                        Assign teams
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign teams dialog */}
      <Dialog
        open={!!assignOpen}
        onOpenChange={(open) => !open && setAssignOpen(null)}
      >
        <DialogContent className="max-h-[85vh] flex flex-col overflow-hidden rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Assign teams — {assignOpen ? judges.find((j) => j.id === assignOpen)?.name : ""}
            </DialogTitle>
            <DialogDescription>
              Select teams for the current round. This judge will evaluate their
              submissions.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto space-y-2 py-2">
            {mockTeams.map((team) => (
              <label
                key={team.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30",
                  selectedTeamIds.has(team.id) && "bg-muted/50 border-primary/30"
                )}
              >
                <Checkbox
                  checked={selectedTeamIds.has(team.id)}
                  onCheckedChange={() => toggleTeam(team.id)}
                />
                <span className="font-medium">{team.name}</span>
                <span className="text-sm text-muted-foreground">{team.track}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignOpen(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTeams}
              className="rounded-xl"
            >
              Assign {selectedTeamIds.size} team(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
