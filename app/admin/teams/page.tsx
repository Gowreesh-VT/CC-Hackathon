"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Lock,
  Trophy,
  XCircle,
  Users,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  useGetAdminTeamsQuery, 
  useCreateTeamMutation, 
  useUpdateTeamStatusMutation 
} from "@/lib/redux/api/adminApi";
import { toast } from "sonner";

// Define team type based on API response
type Team = {
  id: string;
  name: string;
  track: string;
  currentRoundId: string | null;
  currentRoundName: string | null;
  score: number | null;
  submissionStatus: string; // 'submitted' | 'pending' | 'locked'
  isLocked: boolean;
  isShortlisted: boolean;
  isEliminated: boolean;
};

export default function AdminTeamsPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  // RTK Query Hooks
  const { data: teams = [], isLoading } = useGetAdminTeamsQuery(undefined, {
      pollingInterval: 30000, // Poll every 30s
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true
  });
  const [createTeam] = useCreateTeamMutation();
  const [updateTeamStatus] = useUpdateTeamStatusMutation();

  const selectedTeam = selectedTeamId
    ? teams.find((t: any) => t.id === selectedTeamId)
    : null;

  const handleUpdateTeamStatus = async (teamId: string, updates: any) => {
      try {
          await updateTeamStatus({ id: teamId, updates }).unwrap();
          toast.success("Team status updated");
          setSelectedTeamId(null);
      } catch (e) {
          console.error(e);
          toast.error("Error updating team");
      }
  };

  const handleLockSubmission = (teamId: string) => {
      handleUpdateTeamStatus(teamId, { is_locked: true });
  };

  const handleShortlist = (teamId: string) => {
      handleUpdateTeamStatus(teamId, { is_shortlisted: true });
  };

  const handleEliminate = (teamId: string) => {
      handleUpdateTeamStatus(teamId, { is_eliminated: true });
  };

  // Create Team Logic
  const [createOpen, setCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamEmail, setNewTeamEmail] = useState("");
  const [newTeamTrack, setNewTeamTrack] = useState("");

  const handleCreateTeam = async () => {
    try {
        await createTeam({ 
            name: newTeamName, 
            email: newTeamEmail,
            track: newTeamTrack 
        }).unwrap();
        
        toast.success("Team created successfully");
        setCreateOpen(false);
        setNewTeamName("");
        setNewTeamEmail("");
        setNewTeamTrack("");
    } catch (error) {
        console.error("Error creating team:", error);
        toast.error("Error creating team");
    }
  };

  const submissionStatusVariant = (status: string) => {
    switch (status) {
      case "eliminated": return "destructive";
      case "shortlisted": return "default";
      case "submitted": return "default";
      case "pending": return "secondary";
      case "locked": return "outline";
      default: return "secondary";
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
        <div className="mt-4">
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="size-4" /> Create Team
            </Button>
        </div>
      </header>
    
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Enter the team name and track.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input
                    id="name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="e.g. CodeWizards"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Leader Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newTeamEmail}
                    onChange={(e) => setNewTeamEmail(e.target.value)}
                    placeholder="leader@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="track">Track</Label>
                  <Input
                    id="track"
                    value={newTeamTrack}
                    onChange={(e) => setNewTeamTrack(e.target.value)}
                    placeholder="e.g. AI/ML"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={!newTeamName || !newTeamEmail}>
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-12 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">Loading teams...</TableCell>
                    </TableRow>
                ) : (
                    teams.map((team: any) => (
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
                        <TableCell className="font-medium">
                            <Link href={`/admin/teams/${team.id}`} className="hover:underline text-blue-400">
                                {team.name}
                            </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                        {team.track ?? "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                        {team.currentRoundName ?? "—"}
                        </TableCell>
                        <TableCell>
                        {team.score ?? "N/A"}
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
                    ))
                )}
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