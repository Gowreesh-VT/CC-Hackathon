"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Edit, Trash2, Save, PlayCircle, StopCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useGetRoundDetailsQuery,
  useGetAdminRoundsQuery,
  useGetAllSubtasksQuery,
  useGetTracksQuery,
  useUpdateRoundMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useToggleRoundStatusMutation,
  useGetRoundTeamsQuery,
  useUpdateRoundTeamsMutation,
  useAllocateSubtasksToTeamsMutation,
  useGetRoundPairsQuery,
  useCreateRoundPairMutation,
  useDeleteRoundPairMutation,
  useAllocateSubtasksToPairsMutation,
} from "@/lib/redux/api/adminApi";
import type { Pair, RoundTeam } from "@/lib/redux/api/types";
import { toast } from "sonner";

export default function RoundDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;

  // RTK Query Hooks
  const { data: round, isLoading: roundLoading } = useGetRoundDetailsQuery(roundId);
  const { data: rounds = [] } = useGetAdminRoundsQuery();
  const { data: allSubtasks = [], isLoading: subtasksLoading } = useGetAllSubtasksQuery();
  const { data: tracks = [] } = useGetTracksQuery();
  const [updateRound] = useUpdateRoundMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [toggleRoundStatus] = useToggleRoundStatusMutation();
  const { data: roundTeamsData, isLoading: roundTeamsLoading } = useGetRoundTeamsQuery(roundId);
  const [updateRoundTeams] = useUpdateRoundTeamsMutation();
  const [allocateSubtasks] = useAllocateSubtasksToTeamsMutation();
  const [createRoundPair] = useCreateRoundPairMutation();
  const [deleteRoundPair] = useDeleteRoundPairMutation();
  const [allocateSubtasksToPairs] = useAllocateSubtasksToPairsMutation();

  const round2Id =
    rounds.find((r) => r.round_number === 2)?._id ||
    rounds.find((r) => r.round_number === 2)?.id ||
    "";
  const isRound2View = round?.round_number === 2;
  const isRound3View = round?.round_number === 3;
  const isRound4View = round?.round_number === 4;
  const isRound1View = round?.round_number === 1;
  const isTeamAllotmentView = isRound1View || isRound2View;

  const { data: roundPairsData } = useGetRoundPairsQuery(round2Id, {
    skip: !round2Id || !isRound2View,
  });

  // Local State for forms
  const [instructions, setInstructions] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [createSubtaskOpen, setCreateSubtaskOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDesc, setNewSubtaskDesc] = useState("");
  const [newSubtaskTrackId, setNewSubtaskTrackId] = useState("");
  const [editSubtaskOpen, setEditSubtaskOpen] = useState(false);
  const [editSubtaskId, setEditSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("");
  const [editSubtaskDesc, setEditSubtaskDesc] = useState("");
  const [editSubtaskTrackId, setEditSubtaskTrackId] = useState("");
  const [isUpdatingSubtask, setIsUpdatingSubtask] = useState(false);
  const [deleteConfirmSubtaskId, setDeleteConfirmSubtaskId] = useState<
    string | null
  >(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);
  const [allowedTeamIds, setAllowedTeamIds] = useState<Set<string>>(new Set());
  const [subtaskAssignments, setSubtaskAssignments] = useState<Record<string, { slot1: string; slot2: string }>>({});
  const [isSavingShortlist, setIsSavingShortlist] = useState(false);
  const [isSavingAllotments, setIsSavingAllotments] = useState(false);
  const [submissionToggled, setSubmissionToggled] = useState(false);
  const [selectedPairTeamIds, setSelectedPairTeamIds] = useState<string[]>([]);
  const [isPairingBusy, setIsPairingBusy] = useState(false);
  const [pairSubtaskAssignments, setPairSubtaskAssignments] = useState<Record<string, { slot1: string; slot2: string }>>({});

  const loading = roundLoading || subtasksLoading || roundTeamsLoading;

  // Initialize form state when data is loaded
  useEffect(() => {
    if (round) {
      // Set breadcrumbs
      setBreadcrumbs([
        { label: "Rounds", href: "/admin/rounds" },
        {
          label: `Round ${round.round_number}`,
          href: `/admin/rounds/${roundId}`,
        },
      ]);

      setInstructions(round.instructions || "");
      if (round.start_time) {
        const date = new Date(round.start_time);
        const localIso = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16);
        setStartTime(localIso);
      }
      if (round.end_time) {
        const date = new Date(round.end_time);
        const localIso = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000,
        )
          .toISOString()
          .slice(0, 16);
        setEndTime(localIso);
      }
    }
  }, [round]);

  useEffect(() => {
    if (roundTeamsData?.teams_by_track) {
      const allowed = new Set<string>();
      const assignments: Record<string, { slot1: string; slot2: string }> = {};
      Object.values(roundTeamsData.teams_by_track).forEach((teams) => {
        teams.forEach((t) => {
          if (t.allowed) allowed.add(t.id);
          if (t.subtask_history?.options?.length) {
            assignments[t.id] = {
              slot1: t.subtask_history.options[0]?.id ?? "",
              slot2: t.subtask_history.options[1]?.id ?? "",
            };
          }
        });
      });
      setAllowedTeamIds(allowed);
      setSubtaskAssignments(assignments);
    }
  }, [roundTeamsData]);

  useEffect(() => {
    if (!isRound3View || !roundTeamsData?.teams_by_track) return;
    const next: Record<string, { slot1: string; slot2: string }> = {};
    Object.values(roundTeamsData.teams_by_track).forEach((teams) => {
      teams.forEach((team) => {
        const pairId = team.pair?.pair_id;
        if (!pairId || next[pairId]) return;
        next[pairId] = {
          slot1: team.subtask_history?.options?.[0]?.id ?? "",
          slot2: team.subtask_history?.options?.[1]?.id ?? "",
        };
      });
    });
    setPairSubtaskAssignments(next);
  }, [isRound3View, roundTeamsData]);

  const handleUpdateRound = async () => {
    try {
      await updateRound({
        id: roundId,
        body: {
          instructions,
          start_time: startTime ? new Date(startTime).toISOString() : undefined,
          end_time: endTime ? new Date(endTime).toISOString() : undefined,
        },
      }).unwrap();
      toast.success("Round updated successfully");
    } catch (e) {
      console.error(e);
      toast.error("Error updating round");
    }
  };

  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle || !newSubtaskDesc || !newSubtaskTrackId) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createSubtask({ title: newSubtaskTitle, description: newSubtaskDesc, track_id: newSubtaskTrackId }).unwrap();
      toast.success("Subtask created successfully");
      setCreateSubtaskOpen(false);
      setNewSubtaskTitle(""); setNewSubtaskDesc(""); setNewSubtaskTrackId("");
    } catch {
      toast.error("Error creating subtask");
    }
  };

  const handleEditSubtask = (task: any) => {
    setEditSubtaskId(task._id || task.id);
    setEditSubtaskTitle(task.title || "");
    setEditSubtaskDesc(task.description || "");
    setEditSubtaskTrackId(task.track_id || "");
    setEditSubtaskOpen(true);
  };

  const handleUpdateSubtask = async () => {
    if (!editSubtaskId) return;
    setIsUpdatingSubtask(true);
    try {
      await updateSubtask({ id: editSubtaskId, body: { title: editSubtaskTitle, description: editSubtaskDesc, track_id: editSubtaskTrackId } }).unwrap();
      toast.success("Subtask updated");
      setEditSubtaskOpen(false);
    } catch {
      toast.error("Error updating subtask");
    } finally {
      setIsUpdatingSubtask(false);
    }
  ;}

  const handleDeleteSubtask = (id: string) => {
    setDeleteConfirmSubtaskId(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteSubtask = async () => {
    if (!deleteConfirmSubtaskId) return;
    setIsDeletingSubtask(true);
    try {
      await deleteSubtask(deleteConfirmSubtaskId).unwrap();
      toast.success("Subtask deleted");
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmSubtaskId(null);
    } catch (e) {
      console.error(e);
      toast.error("Error deleting subtask");
    } finally {
      setIsDeletingSubtask(false);
    }
  };

  const handleToggleRoundStatus = async () => {
    if (!round) return;
    try {
      await toggleRoundStatus({
        id: roundId,
        action: round.is_active ? "stop" : "start",
      }).unwrap();
      toast.success(
        round.is_active
          ? "Round stopped successfully"
          : "Round started successfully",
      );
    } catch (e) {
      console.error(e);
      toast.error(
        round.is_active ? "Failed to stop round" : "Failed to start round",
      );
    }
  };

  const handleToggleSubmission = async (checked: boolean) => {
    setSubmissionToggled(checked);
    try {
      await updateRound({
        id: roundId,
        body: { is_active: checked },
      }).unwrap();
      toast.success(`Submissions ${checked ? "enabled" : "disabled"}`);
    } catch (e) {
      console.error(e);
      setSubmissionToggled(!checked);
      toast.error("Failed to toggle submission");
    }
  };

  const handleToggleTeamAllowed = (teamId: string) => {
    setAllowedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId); else next.add(teamId);
      return next;
    });
  };

  const handleSaveShortlist = async () => {
    const shortlistRoundId = isRound1View ? round2Id : roundId;
    if (isRound1View && !round2Id) {
      toast.error("Round 2 is not available yet");
      return;
    }
    setIsSavingShortlist(true);
    try {
      await updateRoundTeams({ roundId: shortlistRoundId, teamIds: [...allowedTeamIds] }).unwrap();
      toast.success("Shortlist saved");
    } catch {
      toast.error("Failed to save shortlist");
    } finally {
      setIsSavingShortlist(false);
    }
  };

  const handleSaveAllotments = async () => {
    const allocations = Object.entries(subtaskAssignments)
      .filter(([teamId, v]) =>
        (isRound2View ? allowedTeamIds.has(teamId) : true) && (v.slot1 || v.slot2),
      )
      .map(([teamId, v]) => ({
        teamId,
        subtaskIds: [v.slot1, v.slot2].filter(Boolean),
      }));

    if (allocations.length === 0) {
      toast.error("No subtasks selected to save");
      return;
    }
    setIsSavingAllotments(true);
    try {
      await allocateSubtasks({ roundId, allocations }).unwrap();
      toast.success(`Subtask options assigned to ${allocations.length} team(s)`);
    } catch {
      toast.error("Failed to save subtask allotments");
    } finally {
      setIsSavingAllotments(false);
    }
  };

  const handleCreatePair = async () => {
    if (!isRound2View || !round2Id) return;
    if (selectedPairTeamIds.length !== 2) {
      toast.error("Select exactly 2 teams to create a pair");
      return;
    }
    const unpaired = Object.values(roundPairsData?.unpaired_by_track || {}).flat();
    const teamA = (unpaired as any[]).find((t: any) => t.id === selectedPairTeamIds[0]);
    const teamB = (unpaired as any[]).find((t: any) => t.id === selectedPairTeamIds[1]);
    if (!teamA || !teamB || teamA.track_id !== teamB.track_id) {
      toast.error("Pick 2 unpaired teams from the same track");
      return;
    }
    setIsPairingBusy(true);
    try {
      await createRoundPair({
        roundId: round2Id,
        teamAId: selectedPairTeamIds[0],
        teamBId: selectedPairTeamIds[1],
      }).unwrap();
      setSelectedPairTeamIds([]);
      toast.success("Pair created");
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to create pair");
    } finally {
      setIsPairingBusy(false);
    }
  };

  const handleUnpair = async (pairId: string) => {
    if (!round2Id) return;
    setIsPairingBusy(true);
    try {
      await deleteRoundPair({ roundId: round2Id, pairId }).unwrap();
      toast.success("Pair removed");
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to remove pair");
    } finally {
      setIsPairingBusy(false);
    }
  };

  const handleSavePairAllotments = async () => {
    const allocations = Object.entries(pairSubtaskAssignments)
      .filter(([, v]) => v.slot1 && v.slot2)
      .map(([pairId, v]) => ({
        pairId,
        subtaskIds: [v.slot1, v.slot2],
      }));

    if (allocations.length === 0) {
      toast.error("No pair subtasks selected to save");
      return;
    }

    setIsSavingAllotments(true);
    try {
      await allocateSubtasksToPairs({ roundId, allocations }).unwrap();
      toast.success(`Subtask options assigned to ${allocations.length} pair(s)`);
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to save pair allotments");
    } finally {
      setIsSavingAllotments(false);
    }
  };

  const teamsByTrack: Record<string, RoundTeam[]> = roundTeamsData?.teams_by_track
    ? Object.fromEntries(
        Object.entries(roundTeamsData.teams_by_track).map(([track, teams]) => [
          track,
          round?.round_number === 4
            ? [...teams]
            : [...teams].sort((a, b) => {
                const aSortScore = a.previous_round_score ?? a.score ?? -1;
                const bSortScore = b.previous_round_score ?? b.score ?? -1;
                return bSortScore - aSortScore;
              }),
        ]),
      )
    : {};

  const pairsFromTeams = Object.values(teamsByTrack).flatMap((teams) => {
    const seen = new Set<string>();
    const items: Array<{
      pair_id: string;
      track: string;
      track_id: string | null;
      team_a: { id: string; team_name: string };
      team_b: { id: string; team_name: string };
      priority_team_id?: string | null;
      auto_assigned?: boolean;
      status: "pending" | "selected" | "auto-assigned";
    }> = [];

    teams.forEach((team) => {
      const pairId = team.pair?.pair_id;
      if (!pairId || seen.has(pairId)) return;
      const mate = teams.find((t) => t.id === team.pair?.teammate_id);
      if (!mate) return;
      seen.add(pairId);
      items.push({
        pair_id: pairId,
        track: team.track,
        track_id: team.track_id,
        team_a: { id: team.id, team_name: team.team_name },
        team_b: { id: mate.id, team_name: mate.team_name },
        priority_team_id:
          team.priority_meta?.priority_team_id ||
          mate.priority_meta?.priority_team_id ||
          team.subtask_history?.priority_team_id ||
          mate.subtask_history?.priority_team_id ||
          null,
        auto_assigned: team.subtask_history?.auto_assigned || false,
        status:
          team.subtask_history?.selected && mate.subtask_history?.selected
            ? team.subtask_history?.auto_assigned || mate.subtask_history?.auto_assigned
              ? "auto-assigned"
              : "selected"
            : "pending",
      });
    });
    return items;
  });

  if (loading) return <LoadingState message="Loading round details..." />;
  if (!round) return <LoadingState message="Round not found" />;

  const shortlistedTeamsByTrackForRound2: Record<string, RoundTeam[]> = isRound2View
    ? Object.fromEntries(
        Object.entries(teamsByTrack as Record<string, RoundTeam[]>)
          .map(([track, teams]) => [track, teams.filter((t) => allowedTeamIds.has(t.id))])
          .filter(([, teams]) => teams.length > 0),
      )
    : teamsByTrack;

  const teamsByTrackForTeamAllotment: Record<string, RoundTeam[]> = isRound2View
    ? shortlistedTeamsByTrackForRound2
    : teamsByTrack;
  const unpairedByTrackEntries = Object.entries(
    roundPairsData?.unpaired_by_track || {},
  ).sort(([a], [b]) => a.localeCompare(b));
  const existingPairsByTrack = (roundPairsData?.paired || []).reduce(
    (acc, pair) => {
      const trackName = pair.track || "Unassigned";
      if (!acc[trackName]) acc[trackName] = [];
      acc[trackName].push(pair);
      return acc;
    },
    {} as Record<string, Pair[]>,
  );
  const existingPairsByTrackEntries = Object.entries(existingPairsByTrack).sort(
    ([a], [b]) => a.localeCompare(b),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Round {round.round_number}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={round.is_active ? "default" : "secondary"}>
              {round.is_active ? "Active" : "Inactive"}
            </Badge>
            <span className="text-sm text-muted-foreground">{round._id}</span>
          </div>
        </div>
          <Button
            onClick={handleToggleRoundStatus}
            className="gap-2 rounded-xl"
          >
            {round.is_active ? (
              <>
                <StopCircle className="size-4" /> Stop round
              </>
            ) : (
              <>
                <PlayCircle className="size-4" /> Start round
              </>
            )}
          </Button>
        </div>
      <Card className="w-full">
        <CardHeader className="flex w-full justify-between">
          <CardTitle>Round Settings</CardTitle>
          <Button onClick={handleUpdateRound} className="gap-2 w-fit">
            <Save className="size-4" /> Save
          </Button>
        </CardHeader>
        <CardContent className="flex w-full gap-3">
          <div className="grid grid-cols-1 w-2/3 gap-2">
            <div className="space-y-2 w-full">
              <Label>Instructions</Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Round instructions..."
                className="min-h-25"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 w-1/3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block"
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Subtasks</CardTitle>
          <Dialog open={createSubtaskOpen} onOpenChange={setCreateSubtaskOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="size-4" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Subtask</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Subtask Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Track</Label>
                  <Select value={newSubtaskTrackId} onValueChange={setNewSubtaskTrackId}>
                    <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                    <SelectContent>{tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newSubtaskDesc}
                    onChange={(e) => setNewSubtaskDesc(e.target.value)}
                    placeholder="Detailed description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateSubtask}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={editSubtaskOpen} onOpenChange={setEditSubtaskOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Subtask</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editSubtaskTitle}
                    onChange={(e) => setEditSubtaskTitle(e.target.value)}
                    placeholder="Subtask Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Track</Label>
                  <Select value={editSubtaskTrackId} onValueChange={setEditSubtaskTrackId}>
                    <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                    <SelectContent>{tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editSubtaskDesc}
                    onChange={(e) => setEditSubtaskDesc(e.target.value)}
                    placeholder="Detailed description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditSubtaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateSubtask}
                  disabled={isUpdatingSubtask}
                >
                  {isUpdatingSubtask ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Subtask</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete this subtask? This action
                  cannot be undone.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteSubtask}
                  disabled={isDeletingSubtask}
                >
                  {isDeletingSubtask ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {allSubtasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No subtasks defined.
            </p>
          ) : (
            <div className="space-y-3">
              {allSubtasks.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-muted/20"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{task.title}</h4>
                      {task.track ? (
                        <Badge variant="outline" className="text-xs">
                          {task.track}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSubtask(task)}
                      className="hover:bg-muted"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSubtask(task.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isTeamAllotmentView && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="size-5 text-muted-foreground" /> Subtask Allotment</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isRound1View
                  ? "Manually assign two options to each team for Round 1."
                  : "Manually assign two options to each shortlisted team for Round 2."}
              </p>
            </div>
            <Button onClick={handleSaveAllotments} disabled={isSavingAllotments} className="gap-2">
              <Save className="size-4" />{isSavingAllotments ? "Saving..." : "Save Allotments"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.keys(teamsByTrackForTeamAllotment).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isRound2View ? "No shortlisted teams found for Round 2." : "No teams found."}
              </p>
            ) : (
              Object.entries(teamsByTrackForTeamAllotment).map(([trackName, teams]) => {
                const trackSubtasks = allSubtasks.filter(
                  (s: any) => s.track_id === teams[0]?.track_id
                );
                return (
                  <div key={trackName}>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Badge variant="outline">{trackName}</Badge>
                      <span className="text-muted-foreground text-sm font-normal">
                        {teams.filter((t) => subtaskAssignments[t.id]).length} / {teams.length} assigned
                      </span>
                    </h3>
                    <div className="rounded-xl border border-border/50 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="font-semibold">Team</TableHead>
                            <TableHead className="font-semibold">Team&apos;s Choice</TableHead>
                            <TableHead className="font-semibold">Assign Options (max 2)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teams.map((team) => (
                            <TableRow key={team.id} className="border-border/50">
                              <TableCell className="font-medium">{team.team_name}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {team.subtask_history?.selected?.title ?? <span className="italic">Not chosen yet</span>}
                              </TableCell>
                              <TableCell>
                                <div className="grid grid-cols-2 gap-2 min-w-[380px]">
                                  <Select
                                    value={subtaskAssignments[team.id]?.slot1 ?? ""}
                                    onValueChange={(val) =>
                                      setSubtaskAssignments((prev) => ({
                                        ...prev,
                                        [team.id]: { ...prev[team.id], slot1: val },
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Option 1..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {trackSubtasks.length === 0 ? (
                                        <SelectItem value="__none" disabled>No subtasks for this track</SelectItem>
                                      ) : (
                                        trackSubtasks.map((s: any) => (
                                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={subtaskAssignments[team.id]?.slot2 ?? ""}
                                    onValueChange={(val) =>
                                      setSubtaskAssignments((prev) => ({
                                        ...prev,
                                        [team.id]: { ...prev[team.id], slot2: val },
                                      }))
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Option 2..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {trackSubtasks.length === 0 ? (
                                        <SelectItem value="__none" disabled>No subtasks for this track</SelectItem>
                                      ) : (
                                        trackSubtasks.map((s: any) => (
                                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                        ))
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {isRound3View && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="size-5 text-muted-foreground" /> Pair Subtask Allotment</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Assign 2 options per pair. Priority team picks first; partner gets the remaining option.</p>
            </div>
            <Button onClick={handleSavePairAllotments} disabled={isSavingAllotments} className="gap-2">
              <Save className="size-4" />{isSavingAllotments ? "Saving..." : "Save Pair Allotments"}
            </Button>
          </CardHeader>
          <CardContent>
            {pairsFromTeams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pairs found.</p>
            ) : (
              <div className="rounded-xl border border-border/50 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Track</TableHead>
                      <TableHead>Pair</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Option 1</TableHead>
                      <TableHead>Option 2</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pairsFromTeams.map((pair) => {
                      const trackSubtasks = allSubtasks.filter(
                        (s: any) => s.track_id === pair.track_id
                      );
                      const priorityName =
                        pair.priority_team_id === pair.team_a.id
                          ? pair.team_a.team_name
                          : pair.priority_team_id === pair.team_b.id
                            ? pair.team_b.team_name
                            : "Will be set on save";
                      return (
                        <TableRow key={pair.pair_id}>
                          <TableCell>{pair.track}</TableCell>
                          <TableCell>{pair.team_a.team_name} + {pair.team_b.team_name}</TableCell>
                          <TableCell>{priorityName}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                pair.status === "pending"
                                  ? "outline"
                                  : pair.status === "auto-assigned"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {pair.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={pairSubtaskAssignments[pair.pair_id]?.slot1 ?? ""}
                              onValueChange={(val) =>
                                setPairSubtaskAssignments((prev) => ({
                                  ...prev,
                                  [pair.pair_id]: { ...prev[pair.pair_id], slot1: val },
                                }))
                              }
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Option 1..." />
                              </SelectTrigger>
                              <SelectContent>
                                {trackSubtasks.map((s: any) => (
                                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={pairSubtaskAssignments[pair.pair_id]?.slot2 ?? ""}
                              onValueChange={(val) =>
                                setPairSubtaskAssignments((prev) => ({
                                  ...prev,
                                  [pair.pair_id]: { ...prev[pair.pair_id], slot2: val },
                                }))
                              }
                            >
                              <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Option 2..." />
                              </SelectTrigger>
                              <SelectContent>
                                {trackSubtasks.map((s: any) => (
                                  <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isRound4View && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="size-5 text-muted-foreground" /> Pair Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {pairsFromTeams.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pair data available.</p>
            ) : (
              <div className="space-y-2">
                {pairsFromTeams.map((pair) => (
                  <div key={pair.pair_id} className="rounded-lg border p-3 text-sm">
                    <span className="font-medium">{pair.track}: </span>
                    {pair.team_a.team_name} + {pair.team_b.team_name}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isRound4View && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Round 4 Evaluation Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(teamsByTrack).length === 0 ? (
              <p className="text-sm text-muted-foreground">No teams found for Round 4.</p>
            ) : (
              Object.entries(teamsByTrack).map(([trackName, teams]) => (
                <div key={trackName}>
                  <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                    <Badge variant="outline">{trackName}</Badge>
                  </h3>
                  <div className="rounded-xl border border-border/50 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead>SEC Score</TableHead>
                          <TableHead>Faculty Score</TableHead>
                          <TableHead>Submission</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teams.map((team) => (
                          <TableRow key={team.id}>
                            <TableCell className="font-medium">{team.team_name}</TableCell>
                            <TableCell>{team.sec_score ?? "—"}</TableCell>
                            <TableCell>{team.faculty_score ?? "—"}</TableCell>
                            <TableCell>
                              {team.submission ? (
                                <Badge variant="default" className="text-xs">Submitted</Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">None</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {isRound2View && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Users className="size-5 text-muted-foreground" /> Pair Teams</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Select two unpaired teams in the same track and create a pair.</p>
            </div>
            <Button onClick={handleCreatePair} disabled={isPairingBusy || selectedPairTeamIds.length !== 2}>
              Create Pair
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {unpairedByTrackEntries.map(([track, teams]) => (
              <div key={track}>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Badge variant="outline">{track}</Badge>
                  <span className="text-muted-foreground text-sm font-normal">
                    {(teams as any[]).length} unpaired
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(teams as any[]).map((team) => {
                    const checked = selectedPairTeamIds.includes(team.id);
                    return (
                      <label key={team.id} className={cn("flex items-center gap-2 rounded border px-3 py-2 cursor-pointer", checked && "bg-primary/5 border-primary/40")}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) => {
                            setSelectedPairTeamIds((prev) => {
                              if (value) {
                                if (prev.length >= 2) return prev;
                                return [...prev, team.id];
                              }
                              return prev.filter((id) => id !== team.id);
                            });
                          }}
                        />
                        <span className="text-sm">{team.team_name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <h4 className="font-medium mb-2">Existing Pairs</h4>
              {(roundPairsData?.paired || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No pairs created yet.</p>
              ) : (
                <div className="space-y-4">
                  {existingPairsByTrackEntries.map(([track, pairs]) => (
                    <div key={track}>
                      <h5 className="mb-2 flex items-center gap-2">
                        <Badge variant="outline">{track}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {(pairs || []).length} pair(s)
                        </span>
                      </h5>
                      <div className="space-y-2">
                        {(pairs || []).map((pair) => (
                          <div key={pair.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                            <div className="text-sm">
                              <span>{pair.team_a.team_name} + {pair.team_b.team_name}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnpair(pair.id)}
                              disabled={isPairingBusy}
                            >
                              Unpair
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isRound1View && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
            <CardTitle className="flex items-center gap-2"><Users className="size-5 text-muted-foreground" /> Shortlist Teams For Round 2</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Choose teams from Round 1 that should advance to Rounds 2, 3, and 4.</p>
            </div>
          <Button onClick={handleSaveShortlist} disabled={isSavingShortlist} className="gap-2">
            <Save className="size-4" />{isSavingShortlist ? "Saving..." : "Save Shortlist"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.keys(teamsByTrack).length === 0 ? (
            <p className="text-sm text-muted-foreground">No teams found for this round.</p>
          ) : (
            Object.entries(teamsByTrack).map(([trackName, teams]) => (
              <div key={trackName}>
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <Badge variant="outline">{trackName}</Badge>
                  <span className="text-muted-foreground text-sm font-normal">{teams.filter((t) => allowedTeamIds.has(t.id)).length} / {teams.length} shortlisted</span>
                </h3>
                <div className="rounded-xl border border-border/50 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="w-10">
                          <Checkbox
                            checked={teams.length > 0 && teams.every((t) => allowedTeamIds.has(t.id))}
                            onCheckedChange={(checked) => {
                              setAllowedTeamIds((prev) => {
                                const next = new Set(prev);
                                teams.forEach((t) => checked ? next.add(t.id) : next.delete(t.id));
                                return next;
                              });
                            }}
                          />
                        </TableHead>
                        <TableHead className="font-semibold">Team</TableHead>
                        <TableHead className="font-semibold text-right">Team Size</TableHead>
                        {roundTeamsData?.previous_round_number ? (
                          <TableHead className="font-semibold text-right">
                            Round {roundTeamsData.previous_round_number} Score
                          </TableHead>
                        ) : null}
                        <TableHead className="font-semibold text-right">Score</TableHead>
                        <TableHead className="font-semibold">Submission</TableHead>
                        <TableHead className="font-semibold">Subtask</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow
                          key={team.id}
                          className={cn("border-border/50 cursor-pointer", allowedTeamIds.has(team.id) && "bg-primary/5")}
                          onClick={() => handleToggleTeamAllowed(team.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox checked={allowedTeamIds.has(team.id)} onCheckedChange={() => handleToggleTeamAllowed(team.id)} />
                          </TableCell>
                          <TableCell className="font-medium">{team.team_name}</TableCell>
                          <TableCell className="text-right">
                            {team.team_size ?? "—"}
                          </TableCell>
                          {roundTeamsData?.previous_round_number ? (
                            <TableCell className="text-right font-semibold">
                              {team.previous_round_score !== null &&
                              team.previous_round_score !== undefined ? (
                                <span className="text-primary">
                                  {team.previous_round_score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          ) : null}
                          <TableCell className="text-right font-semibold">
                            {team.score !== null ? <span className="text-primary">{team.score}</span> : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {team.submission ? <Badge variant="default" className="text-xs">Submitted</Badge> : <Badge variant="outline" className="text-xs">None</Badge>}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{team.subtask_history?.selected?.title ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))
          )}
        </CardContent>
        </Card>
      )}
    </div>
  );
}
