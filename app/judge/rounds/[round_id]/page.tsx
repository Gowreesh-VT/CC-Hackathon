"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  useGetJudgeRoundDetailsQuery,
  useSubmitScoreMutation,
  useUpdateScoreMutation,
} from "@/lib/redux/api/judgeApi";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import { ensureAbsoluteUrl } from "@/lib/utils";

type TeamEvaluation = {
  teamId: string;
  teamName: string;
  taskName: string;
  status: "pending" | "scored";
  score: number | null;
  sec_score?: number | null;
  faculty_score?: number | null;
  remarks: string;
  selected_subtask?: any;
  submission?: any;
};

export default function JudgeRoundDetailsPage() {
  const { round_id } = useParams<{ round_id: string }>();
  const roundId = round_id ?? "";

  const { data: roundData, isLoading } = useGetJudgeRoundDetailsQuery(roundId);
  const roundInfo = roundData?.round;
  const teamsData: any[] = roundData?.teams ?? [];

  const [evaluations, setEvaluations] = useState<TeamEvaluation[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [dialogScore, setDialogScore] = useState("");
  const [dialogSecScore, setDialogSecScore] = useState("");
  const [dialogFacultyScore, setDialogFacultyScore] = useState("");
  const [dialogRemarks, setDialogRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isRound4 = roundInfo?.round_number === 4;

  const [submitScore] = useSubmitScoreMutation();
  const [updateScore] = useUpdateScoreMutation();

  useEffect(() => {
    if (Array.isArray(teamsData) && teamsData.length >= 0) {
      setEvaluations(
        teamsData.map((team: any) => ({
          teamId: team.team_id,
          teamName: team.team_name,
          taskName: team.selected_subtask?.title || "No task",
          // score is nested: { score, remarks, status }
          status: (team.score?.status as "pending" | "scored") ?? "pending",
          score: team.score?.score ?? null,
          sec_score: team.score?.sec_score ?? null,
          faculty_score: team.score?.faculty_score ?? null,
          remarks: team.score?.remarks ?? "",
          selected_subtask: team.selected_subtask,
          submission: team.submission,
        })),
      );
    }
  }, [roundData]);

  useEffect(() => {
    if (roundInfo) {
      setBreadcrumbs([
        { label: "Rounds", href: "/judge/rounds" },
        {
          label: `Round ${roundInfo.round_number}`,
          href: `/judge/rounds/${roundId}`,
        },
      ]);
    }
  }, [roundInfo, roundId]);

  useEffect(() => {
    if (!selectedTeamId) return;
    const evaluation = evaluations.find((e) => e.teamId === selectedTeamId);
    if (evaluation) {
      setDialogScore(evaluation.score?.toString() ?? "");
      setDialogSecScore(evaluation.sec_score?.toString() ?? "");
      setDialogFacultyScore(evaluation.faculty_score?.toString() ?? "");
      setDialogRemarks(evaluation.remarks ?? "");
    }
  }, [selectedTeamId, evaluations]);

  const handleOpenDialog = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleCloseDialog = () => {
    setSelectedTeamId(null);
    setDialogScore("");
    setDialogSecScore("");
    setDialogFacultyScore("");
    setDialogRemarks("");
  };

  const isValidScoreInput = (value: string) => {
    // Allow only 0-100 range
    return (
      value === "" ||
      (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 100)
    );
  };

  const handleScoreChange = (value: string) => {
    if (isValidScoreInput(value)) setDialogScore(value);
  };

  const handleSaveEvaluation = async () => {
    if (!selectedTeamId) return;
    if (!selectedTeam?.submission) {
      toast.error("Cannot score: team has not submitted for this round");
      return;
    }
    if (!isRound4 && dialogScore === "") {
      toast.error("Score is required");
      return;
    }
    if (isRound4 && (dialogSecScore === "" || dialogFacultyScore === "")) {
      toast.error("Both SEC and Faculty scores are required");
      return;
    }

    const score = parseInt(dialogScore);
    const secScore = parseInt(dialogSecScore);
    const facultyScore = parseInt(dialogFacultyScore);
    if (!isRound4 && (score < 0 || score > 100)) {
      toast.error("Please enter a valid score (0-100)");
      return;
    }
    if (isRound4 && (secScore < 0 || secScore > 100 || facultyScore < 0 || facultyScore > 100)) {
      toast.error("Please enter valid SEC/Faculty scores (0-100)");
      return;
    }

    const alreadyScored = selectedTeam?.status === "scored";

    setIsSaving(true);
    try {
      if (alreadyScored) {
        await updateScore({
          roundId,
          teamId: selectedTeamId,
          ...(isRound4
            ? { sec_score: secScore, faculty_score: facultyScore }
            : { score }),
          remarks: dialogRemarks,
        }).unwrap();
      } else {
        await submitScore({
          roundId,
          teamId: selectedTeamId,
          ...(isRound4
            ? { sec_score: secScore, faculty_score: facultyScore }
            : { score }),
          remarks: dialogRemarks,
        }).unwrap();
      }

      setEvaluations((prev) =>
        prev.map((e) =>
          e.teamId === selectedTeamId
            ? {
                ...e,
                score: isRound4 ? null : score,
                sec_score: isRound4 ? secScore : e.sec_score,
                faculty_score: isRound4 ? facultyScore : e.faculty_score,
                remarks: dialogRemarks,
                status: "scored",
              }
            : e,
        ),
      );

      toast.success("Evaluation saved");
      setSelectedTeamId(null);
    } catch (error: any) {
      const apiError =
        error?.data?.error ||
        error?.error ||
        "Failed to save evaluation";
      toast.error(
        Array.isArray(apiError) ? apiError.join(", ") : String(apiError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const pending = evaluations.filter((e) => e.status === "pending").length;
  const scored = evaluations.filter((e) => e.status === "scored").length;

  const selectedTeam = evaluations.find((e) => e.teamId === selectedTeamId);
  const overviewText = selectedTeam?.submission?.overview?.trim() || "";
  const overviewLinks: string[] = Array.from(
    new Set<string>(overviewText.match(/https?:\/\/[^\s)]+/gi) || []),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {roundInfo ? (
            `Round ${roundInfo.round_number} – Team Evaluations`
          ) : (
            <Skeleton className="h-8 w-80" />
          )}
        </h1>
        <p className="text-muted-foreground">
          Review and score team submissions
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[pending, scored, pending + scored].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {isLoading ? <Skeleton className="h-4 w-20" /> : ["Status", "Pending", "Scored"][i]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {i === 0 ? "Active" : i === 1 ? pending : scored}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {i === 0
                      ? "Evaluations ongoing"
                      : i === 1
                      ? "Teams remaining"
                      : "Teams evaluated"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  {isRound4 ? (
                    <>
                      <TableHead>SEC Score</TableHead>
                      <TableHead>Faculty Score</TableHead>
                    </>
                  ) : (
                    <TableHead>Score</TableHead>
                  )}
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        {isRound4 && (
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        )}
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-24 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : evaluations.map((e) => (
                      <TableRow key={e.teamId}>
                        <TableCell className="font-medium">
                          {e.teamName}
                        </TableCell>
                        <TableCell>{e.taskName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              e.status === "scored" ? "default" : "outline"
                            }
                          >
                            {e.status === "scored" ? "Scored" : "Pending"}
                          </Badge>
                        </TableCell>
                        {isRound4 ? (
                          <>
                            <TableCell>
                              {e.sec_score !== null && e.sec_score !== undefined
                                ? `${e.sec_score}/100`
                                : "-"}
                            </TableCell>
                            <TableCell>
                              {e.faculty_score !== null &&
                              e.faculty_score !== undefined
                                ? `${e.faculty_score}/100`
                                : "-"}
                            </TableCell>
                          </>
                        ) : (
                          <TableCell>
                            {e.score !== null ? `${e.score}/100` : "-"}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTeamId(e.teamId)}
                          >
                            {e.status === "scored" ? "Edit" : "Evaluate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={!!selectedTeamId} onOpenChange={() => setSelectedTeamId(null)}>
        <DialogContent className="!w-[88vw] lg:!w-[1000px] !max-w-[88vw] lg:!max-w-[1000px] flex max-h-[82vh] flex-col overflow-hidden rounded-2xl border bg-background p-0 shadow-xl">
          <DialogHeader>
            <div className="border-b bg-background px-6 py-5">
              <DialogTitle className="text-xl">
                Evaluate {selectedTeam?.teamName}
              </DialogTitle>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Task: {selectedTeam?.taskName || "No task"}
                </Badge>
                <Badge
                  variant={selectedTeam?.status === "scored" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {selectedTeam?.status === "scored" ? "Scored" : "Pending"}
                </Badge>
                {!isRound4 && selectedTeam?.score !== null && (
                  <Badge variant="outline" className="text-xs">
                    Current: {selectedTeam?.score}/100
                  </Badge>
                )}
                {isRound4 && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      SEC: {selectedTeam?.sec_score ?? "-"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Faculty: {selectedTeam?.faculty_score ?? "-"}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Submission
              </p>
              {selectedTeam?.submission ? (
                <div className="mt-3 space-y-3">
                  {selectedTeam.submission.github_link && (
                    <div className="rounded-lg border bg-background px-4 py-3">
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        GitHub
                      </p>
                      <a
                        href={ensureAbsoluteUrl(selectedTeam.submission.github_link)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md px-0 py-0 text-sm font-medium text-primary hover:underline"
                      >
                        GitHub -&gt;
                      </a>
                    </div>
                  )}
                  {selectedTeam.submission.file_url && (
                    <div className="rounded-lg border bg-background px-4 py-3">
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Drive / File
                      </p>
                      <a
                        href={ensureAbsoluteUrl(selectedTeam.submission.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md px-0 py-0 text-sm font-medium text-primary hover:underline"
                      >
                        Drive / File -&gt;
                      </a>
                    </div>
                  )}
                  <div className="rounded-lg border bg-background px-4 py-3">
                    <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      Overview / Comments
                    </p>
                    <div className="max-h-24 overflow-y-auto rounded-md border bg-muted/20 p-2">
                      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
                        {overviewText || "No overview provided."}
                      </p>
                    </div>
                    {overviewLinks.length > 0 && (
                      <div className="mt-2 max-h-20 space-y-1 overflow-y-auto pr-1">
                        {overviewLinks.map((link, idx) => (
                          <a
                            key={`${link}-${idx}`}
                            href={ensureAbsoluteUrl(link)}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-sm font-medium text-primary hover:underline"
                          >
                            Open link {idx + 1} -&gt;
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm italic text-muted-foreground">
                  Team has not submitted yet. Scoring is available only after submission.
                </p>
              )}
            </div>

            <div className="space-y-4">
              {isRound4 ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      SEC Score <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs text-muted-foreground">(0-100)</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={dialogSecScore}
                      onChange={(e) => {
                        if (isValidScoreInput(e.target.value)) {
                          setDialogSecScore(e.target.value);
                        }
                      }}
                      placeholder="Enter SEC score"
                      className="h-11 w-full text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Faculty Score <span className="text-red-500">*</span>
                      <span className="ml-2 text-xs text-muted-foreground">(0-100)</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={dialogFacultyScore}
                      onChange={(e) => {
                        if (isValidScoreInput(e.target.value)) {
                          setDialogFacultyScore(e.target.value);
                        }
                      }}
                      placeholder="Enter Faculty score"
                      className="h-11 w-full text-base"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Score <span className="text-red-500">*</span>
                    <span className="ml-2 text-xs text-muted-foreground">(0-100)</span>
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={dialogScore}
                    onChange={(e) => handleScoreChange(e.target.value)}
                    placeholder="Enter score"
                    className="h-11 w-full text-base"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Remarks <span className="ml-2 text-xs text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  value={dialogRemarks}
                  onChange={(e) => setDialogRemarks(e.target.value)}
                  placeholder="Add feedback for the team..."
                  rows={4}
                  className="w-full resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t bg-background px-6 py-4 sm:justify-end">
            <Button variant="outline" onClick={() => setSelectedTeamId(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEvaluation} disabled={isSaving || !selectedTeam?.submission}>
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
