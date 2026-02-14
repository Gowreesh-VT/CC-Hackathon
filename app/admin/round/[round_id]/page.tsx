"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  ArrowLeft,
  PlayCircle,
  StopCircle,
  Layers,
  Users,
} from "lucide-react";
import {
  mockRounds,
  mockSubtasksByRound,
  mockRoundTeamSelections,
} from "@/lib/mock/adminMockData";
import { cn } from "@/lib/utils";

export default function AdminRoundDetailPage() {
  const params = useParams();
  const roundId = typeof params.round_id === "string" ? params.round_id : "";

  const [createSubtaskOpen, setCreateSubtaskOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDescription, setNewSubtaskDescription] = useState("");

  const round = mockRounds.find((r) => r.id === roundId);
  const subtasks = roundId ? mockSubtasksByRound[roundId] ?? [] : [];
  const selections = roundId ? mockRoundTeamSelections[roundId] ?? [] : [];

  const handleCreateSubtask = () => {
    // TODO: useCreateSubtaskMutation() when backend is ready
    console.log("Create subtask", roundId, newSubtaskTitle, newSubtaskDescription);
    setNewSubtaskTitle("");
    setNewSubtaskDescription("");
    setCreateSubtaskOpen(false);
  };

  const handleStartRound = () => {
    // TODO: useStartRoundMutation(roundId)
    console.log("Start round", roundId);
  };

  const handleStopRound = () => {
    // TODO: useStopRoundMutation(roundId)
    console.log("Stop round", roundId);
  };

  if (!roundId) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">Invalid round.</p>
        <Link href="/admin/rounds">
          <Button variant="outline" className="gap-2 rounded-xl">
            <ArrowLeft className="size-4" />
            Back to rounds
          </Button>
        </Link>
      </div>
    );
  }

  const roundName = round?.name ?? `Round ${round?.round_number ?? roundId}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center gap-4">
        <Link href="/admin/rounds">
          <Button variant="ghost" size="icon" className="rounded-xl" aria-label="Back to rounds">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {roundName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Subtasks, controls, and team selections for this round.
          </p>
        </div>
      </header>

      {/* Subtasks */}
      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="size-5 text-muted-foreground" />
            Subtasks
          </CardTitle>
          <Dialog open={createSubtaskOpen} onOpenChange={setCreateSubtaskOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl">
                <Plus className="size-4" />
                Create subtask
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>New subtask</DialogTitle>
                <DialogDescription>
                  Add a subtask for this round. Teams will see a random subset
                  and choose one.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subtask-title">Title</Label>
                  <Input
                    id="subtask-title"
                    placeholder="e.g. Implement auth API"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtask-desc">Description</Label>
                  <Textarea
                    id="subtask-desc"
                    placeholder="Brief description..."
                    value={newSubtaskDescription}
                    onChange={(e) => setNewSubtaskDescription(e.target.value)}
                    rows={3}
                    className="rounded-lg resize-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateSubtaskOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  className="rounded-xl"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {subtasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No subtasks yet. Create one to show options to teams.
              </p>
            ) : (
              subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 p-4"
                >
                  <div>
                    <p className="font-medium text-foreground">{st.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                      {st.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Round status: start / stop */}
      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg">Round status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start or stop this round to control visibility and submissions.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            onClick={handleStartRound}
            className="gap-2 rounded-xl"
          >
            <PlayCircle className="size-4" />
            Start round
          </Button>
          <Button
            variant="secondary"
            onClick={handleStopRound}
            className="gap-2 rounded-xl"
          >
            <StopCircle className="size-4" />
            Stop round
          </Button>
        </CardContent>
      </Card>

      {/* Selected teams table */}
      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-muted-foreground" />
            Selected teams
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Shown options, chosen option, and next-round task dropdowns per team.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold">Team</TableHead>
                  <TableHead className="font-semibold">Previously shown options</TableHead>
                  <TableHead className="font-semibold">Chosen option</TableHead>
                  <TableHead className="font-semibold">Next round task A</TableHead>
                  <TableHead className="font-semibold">Next round task B</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selections.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No team selections for this round yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  selections.map((row) => (
                    <TableRow key={row.teamId} className="border-border/50">
                      <TableCell className="font-medium">{row.teamName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.shownOptions.map((o) => o.title).join(", ")}
                      </TableCell>
                      <TableCell>
                        {row.chosenOption?.title ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.nextRoundTaskA ?? ""}
                          onValueChange={(v) => {
                            // TODO: API to set next round task for team
                            console.log("Next task A", row.teamId, v);
                          }}
                        >
                          <SelectTrigger className="w-full min-w-[140px] rounded-lg">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {subtasks.map((st) => (
                              <SelectItem key={st.id} value={st.id}>
                                {st.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={row.nextRoundTaskB ?? ""}
                          onValueChange={(v) => {
                            // TODO: API to set next round task for team
                            console.log("Next task B", row.teamId, v);
                          }}
                        >
                          <SelectTrigger className="w-full min-w-[140px] rounded-lg">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {subtasks.map((st) => (
                              <SelectItem key={st.id} value={st.id}>
                                {st.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
