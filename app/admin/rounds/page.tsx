"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Plus,
  ListOrdered,
  PlayCircle,
  StopCircle,
  Upload,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import {
  useGetAdminRoundsQuery,
  useCreateRoundMutation,
  useUpdateRoundMutation,
  useDeleteRoundMutation,
} from "@/lib/redux/api/adminApi";
import { toast } from "sonner";

export default function AdminRoundsPage() {
  useEffect(() => {
    setBreadcrumbs([{ label: "Rounds", href: "/admin/rounds" }]);
  }, []);

  const [createOpen, setCreateOpen] = useState(false);
  const [roundNumber, setRoundNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const { data: rounds = [], isLoading } = useGetAdminRoundsQuery();
  const [createRound] = useCreateRoundMutation();
  const [updateRound] = useUpdateRoundMutation();
  const [deleteRound] = useDeleteRoundMutation();

  const handleCreateRound = async () => {
    if (!roundNumber) return;
    try {
      await createRound({
        round_number: parseInt(roundNumber),
        instructions,
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
      }).unwrap();
      toast.success("Round created successfully");
      setCreateOpen(false);
      setRoundNumber("");
      setInstructions("");
      setStartTime("");
      setEndTime("");
    } catch (e: any) {
      toast.error(e?.data?.error || "Failed to create round");
    }
  };

  const handleStartRound = async (id: string) => {
    try {
      await updateRound({ id, body: { is_active: true } }).unwrap();
      toast.success("Round started");
    } catch {
      toast.error("Failed to start round");
    }
  };

  const handleStopRound = async (id: string) => {
    try {
      await updateRound({ id, body: { is_active: false } }).unwrap();
      toast.success("Round stopped");
    } catch {
      toast.error("Failed to stop round");
    }
  };

  const handleToggleSubmission = async (id: string) => {
    const round = rounds.find((r: any) => r._id === id);
    if (!round) return;
    try {
      await updateRound({ id, body: { submission_enabled: !round.submission_enabled } }).unwrap();
      toast.success("Submission status updated");
    } catch {
      toast.error("Failed to toggle submission");
    }
  };

  const handleDeleteRound = async (id: string) => {
    if (!confirm("Delete this round and all related data?")) return;
    try {
      await deleteRound(id).unwrap();
      toast.success("Round deleted");
    } catch {
      toast.error("Failed to delete round");
    }
  };

  const formatDateTime = (v?: string | null) => {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Rounds
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all rounds and open details to edit subtasks and teams.
        </p>
      </header>

      <Card
        className={cn(
          "overflow-hidden border-border bg-card/80 backdrop-blur-sm",
        )}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListOrdered className="h-5 w-5 text-muted-foreground" />
            All rounds
          </CardTitle>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Create round
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create new round</DialogTitle>
                <DialogDescription>
                  Enter the round number and optional instructions.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="round-number">Round Number</Label>
                  <Input
                    id="round-number"
                    type="number"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Input
                    id="instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRound} disabled={!roundNumber}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <div className="max-h-[36rem] overflow-auto rounded-xl border border-border/50">
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Round</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start time</TableHead>
                    <TableHead>End time</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-border/50">
                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded-md" />
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-4 w-32 rounded-md" />
                        </div>
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-32 rounded-md" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-32 rounded-md" />
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : rounds.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">
                No rounds found. Create one to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead>Round</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start time</TableHead>
                    <TableHead>End time</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {rounds.map((round: any) => (
                    <TableRow key={round._id} className="border-border/50">
                      <TableCell className="font-medium">
                        Round {round.round_number}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              round.is_active
                                ? "default"
                                : round.end_time &&
                                  new Date() > new Date(round.end_time)
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {round.is_active ? "active" : "inactive"}
                          </Badge>

                          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            {round.submission_enabled ? (
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                            {round.submission_enabled
                              ? "Submissions on"
                              : "Submissions off"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDateTime(round.start_time)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(round.end_time)}
                      </TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant={
                                    round.is_active ? "secondary" : "default"
                                  }
                                  onClick={() =>
                                    round.is_active
                                      ? handleStopRound(round._id)
                                      : handleStartRound(round._id)
                                  }
                                >
                                  {round.is_active ? (
                                    <StopCircle className="h-4 w-4" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {round.is_active ? "Stop round" : "Start round"}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    handleToggleSubmission(round._id)
                                  }
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Toggle submissions
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button asChild size="icon" variant="ghost">
                                  <Link href={`/admin/rounds/${round._id}`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit round</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => handleDeleteRound(round._id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete round</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
