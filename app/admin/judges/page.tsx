"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
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
import { Gavel, Plus, Users, Edit2, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Judge, TeamDetail } from "@/lib/redux/api/types";
import {
  useGetJudgesQuery,
  useGetAdminTeamsQuery,
  useGetAdminRoundsQuery,
  useCreateJudgeMutation,
  useDeleteJudgeMutation,
  useUpdateJudgeMutation,
  useAssignTeamsToJudgeMutation,
  useGetJudgeAssignmentsForRoundQuery,
} from "@/lib/redux/api/adminApi";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function AdminJudgesPage() {
  // State management
  const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);
  const [isAddingJudge, setIsAddingJudge] = useState(false);
  const [isAssigningTeams, setIsAssigningTeams] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState("");
  const [newJudgeEmail, setNewJudgeEmail] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  // Edit judge state
  const [editJudgeId, setEditJudgeId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editJudgeName, setEditJudgeName] = useState("");
  const [editJudgeEmail, setEditJudgeEmail] = useState("");
  const [isEditingJudge, setIsEditingJudge] = useState(false);

  // Delete judge state
  const [deleteJudgeId, setDeleteJudgeId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingJudge, setIsDeletingJudge] = useState(false);

  // RTK Query hooks
  const { data: judges = [], isLoading: isLoadingJudges } = useGetJudgesQuery();
  const { data: teams = [], isLoading: isLoadingTeams } =
    useGetAdminTeamsQuery();
  const { data: rounds = [] } = useGetAdminRoundsQuery();
  const [createJudge] = useCreateJudgeMutation();
  const [updateJudge] = useUpdateJudgeMutation();
  const [deleteJudge] = useDeleteJudgeMutation();
  const [assignTeams] = useAssignTeamsToJudgeMutation();

  // Handle add judge via dialog
  const handleAddJudge = async () => {
    if (!newJudgeName || !newJudgeEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAddingJudge(true);
    try {
      await createJudge({ name: newJudgeName, email: newJudgeEmail }).unwrap();
      toast.success(`Judge ${newJudgeName} added successfully!`);
      setNewJudgeName("");
      setNewJudgeEmail("");
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to add judge:", error);
      toast.error("Failed to add judge");
    } finally {
      setIsAddingJudge(false);
    }
  };

  // Handle team assignment toggle
  const selectedJudge = judges.find((j) => j.id === selectedJudgeId);
  const [tempAssignedTeams, setTempAssignedTeams] = useState<string[]>([]);

  // Fetch assignments for the selected round
  const { data: roundAssignments } = useGetJudgeAssignmentsForRoundQuery(
    selectedRound || "",
    { skip: !selectedRound },
  );

  const currentJudgeRoundTeams = useMemo(() => {
    if (!roundAssignments?.assignments || !selectedJudgeId) return [];
    return roundAssignments.assignments
      .filter((assignment) => assignment.judgeId === selectedJudgeId)
      .map((assignment) => assignment.teamId);
  }, [roundAssignments, selectedJudgeId]);

  const disabledTeamIds = useMemo(() => {
    if (!roundAssignments?.assignments || !selectedJudgeId) return [];
    return roundAssignments.assignments
      .filter((assignment) => assignment.judgeId !== selectedJudgeId)
      .map((assignment) => assignment.teamId);
  }, [roundAssignments, selectedJudgeId]);

  useEffect(() => {
    if (!showAssignmentModal) return;
    setTempAssignedTeams(currentJudgeRoundTeams);
  }, [currentJudgeRoundTeams, showAssignmentModal]);

  // When opening modal, initialize temp state and set default round
  const openAssignmentModal = (judge?: any) => {
    const judgeToAssign = judge || selectedJudge;
    if (judgeToAssign) {
      setSelectedJudgeId(judgeToAssign.id);
      setTempAssignedTeams([]);
      // Set first round as default if available
      const sortedRounds = [...rounds].sort(
        (a, b) => new Date(b._id).getTime() - new Date(a._id).getTime(),
      );
      const firstRound = sortedRounds.length > 0 ? sortedRounds[0]._id : null;
      setSelectedRound(firstRound);
      setShowAssignmentModal(true);
    }
  };

  const handleToggleTeamSelection = (teamId: string) => {
    setTempAssignedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const saveAssignments = async () => {
    if (!selectedJudgeId || !selectedRound) return;
    setIsAssigningTeams(true);
    try {
      await assignTeams({
        judgeId: selectedJudgeId,
        teamIds: tempAssignedTeams,
        roundId: selectedRound,
      }).unwrap();
      toast.success("Assignments updated successfully");
      setShowAssignmentModal(false);
    } catch (error) {
      console.error("Failed to assign teams:", error);
      toast.error("Failed to assign teams");
    } finally {
      setIsAssigningTeams(false);
    }
  };

  // Handle edit judge dialog open
  const handleEditClick = (judge: any) => {
    setEditJudgeId(judge.id);
    setEditJudgeName(judge.name);
    setEditJudgeEmail(judge.email || "");
    setEditDialogOpen(true);
  };

  // Handle edit judge submit
  const handleEditJudge = async () => {
    if (!editJudgeId || !editJudgeName || !editJudgeEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsEditingJudge(true);
    try {
      await updateJudge({
        id: editJudgeId,
        name: editJudgeName,
        email: editJudgeEmail,
      }).unwrap();
      toast.success("Judge updated successfully");
      setEditDialogOpen(false);
      setEditJudgeId(null);
      setEditJudgeName("");
      setEditJudgeEmail("");
    } catch (error) {
      console.error("Failed to edit judge:", error);
      toast.error("Failed to edit judge");
    } finally {
      setIsEditingJudge(false);
    }
  };

  // Handle delete judge dialog open
  const handleDeleteClick = (judgeId: string) => {
    setDeleteJudgeId(judgeId);
    setShowDeleteConfirm(true);
  };

  // Handle delete judge confirm
  const handleConfirmDelete = async () => {
    if (!deleteJudgeId) return;

    setIsDeletingJudge(true);
    try {
      await deleteJudge(deleteJudgeId).unwrap();
      if (selectedJudgeId === deleteJudgeId) {
        setSelectedJudgeId(null);
      }
      toast.success("Judge removed successfully");
      setShowDeleteConfirm(false);
      setDeleteJudgeId(null);
    } catch (error) {
      console.error("Failed to remove judge:", error);
      toast.error("Failed to remove judge");
    } finally {
      setIsDeletingJudge(false);
    }
  };

  // Get assigned team names
  const getAssignedTeamNames = (teamIds: string[] = []) => {
    return teamIds.map((id) => teams.find((t) => t.id === id)?.name || id);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Judges
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage judges and assign teams for evaluation.
        </p>
      </header>

      {/* Judges Table Card */}
      <Card
        className={cn(
          "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-border/50 dark:bg-card/80",
        )}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gavel className="size-5 text-muted-foreground" />
            All judges
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="size-4" /> Add Judge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Judge</DialogTitle>
                <DialogDescription>
                  Enter the judge name and email address.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="judge-name">Judge Name</Label>
                  <Input
                    id="judge-name"
                    value={newJudgeName}
                    onChange={(e) => setNewJudgeName(e.target.value)}
                    placeholder="e.g. Dr. Neha Iyer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="judge-email">Email</Label>
                  <Input
                    id="judge-email"
                    type="email"
                    value={newJudgeEmail}
                    onChange={(e) => setNewJudgeEmail(e.target.value)}
                    placeholder="judge@example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddJudge}
                  disabled={isAddingJudge || !newJudgeName || !newJudgeEmail}
                  className="rounded-xl"
                >
                  {isAddingJudge ? "Adding..." : "Add Judge"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="h-150 overflow-auto rounded-xl border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="font-semibold">Judge</TableHead>
                  <TableHead className="font-semibold">
                    Assigned Teams
                  </TableHead>
                  <TableHead className="w-12 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingJudges || isLoadingTeams ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i} className="border-border/50">
                      <TableCell>
                        <Skeleton className="h-4 w-40 rounded-md" />
                      </TableCell>

                      <TableCell>
                        <Skeleton className="h-4 w-24 rounded-md" />
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : judges.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No judges added yet
                    </TableCell>
                  </TableRow>
                ) : (
                  judges.map((judge) => (
                    <TableRow
                      key={judge.id}
                      className="border-border/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {judge.name}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {judge.assignedTeamsCount || 0} teams
                      </TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg"
                                  onClick={() => handleEditClick(judge)}
                                >
                                  <Edit2 className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit judge</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg"
                                  onClick={() => openAssignmentModal(judge)}
                                >
                                  <Users className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Assign teams</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-destructive hover:text-destructive"
                                  onClick={() => handleDeleteClick(judge.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete judge</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Modal Dialog */}
      {showAssignmentModal && selectedJudge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="relative w-full max-w-2xl">
            <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Assign Teams</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select teams for {selectedJudge.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAssignmentModal(false)}
                    className="size-8 rounded-lg"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              </CardHeader>

              {/* Round Selection and Team Selection */}
              <CardContent className="space-y-4">
                {/* Rounds Dropdown */}
                <div className="space-y-2 w-full">
                  <Label htmlFor="round-select">Select Round</Label>
                  <Select
                    value={selectedRound || ""}
                    onValueChange={setSelectedRound}
                  >
                    <SelectTrigger
                      id="round-select"
                      className="rounded-lg w-full p-3"
                    >
                      <SelectValue placeholder="Choose a round" />
                    </SelectTrigger>
                    <SelectContent className="w-full p-3">
                      {[...rounds]
                        .sort(
                          (a, b) =>
                            new Date(b._id).getTime() -
                            new Date(a._id).getTime(),
                        )
                        .map((round) => (
                          <SelectItem key={round._id} value={round._id}>
                            Round {round.round_number}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teams for Selected Round */}
                {selectedRound ? (
                  <div className="space-y-2">
                    <Label>Teams in Round</Label>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {teams.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic text-center py-4">
                          No teams available for this round
                        </p>
                      ) : (
                        teams
                          .filter((team) => !disabledTeamIds.includes(team.id))
                          .map((team) => {
                            const isAssigned = tempAssignedTeams.includes(
                              team.id,
                            );

                            return (
                              <button
                                key={team.id}
                                onClick={() => handleToggleTeamSelection(team.id)}
                                disabled={isAssigningTeams}
                                className={cn(
                                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                                  isAssigned
                                    ? "border-primary bg-primary/10"
                                    : "border-border/50 bg-muted/50 hover:border-border hover:bg-muted",
                                  "disabled:opacity-50 disabled:cursor-not-allowed",
                                )}
                              >
                                <span className="font-medium text-foreground">
                                  {team.name}
                                </span>

                                {isAssigned && (
                                  <svg
                                    className="size-5 text-primary"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-center py-8">
                    Please select a round first
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    {tempAssignedTeams.length} of {teams.length} teams selected
                  </p>
                  <Button onClick={saveAssignments} disabled={isAssigningTeams}>
                    {isAssigningTeams ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Done"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Edit Judge Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Judge</DialogTitle>
            <DialogDescription>
              Update the judge name and email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-judge-name">Judge Name</Label>
              <Input
                id="edit-judge-name"
                value={editJudgeName}
                onChange={(e) => setEditJudgeName(e.target.value)}
                placeholder="e.g. Dr. Neha Iyer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-judge-email">Email</Label>
              <Input
                id="edit-judge-email"
                type="email"
                value={editJudgeEmail}
                onChange={(e) => setEditJudgeEmail(e.target.value)}
                placeholder="judge@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditJudge}
              disabled={isEditingJudge || !editJudgeName || !editJudgeEmail}
              className="rounded-xl"
            >
              {isEditingJudge ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Judge Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Judge</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this judge? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingJudge}
              className="rounded-xl"
            >
              {isDeletingJudge ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
