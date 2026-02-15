"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Users,
  FileCheck,
  Clock,
  PlayCircle,
  StopCircle,
  Upload,
} from "lucide-react";
import { mockDashboard, mockRounds } from "@/lib/mock/adminMockData";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(
    mockDashboard.currentRoundId
  );
  const [submissionToggled, setSubmissionToggled] = useState(
    mockDashboard.submissionEnabled
  );

  const handleStartRound = () => {
    if (!selectedRoundId) return;
    // TODO: useStartRoundMutation() when backend is ready
    console.log("Start round", selectedRoundId);
  };

  const handleStopRound = () => {
    if (!selectedRoundId) return;
    // TODO: useStopRoundMutation() when backend is ready
    console.log("Stop round", selectedRoundId);
  };

  const handleToggleSubmission = (checked: boolean) => {
    setSubmissionToggled(checked);
    if (!selectedRoundId) return;
    // TODO: useToggleRoundSubmissionMutation() when backend is ready
    console.log("Toggle submission", selectedRoundId, checked);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview and controls for the event
        </p>
      </header>

      {/* Summary card: all teams */}
      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="size-5 text-muted-foreground" />
            Teams overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-baseline gap-4">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {mockDashboard.totalTeams}
            </span>
            <span className="text-muted-foreground">total teams</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Quick glance at all registered teams and their status.
          </p>
        </CardContent>
      </Card>

      {/* Current round: submissions & pending evaluation */}
      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="size-5 text-muted-foreground" />
            Current round status
          </CardTitle>
          {mockDashboard.currentRound && (
            <Badge
              variant={
                mockDashboard.roundStatus === "active" ? "default" : "secondary"
              }
              className="mt-2 w-fit"
            >
              {mockDashboard.currentRound.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileCheck className="size-4" />
                <span className="text-sm font-medium">Submissions</span>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {mockDashboard.submissionsCount}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" />
                <span className="text-sm font-medium">Pending evaluation</span>
              </div>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {mockDashboard.pendingEvaluationCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Round control panel */}
      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg">Round controls</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select a round and start, stop, or toggle submissions.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            <div className="space-y-2">
              <Label>Round</Label>
              <Select
                value={selectedRoundId ?? ""}
                onValueChange={(v) => setSelectedRoundId(v || null)}
              >
                <SelectTrigger
                  className={cn(
                    "w-full sm:w-64 rounded-xl border-white/10 bg-background/80",
                    "dark:border-white/10 dark:bg-background/80"
                  )}
                >
                  <SelectValue placeholder="Select a round" />
                </SelectTrigger>
                <SelectContent>
                  {mockRounds.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name ?? `Round ${r.round_number ?? r.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleStartRound}
                disabled={!selectedRoundId}
                className="gap-2 rounded-xl"
              >
                <PlayCircle className="size-4" />
                Start round
              </Button>
              <Button
                variant="secondary"
                onClick={handleStopRound}
                disabled={!selectedRoundId}
                className="gap-2 rounded-xl"
              >
                <StopCircle className="size-4" />
                Stop round
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Switch
                id="submission-toggle"
                checked={submissionToggled}
                onCheckedChange={handleToggleSubmission}
              />
              <Label htmlFor="submission-toggle" className="cursor-pointer">
                Submissions {submissionToggled ? "on" : "off"}
              </Label>
            </div>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Upload className="size-4" />
              Turn on to allow teams to submit for the selected round.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}