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
import { Switch } from "@/components/ui/switch";
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
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Save,
  PlayCircle,
  StopCircle,
} from "lucide-react";
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
  useGetSubtasksQuery,
  useUpdateRoundMutation,
  useCreateSubtaskMutation,
  useUpdateSubtaskMutation,
  useDeleteSubtaskMutation,
  useToggleRoundStatusMutation,
  useGetRoundTeamsQuery,
  useUpdateRoundTeamsMutation,
  useGetRoundTeamSubtasksQuery,
  useUpdateRoundTeamSubtasksMutation,
} from "@/lib/redux/api/adminApi";
import { toast } from "sonner";

export default function RoundDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;

  // RTK Query Hooks
  const { data: round, isLoading: roundLoading } =
    useGetRoundDetailsQuery(roundId);
  const { data: subtasks = [], isLoading: subtasksLoading } =
    useGetSubtasksQuery(roundId);
  const [updateRound] = useUpdateRoundMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [updateSubtask] = useUpdateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();
  const [toggleRoundStatus] = useToggleRoundStatusMutation();
  const { data: roundTeams, isLoading: roundTeamsLoading } =
    useGetRoundTeamsQuery(roundId);
  const [updateRoundTeams] = useUpdateRoundTeamsMutation();
  const { data: roundTeamSubtasks, isLoading: teamSubtasksLoading } =
    useGetRoundTeamSubtasksQuery(roundId);
  const [updateRoundTeamSubtasks] = useUpdateRoundTeamSubtasksMutation();

  // Local State for forms
  const [instructions, setInstructions] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [createSubtaskOpen, setCreateSubtaskOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDesc, setNewSubtaskDesc] = useState("");
  const [newSubtaskTrack, setNewSubtaskTrack] = useState("");
  const [editSubtaskOpen, setEditSubtaskOpen] = useState(false);
  const [editSubtaskId, setEditSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState("");
  const [editSubtaskDesc, setEditSubtaskDesc] = useState("");
  const [editSubtaskTrack, setEditSubtaskTrack] = useState("");
  const [isUpdatingSubtask, setIsUpdatingSubtask] = useState(false);
  const [deleteConfirmSubtaskId, setDeleteConfirmSubtaskId] = useState<
    string | null
  >(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeletingSubtask, setIsDeletingSubtask] = useState(false);
  const [submissionToggled, setSubmissionToggled] = useState(false);
  const [allowedTeamIds, setAllowedTeamIds] = useState<string[]>([]);
  const [isSavingChanges, setIsSavingChanges] = useState(false);
  const [teamSubtaskMap, setTeamSubtaskMap] = useState<
    Record<string, string[]>
  >({});

  const loading =
    roundLoading || subtasksLoading || roundTeamsLoading || teamSubtasksLoading;

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
      setSubmissionToggled(round.submission_enabled ?? false);
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
    if (roundTeams?.allowedTeamIds) {
      setAllowedTeamIds(roundTeams.allowedTeamIds);
    }
  }, [roundTeams]);

  useEffect(() => {
    if (roundTeamSubtasks?.assignments) {
      const nextMap: Record<string, string[]> = {};
      roundTeamSubtasks.assignments.forEach((assignment) => {
        nextMap[assignment.teamId] = assignment.subtaskIds || [];
      });
      setTeamSubtaskMap(nextMap);
    }
  }, [roundTeamSubtasks]);

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
    try {
      await createSubtask({
        round_id: roundId,
        title: newSubtaskTitle,
        description: newSubtaskDesc,
        track: newSubtaskTrack,
      }).unwrap();

      toast.success("Subtask created successfully");
      setCreateSubtaskOpen(false);
      setNewSubtaskTitle("");
      setNewSubtaskDesc("");
      setNewSubtaskTrack("");
    } catch (e) {
      console.error(e);
      toast.error("Error creating subtask");
    }
  };

  const handleEditSubtask = (task: any) => {
    setEditSubtaskId(task._id || task.id);
    setEditSubtaskTitle(task.title || "");
    setEditSubtaskDesc(task.description || "");
    setEditSubtaskTrack(task.track || "");
    setEditSubtaskOpen(true);
  };

  const handleUpdateSubtask = async () => {
    if (!editSubtaskId) return;
    setIsUpdatingSubtask(true);
    try {
      await updateSubtask({
        id: editSubtaskId,
        body: {
          title: editSubtaskTitle,
          description: editSubtaskDesc,
          track: editSubtaskTrack,
          round_id: roundId,
        },
      }).unwrap();
      toast.success("Subtask updated");
      setEditSubtaskOpen(false);
      setEditSubtaskId(null);
      setEditSubtaskTitle("");
      setEditSubtaskDesc("");
      setEditSubtaskTrack("");
    } catch (e) {
      console.error(e);
      toast.error("Error updating subtask");
    } finally {
      setIsUpdatingSubtask(false);
    }
  };

  const handleDeleteSubtask = async (id: string) => {
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
      await toggleRoundStatus({
        id: roundId,
        action: "toggle-submission",
      }).unwrap();
      toast.success(`Submissions ${checked ? "enabled" : "disabled"}`);
    } catch (e) {
      console.error(e);
      setSubmissionToggled(!checked);
      toast.error("Failed to toggle submission");
    }
  };

  const handleToggleTeamAllowed = (teamId: string) => {
    setAllowedTeamIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const handleUpdateTeamSubtask = (
    teamId: string,
    index: number,
    subtaskId: string,
  ) => {
    setTeamSubtaskMap((prev) => {
      const next = { ...prev };
      const current = next[teamId] ? [...next[teamId]] : ["", ""];
      while (current.length < 2) current.push("");
      current[index] = subtaskId;
      next[teamId] = current;
      return next;
    });
  };

  const handleSaveChanges = async () => {
    setIsSavingChanges(true);
    try {
      // Save allowed teams
      await updateRoundTeams({ roundId, teamIds: allowedTeamIds }).unwrap();

      // Save team subtasks
      const assignments = Object.entries(teamSubtaskMap).map(
        ([teamId, subtaskIds]) => ({
          teamId,
          subtaskIds: subtaskIds.filter(Boolean),
        }),
      );
      await updateRoundTeamSubtasks({ roundId, assignments }).unwrap();

      toast.success("All changes saved successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save changes");
    } finally {
      setIsSavingChanges(false);
    }
  };

  if (loading) return <LoadingState message="Loading round details..." />;
  if (!round) return <LoadingState message="Round not found" />;

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
        <div className="flex flex-wrap items-center gap-3">
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
          <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2">
            <Switch
              id="submission-toggle"
              checked={submissionToggled}
              onCheckedChange={handleToggleSubmission}
            />
            <Label htmlFor="submission-toggle" className="cursor-pointer">
              Submissions {submissionToggled ? "on" : "off"}
            </Label>
          </div>
        </div>
      </div>
      <Card className="w-full">
        <CardHeader className="flex w-full justify-between">
          <CardTitle>Round Settings</CardTitle>
          {/* Add Date pickers here later */}
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
                  <Input
                    value={newSubtaskTrack}
                    onChange={(e) => setNewSubtaskTrack(e.target.value)}
                    placeholder="e.g. AI/ML"
                  />
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
                  <Input
                    value={editSubtaskTrack}
                    onChange={(e) => setEditSubtaskTrack(e.target.value)}
                    placeholder="e.g. AI/ML"
                  />
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
          {subtasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No subtasks defined.
            </p>
          ) : (
            <div className="space-y-3">
              {subtasks.map((task: any) => (
                <div
                  key={task._id}
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
                      onClick={() => handleDeleteSubtask(task._id)}
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

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Round Teams</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select allowed teams and assign two subtasks per team.
            </p>
          </div>
          <Button
            onClick={handleSaveChanges}
            disabled={isSavingChanges}
            className="gap-2"
          >
            <Save />
            {isSavingChanges ? "Saving..." : "Save"}
          </Button>
        </CardHeader>
        <CardContent>
          {roundTeams?.teams?.length ? (
            <div className="h-150 overflow-x-auto rounded-xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-12 font-semibold">Allow</TableHead>
                    <TableHead className="font-semibold">Team</TableHead>
                    <TableHead className="font-semibold">Track</TableHead>
                    <TableHead className="font-semibold">Score</TableHead>
                    <TableHead className="font-semibold">Subtask A</TableHead>
                    <TableHead className="font-semibold">Subtask B</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roundTeams.teams.map((team: any) => (
                    <TableRow key={team.id} className="border-border/50">
                      <TableCell>
                        <Checkbox
                          checked={allowedTeamIds.includes(team.id)}
                          onCheckedChange={() =>
                            handleToggleTeamAllowed(team.id)
                          }
                          aria-label={`Toggle ${team.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {team.track || "—"}
                      </TableCell>
                      <TableCell>{team.score ?? "—"}</TableCell>
                      <TableCell>
                        <Select
                          value={teamSubtaskMap[team.id]?.[0] || ""}
                          onValueChange={(value) =>
                            handleUpdateTeamSubtask(team.id, 0, value)
                          }
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select subtask" />
                          </SelectTrigger>
                          <SelectContent>
                            {subtasks.map((subtask: any) => (
                              <SelectItem
                                key={subtask._id || subtask.id}
                                value={subtask._id || subtask.id}
                              >
                                {subtask.track
                                  ? `${subtask.title} (${subtask.track})`
                                  : subtask.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={teamSubtaskMap[team.id]?.[1] || ""}
                          onValueChange={(value) =>
                            handleUpdateTeamSubtask(team.id, 1, value)
                          }
                        >
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Select subtask" />
                          </SelectTrigger>
                          <SelectContent>
                            {subtasks.map((subtask: any) => (
                              <SelectItem
                                key={subtask._id || subtask.id}
                                value={subtask._id || subtask.id}
                              >
                                {subtask.track
                                  ? `${subtask.title} (${subtask.track})`
                                  : subtask.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No teams found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
