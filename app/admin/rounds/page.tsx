"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  useToggleRoundStatusMutation,
  useDeleteRoundMutation,
} from "@/lib/redux/api/adminApi";
import { toast } from "sonner";

export default function AdminRoundsPage() {
  // Set breadcrumbs
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
  const [toggleRoundStatus] = useToggleRoundStatusMutation();
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
      console.error(e);
      toast.error(
        `Failed to create round: ${e?.data?.error || "Unknown error"}`,
      );
    }
  };

  const handleStartRound = async (roundId: string) => {
    try {
      await toggleRoundStatus({
        id: roundId,
        action: "start",
      }).unwrap();
      toast.success("Round started successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to start round");
    }
  };

  const handleStopRound = async (roundId: string) => {
    try {
      await toggleRoundStatus({ id: roundId, action: "stop" }).unwrap();
      toast.success("Round stopped successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to stop round");
    }
  };

  const handleToggleSubmission = async (roundId: string) => {
    try {
      await toggleRoundStatus({
        id: roundId,
        action: "toggle-submission",
      }).unwrap();
      toast.success("Submission status updated");
    } catch (e) {
      console.error(e);
      toast.error("Failed to toggle submission");
    }
  };

  const handleDeleteRound = async (roundId: string) => {
    const confirmed = confirm(
      "Delete this round? This will also delete related subtasks, submissions, and assignments.",
    );
    if (!confirmed) return;
    try {
      await deleteRound(roundId).unwrap();
      toast.success("Round deleted successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete round");
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString();
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Rounds
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all rounds and open round details to edit subtasks and teams.
        </p>
      </header>

      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80",
        )}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListOrdered className="size-5 text-muted-foreground" />
            All rounds
          </CardTitle>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="size-4" />
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
                    placeholder="e.g. 2"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Input
                    id="instructions"
                    placeholder="Brief instructions..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="rounded-lg"
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
                      className="rounded-lg block"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input
                      id="end-time"
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="rounded-lg block"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRound}
                  disabled={!roundNumber}
                  className="rounded-xl"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="h-150 overflow-auto rounded-xl border border-border/50">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading rounds...</p>
            ) : rounds.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No rounds found. Create one to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="font-semibold">Round</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Start time</TableHead>
                    <TableHead className="font-semibold">End time</TableHead>
                    <TableHead className="w-12 font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rounds.map((round: any) => (
                    <TableRow key={round._id} className="border-border/50">
                      <TableCell className="font-medium">
                        {`Round ${round.round_number}`}
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
                          <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            {round.submission_enabled ? (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            ) : (
                              <XCircle className="size-4 text-muted-foreground" />
                            )}
                            {round.submission_enabled
                              ? "Submissions on"
                              : "Submissions off"}
                          </div>
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
                          <div className="flex  items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    round.is_active
                                      ? handleStopRound(round._id)
                                      : handleStartRound(round._id)
                                  }
                                  size="icon"
                                  className="size-9 rounded-xl"
                                  variant={
                                    round.is_active ? "secondary" : "default"
                                  }
                                  aria-label={
                                    round.is_active
                                      ? "Stop round"
                                      : "Start round"
                                  }
                                >
                                  {round.is_active ? (
                                    <StopCircle className="size-4" />
                                  ) : (
                                    <PlayCircle className="size-4" />
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
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleToggleSubmission(round._id)
                                  }
                                  className="size-9 rounded-xl"
                                  aria-label={
                                    round.submission_enabled
                                      ? "Disable submissions"
                                      : "Enable submissions"
                                  }
                                >
                                  <Upload className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {round.submission_enabled
                                  ? "Submissions on"
                                  : "Submissions off"}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="icon"
                                  className="size-9 rounded-xl"
                                >
                                  <Link
                                    href={`/admin/rounds/${round._id}`}
                                    aria-label="Edit round"
                                  >
                                    <Edit className="size-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit round</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleDeleteRound(round._id)}
                                  className="size-9 rounded-xl"
                                  aria-label="Delete round"
                                >
                                  <Trash2 className="size-4" />
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
