"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ListPlus, Eye, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useGetAdminTeamsQuery,
  useGetTracksQuery,
  useCreateTeamMutation,
  useDeleteTeamMutation,
  useBatchCreateTeamsMutation,
} from "@/lib/redux/api/adminApi";

interface BatchRow {
  team_name: string;
  email: string;
  mobile_number: string;
  team_size: string;
  track_id: string;
}

export default function TeamsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const router = useRouter();
  const { data: teams = [], isLoading } = useGetAdminTeamsQuery();
  const { data: tracks = [] } = useGetTracksQuery();
  const [createTeam] = useCreateTeamMutation();
  const [deleteTeam] = useDeleteTeamMutation();
  const [batchCreateTeams] = useBatchCreateTeamsMutation();

  // Create single team state
  const [createOpen, setCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamEmail, setNewTeamEmail] = useState("");
  const [newTeamMobileNumber, setNewTeamMobileNumber] = useState("");
  const [newTeamSize, setNewTeamSize] = useState("1");
  const [newTeamTrackId, setNewTeamTrackId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openTrackSections, setOpenTrackSections] = useState<Record<string, boolean>>({});

  // Batch create state
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchRows, setBatchRows] = useState<BatchRow[]>([
    {
      team_name: "",
      email: "",
      mobile_number: "",
      team_size: "1",
      track_id: "",
    },
  ]);
  const [isBatchCreating, setIsBatchCreating] = useState(false);

  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      team.team_name?.toLowerCase().includes(query) ||
      team.email?.toLowerCase().includes(query) ||
      team.mobile_number?.toLowerCase().includes(query) ||
      team.track?.toLowerCase().includes(query)
    );
  });

  const trackGroups = useMemo(
    () =>
      Object.entries(
        filteredTeams.reduce<Record<string, typeof filteredTeams>>((acc, team) => {
          const track = team.track || "Unassigned";
          if (!acc[track]) acc[track] = [];
          acc[track].push(team);
          return acc;
        }, {}),
      ).sort(([a], [b]) => a.localeCompare(b)),
    [filteredTeams],
  );

  const trackKeys = useMemo(
    () => trackGroups.map(([track]) => track),
    [trackGroups],
  );

  useEffect(() => {
    setOpenTrackSections((prev) => {
      let changed = false;
      const next: Record<string, boolean> = {};

      trackKeys.forEach((track) => {
        if (prev[track] === undefined) {
          next[track] = true;
          changed = true;
        } else {
          next[track] = prev[track];
        }
      });

      if (Object.keys(prev).length !== trackKeys.length) {
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [trackKeys]);

  const handleCreateTeam = async () => {
    const parsedTeamSize = Number(newTeamSize);
    if (
      !newTeamName ||
      !newTeamEmail ||
      !newTeamMobileNumber ||
      !newTeamTrackId ||
      !Number.isFinite(parsedTeamSize) ||
      parsedTeamSize < 1
    ) {
      toast.error("Please fill all fields");
      return;
    }
    setIsCreating(true);
    try {
      await createTeam({
        team_name: newTeamName,
        email: newTeamEmail,
        mobile_number: newTeamMobileNumber,
        team_size: Math.trunc(parsedTeamSize),
        track_id: newTeamTrackId,
      }).unwrap();
      toast.success("Team created");
      setCreateOpen(false);
      setNewTeamName("");
      setNewTeamEmail("");
      setNewTeamMobileNumber("");
      setNewTeamSize("1");
      setNewTeamTrackId("");
    } catch {
      toast.error("Error creating team");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team?")) return;
    try {
      await deleteTeam(id).unwrap();
      toast.success("Team deleted");
    } catch {
      toast.error("Error deleting team");
    }
  };

  const handleBatchCreate = async () => {
    const valid = batchRows
      .map((r) => ({ ...r, parsedTeamSize: Number(r.team_size) }))
      .filter(
        (r) =>
          r.team_name &&
          r.email &&
          r.mobile_number &&
          r.track_id &&
          Number.isFinite(r.parsedTeamSize) &&
          r.parsedTeamSize >= 1,
      );
    if (valid.length === 0) {
      toast.error("Please fill at least one complete row");
      return;
    }
    setIsBatchCreating(true);
    try {
      await batchCreateTeams({
        teams: valid.map((r) => ({
          team_name: r.team_name,
          email: r.email,
          mobile_number: r.mobile_number,
          team_size: Math.trunc(r.parsedTeamSize),
          track_id: r.track_id,
        })),
      }).unwrap();
      toast.success(`${valid.length} teams created`);
      setBatchOpen(false);
      setBatchRows([
        {
          team_name: "",
          email: "",
          mobile_number: "",
          team_size: "1",
          track_id: "",
        },
      ]);
    } catch {
      toast.error("Error creating teams");
    } finally {
      setIsBatchCreating(false);
    }
  };

  const updateBatchRow = (index: number, field: keyof BatchRow, value: string) => {
    setBatchRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addBatchRow = () =>
    setBatchRows((prev) => [
      ...prev,
      {
        team_name: "",
        email: "",
        mobile_number: "",
        team_size: "1",
        track_id: "",
      },
    ]);
  const removeBatchRow = (index: number) =>
    setBatchRows((prev) => prev.filter((_, i) => i !== index));

  if (!mounted || isLoading) return <LoadingState message="Loading teams..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Teams</h1>
        <div className="flex items-center gap-2">
          {/* Batch create */}
          <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ListPlus className="size-4" /> Batch Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Batch Create Teams</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-4 max-h-[60vh] overflow-y-auto pr-1">
                {batchRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_120px_1fr_auto] gap-2 items-end">
                    <div className="space-y-1">
                      {i === 0 && <Label className="text-xs">Team Name</Label>}
                      <Input
                        placeholder="Team name"
                        value={row.team_name}
                        onChange={(e) => updateBatchRow(i, "team_name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {i === 0 && <Label className="text-xs">Email</Label>}
                      <Input
                        type="email"
                        placeholder="Email"
                        value={row.email}
                        onChange={(e) => updateBatchRow(i, "email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {i === 0 && <Label className="text-xs">Mobile Number</Label>}
                      <Input
                        placeholder="Mobile"
                        value={row.mobile_number}
                        onChange={(e) => updateBatchRow(i, "mobile_number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {i === 0 && <Label className="text-xs">Team Size</Label>}
                      <Input
                        type="number"
                        min={1}
                        placeholder="Size"
                        value={row.team_size}
                        onChange={(e) => updateBatchRow(i, "team_size", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      {i === 0 && <Label className="text-xs">Track</Label>}
                      <Select value={row.track_id} onValueChange={(v) => updateBatchRow(i, "track_id", v)}>
                        <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                        <SelectContent>
                          {tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeBatchRow(i)}
                      disabled={batchRows.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addBatchRow} className="gap-2 mt-2">
                  <Plus className="size-4" /> Add Row
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBatchOpen(false)}>Cancel</Button>
                <Button onClick={handleBatchCreate} disabled={isBatchCreating}>
                  {isBatchCreating
                    ? "Creating..."
                    : `Create ${batchRows.filter(
                        (r) =>
                          r.team_name &&
                          r.email &&
                          r.mobile_number &&
                          r.track_id &&
                          Number(r.team_size) >= 1,
                      ).length} teams`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Single create */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="size-4" /> Add Team</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Team</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="Team name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={newTeamEmail} onChange={(e) => setNewTeamEmail(e.target.value)} placeholder="team@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={newTeamMobileNumber}
                    onChange={(e) => setNewTeamMobileNumber(e.target.value)}
                    placeholder="9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Size</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newTeamSize}
                    onChange={(e) => setNewTeamSize(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Track</Label>
                  <Select value={newTeamTrackId} onValueChange={setNewTeamTrackId}>
                    <SelectTrigger><SelectValue placeholder="Select track" /></SelectTrigger>
                    <SelectContent>
                      {tracks.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTeam} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              All Teams ({filteredTeams.length}
              {filteredTeams.length !== teams.length ? ` / ${teams.length}` : ""}
              )
            </CardTitle>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by team, email, mobile, or track..."
              className="w-full sm:max-w-sm bg-background/80"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {trackGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed py-10 text-center text-muted-foreground">
              {teams.length === 0 ? "No teams yet" : "No teams match your search"}
            </div>
          ) : (
            trackGroups.map(([track, groupedTeams]) => (
              <section key={track} className="space-y-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 hover:bg-muted/30 transition-colors"
                  onClick={() =>
                    setOpenTrackSections((prev) => ({
                      ...prev,
                      [track]: !prev[track],
                    }))
                  }
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {track}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {groupedTeams.length} team(s)
                    </span>
                  </div>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform duration-300 ${
                      openTrackSections[track] ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`rounded-xl border bg-background/50 overflow-hidden transition-all duration-300 ${
                    openTrackSections[track] ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 border-transparent"
                  }`}
                >
                  <div>
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-muted/60 backdrop-blur">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="py-2.5">Name</TableHead>
                          <TableHead className="py-2.5">Mobile</TableHead>
                          <TableHead className="py-2.5 text-right">Team Size</TableHead>
                          <TableHead className="py-2.5 w-24 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedTeams.map((team) => (
                          <TableRow key={team.id} className="hover:bg-muted/30">
                            <TableCell className="py-3">
                              <a
                                href={`/admin/teams/${team.id}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {team.team_name}
                              </a>
                            </TableCell>
                            <TableCell className="py-3 text-sm">
                              {team.mobile_number || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3 text-right tabular-nums">
                              {team.team_size ?? (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View details"
                                  onClick={() => router.push(`/admin/teams/${team.id}`)}
                                >
                                  <Eye className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  title="Delete team"
                                  onClick={() => handleDeleteTeam(team.id)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </section>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
