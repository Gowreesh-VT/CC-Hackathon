"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useGetRoundDetailsQuery } from "@/lib/redux/api/adminApi";
import {
  useGetJudgeAssignedTeamsQuery,
  useSubmitScoreMutation,
} from "@/lib/redux/api/judgeApi";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import { ensureAbsoluteUrl } from "@/lib/utils";

// Define types
type TeamEvaluation = {
  teamId: string;
  teamName: string;
  taskName: string;
  status: "pending" | "scored";
  score: number | null;
  remarks: string;
  selected_subtask?: any;
  submission?: any;
};

type SubmissionData = {
  team_id: string;
  team_name: string;
  selected_subtask?: { title: string };
  submission?: {
    file_url?: string;
    github_link?: string;
    submission_text?: string;
  };
  score: number | null;
  remarks: string;
};

export default function JudgeRoundDetailsPage() {
  const params = useParams();
  const roundId = (params?.round_id as string) || "";

  const { data: roundData } = useGetRoundDetailsQuery(roundId);
  const { data: teamsData, isLoading: isLoadingTeams } =
    useGetJudgeAssignedTeamsQuery(roundId);

  const [evaluations, setEvaluations] = useState<TeamEvaluation[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [dialogScore, setDialogScore] = useState<string>("");
  const [dialogRemarks, setDialogRemarks] = useState<string>("");
  const [isSavingDialog, setIsSavingDialog] = useState(false);

  const [submitScore] = useSubmitScoreMutation();
  // Initialize evaluations from teams data
  useEffect(() => {
    if (teamsData && Array.isArray(teamsData)) {
      console.log("Teams data for evaluations:", teamsData);
      const evaluationsList: TeamEvaluation[] = teamsData.map((team: any) => ({
        teamId: team.team_id,
        teamName: team.team_name,
        taskName: team.chosenTask || team.selected_subtask?.title || "No task",
        status: team.status as "scored" | "pending",
        score: team.score ?? null,
        remarks: team.remarks ?? "",
        selected_subtask: team.selected_subtask,
        submission: team.submission,
      }));
      setEvaluations(evaluationsList);
      console.log(evaluationsList);
    }
  }, [teamsData]);

  // Set breadcrumbs when round data is available
  useEffect(() => {
    if (roundData) {
      setBreadcrumbs([
        {
          label: "Rounds",
          href: "/judge/rounds",
        },
        {
          label: `Round ${roundData.round_number || roundId}`,
          href: `/judge/rounds/${roundId}`,
        },
      ]);
    }
  }, [roundData, roundId]);

  // Load team score and remarks when dialog opens
  useEffect(() => {
    if (selectedTeamId) {
      const selectedEvaluation = evaluations.find(
        (e) => e.teamId === selectedTeamId,
      );
      if (selectedEvaluation) {
        setDialogScore((selectedEvaluation.score ?? "").toString());
        setDialogRemarks(selectedEvaluation.remarks ?? "");
      }
    }
  }, [selectedTeamId, evaluations]);

  const handleOpenDialog = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  const handleCloseDialog = () => {
    setSelectedTeamId(null);
    setDialogScore("");
    setDialogRemarks("");
  };

  const handleScoreChange = (value: string) => {
    // Allow only 0-10 range
    if (
      value === "" ||
      (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 10)
    ) {
      setDialogScore(value);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!selectedTeamId) return;

    const score = dialogScore === "" ? 0 : parseInt(dialogScore);
    if (score < 0 || score > 10) {
      toast.error("Please enter a valid score (0-10)");
      return;
    }

    setIsSavingDialog(true);

    try {
      await submitScore({
        roundId,
        teamId: selectedTeamId,
        scores: {
          score,
          remarks: dialogRemarks,
        },
      }).unwrap();

      toast.success("Evaluation saved successfully");

      // Update evaluations list
      setEvaluations((prev) =>
        prev.map((item) =>
          item.teamId === selectedTeamId
            ? {
                ...item,
                status: "scored",
                score,
                remarks: dialogRemarks,
              }
            : item,
        ),
      );

      handleCloseDialog();
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
      toast.error("Failed to save evaluation. Please try again.");
    } finally {
      setIsSavingDialog(false);
    }
  };

  const pendingCount = evaluations.filter((e) => e.status === "pending").length;
  const scoredCount = evaluations.filter((e) => e.status === "scored").length;

  const selectedTeam = evaluations.find((e) => e.teamId === selectedTeamId);

  if (isLoadingTeams) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Round {roundData?.round_number || roundId} - Team Evaluations
        </h1>
        <p className="text-muted-foreground">
          Review and score team submissions for this round
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Evaluating teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Teams remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scoredCount}</div>
            <p className="text-xs text-muted-foreground">Teams evaluated</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Teams for Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto overflow-y-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => (
                  <TableRow key={evaluation.teamId}>
                    <TableCell className="font-medium">
                      {evaluation.teamName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {evaluation.taskName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          evaluation.status === "scored" ? "default" : "outline"
                        }
                        className={
                          evaluation.status === "scored"
                            ? "bg-green-500/10 text-green-700 border-green-200"
                            : "bg-yellow-500/10 text-yellow-700 border-yellow-200"
                        }
                      >
                        {evaluation.status === "scored" ? "Scored" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {evaluation.score !== null
                        ? `${evaluation.score}/10`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDialog(evaluation.teamId);
                        }}
                      >
                        {evaluation.status === "scored" ? "Edit" : "Evaluate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Submission Dialog */}
      <Dialog
        open={!!selectedTeamId}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Evaluate {selectedTeam?.teamName}</DialogTitle>
          </DialogHeader>

          {/* Task Details */}
          {selectedTeam?.selected_subtask && (
            <div className="space-y-4 border rounded-lg p-4 bg-blue-500/5 border-blue-500/20">
              <h3 className="font-semibold text-sm text-foreground">
                Assigned Task
              </h3>

              {/* Task Title */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  TASK TITLE
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {selectedTeam.selected_subtask.title}
                </p>
              </div>

              {/* Track */}
              {selectedTeam.selected_subtask.track && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    TRACK
                  </p>
                  <Badge variant="secondary">
                    {selectedTeam.selected_subtask.track}
                  </Badge>
                </div>
              )}

              {/* Description */}
              {selectedTeam.selected_subtask.description && (
                <div className="max-h-25 overflow-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    DESCRIPTION
                  </p>
                  <p className="text-sm text-foreground">
                    {selectedTeam.selected_subtask.description}
                  </p>
                </div>
              )}

              {/* Problem Statement */}
              {selectedTeam.selected_subtask.statement && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    PROBLEM STATEMENT
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {selectedTeam.selected_subtask.statement}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Submission Details */}
          {selectedTeam && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <h3 className="font-semibold text-sm">Submission Details</h3>

              {/* Submitted Files */}
              {selectedTeam.submission?.file_url && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    SUBMITTED FILE
                  </p>
                  <a
                    href={ensureAbsoluteUrl(selectedTeam.submission.file_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {selectedTeam.submission.file_url}
                  </a>
                </div>
              )}

              {/* GitHub Link */}
              {selectedTeam.submission?.github_link && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    GITHUB LINK
                  </p>
                  <a
                    href={ensureAbsoluteUrl(
                      selectedTeam.submission.github_link,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {selectedTeam.submission.github_link}
                  </a>
                </div>
              )}

              {/* Submission Text */}
              {selectedTeam.submission?.submission_text && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    PROJECT OVERVIEW
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedTeam.submission.submission_text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Evaluation Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Score <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-2">
                  (0-10)
                </span>
              </label>
              <Input
                type="number"
                min="0"
                max="10"
                value={dialogScore}
                onChange={(e) => handleScoreChange(e.target.value)}
                placeholder="Enter score"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Remarks{" "}
                <span className="text-xs text-muted-foreground ml-2">
                  (optional)
                </span>
              </label>
              <Textarea
                value={dialogRemarks}
                onChange={(e) => setDialogRemarks(e.target.value)}
                placeholder="Add feedback for the team..."
                rows={6}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={isSavingDialog}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEvaluation} disabled={isSavingDialog}>
              {isSavingDialog && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSavingDialog ? "Saving..." : "Save Evaluation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
