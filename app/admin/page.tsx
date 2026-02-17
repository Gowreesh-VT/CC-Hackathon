"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/loading-state";
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
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  useGetAdminDashboardQuery,
  useGetAdminRoundsQuery,
  useToggleRoundStatusMutation,
} from "@/lib/redux/api/adminApi";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [submissionToggled, setSubmissionToggled] = useState(false);

  // Set breadcrumbs (only Dashboard)
  useEffect(() => {
    setBreadcrumbs([]);
  }, []);

  // RTK Query Hooks
  const { data: stats, isLoading: statsLoading } = useGetAdminDashboardQuery();
  const { data: rounds = [], isLoading: roundsLoading } =
    useGetAdminRoundsQuery();
  const [toggleRoundStatus] = useToggleRoundStatusMutation();

  const loading = statsLoading || roundsLoading;

  // Initialize selectedRoundId from stats
  useEffect(() => {
    if (stats?.currentRound && !selectedRoundId) {
      setSelectedRoundId(stats.currentRound.id);
    }
  }, [stats, selectedRoundId]);

  // Sync toggle state with selected round
  useEffect(() => {
    if (selectedRoundId && rounds.length > 0) {
      const r = rounds.find((rd: any) => rd._id === selectedRoundId);
      if (r) setSubmissionToggled(r.submission_enabled ?? false);
    }
  }, [selectedRoundId, rounds]);

  const handleStartRound = async () => {
    if (!selectedRoundId) return;
    try {
      await toggleRoundStatus({
        id: selectedRoundId,
        action: "start",
      }).unwrap();
      toast.success("Round started successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to start round");
    }
  };

  const handleStopRound = async () => {
    if (!selectedRoundId) return;
    try {
      await toggleRoundStatus({ id: selectedRoundId, action: "stop" }).unwrap();
      toast.success("Round stopped successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to stop round");
    }
  };

  const handleToggleSubmission = async (checked: boolean) => {
    // Optimistic update
    setSubmissionToggled(checked);
    if (!selectedRoundId) return;

    try {
      await toggleRoundStatus({
        id: selectedRoundId,
        action: "toggle-submission",
      }).unwrap();
      toast.success(`Submissions ${checked ? "enabled" : "disabled"}`);
    } catch (e) {
      console.error(e);
      setSubmissionToggled(!checked); // Revert on failure
      toast.error("Failed to toggle submission");
    }
  };

  // Prepare chart data
  const evaluationData = [
    { name: "Submitted", value: stats?.submissionsCount || 0, fill: "#10b981" },
    {
      name: "Pending",
      value: stats?.pendingEvaluationCount || 0,
      fill: "#f59e0b",
    },
  ];

  const totalSubmissions =
    (stats?.submissionsCount || 0) + (stats?.pendingEvaluationCount || 0);

  if (loading || !stats) {
    return <LoadingState message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-2 ">
        {/* Summary card: all teams */}
        <Card
          className={cn(
            "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
            "dark:border-white/10 dark:bg-card/80",
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
                {stats.totalTeams}
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
            "dark:border-white/10 dark:bg-card/80",
          )}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="size-5 text-muted-foreground" />
              Current round status
              {stats.currentRound && (
                <Badge
                  variant={
                    stats.roundStatus === "active" ? "default" : "secondary"
                  }
                  className="mt-2 w-fit"
                >
                  {stats.currentRound.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileCheck className="size-4" />
                  <span className="text-sm font-medium">Submissions</span>
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {stats.submissionsCount}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4" />
                  <span className="text-sm font-medium">
                    Pending evaluation
                  </span>
                </div>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {stats.pendingEvaluationCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>{" "}
        {/* Submissions Status Chart */}
        <Card
          className={cn(
            "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
            "dark:border-border/50 dark:bg-card/80",
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileCheck className="size-5 text-muted-foreground" />
              Submission status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {totalSubmissions > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={evaluationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {evaluationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">No submissions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Team Distribution Chart */}
        <Card
          className={cn(
            "overflow-hidden border-border/50 bg-card/80 shadow-lg backdrop-blur-sm",
            "dark:border-border/50 dark:bg-card/80",
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-muted-foreground" />
              Team distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.totalTeams ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: "Distribution",
                      active: Math.floor((stats?.totalTeams || 0) * 0.6),
                      shortlisted: Math.floor((stats?.totalTeams || 0) * 0.25),
                      eliminated: Math.floor((stats?.totalTeams || 0) * 0.15),
                    },
                  ]}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="active"
                    stackId="a"
                    fill="#10b981"
                    name="Active"
                  />
                  <Bar
                    dataKey="shortlisted"
                    stackId="a"
                    fill="#3b82f6"
                    name="Shortlisted"
                  />
                  <Bar
                    dataKey="eliminated"
                    stackId="a"
                    fill="#ef4444"
                    name="Eliminated"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">No team data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Top 5 Teams by Cumulative Score */}
        <Card
          className={cn(
            "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm lg:col-span-2",
            "dark:border-white/10 dark:bg-card/80",
          )}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5 text-muted-foreground" />
              Top 5 teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topTeams && stats.topTeams.length > 0 ? (
              <div className="space-y-2">
                {stats.topTeams.map((team, index) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {team.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {team.track}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {team.cumulativeScore}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <p className="text-muted-foreground">
                  No score data available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
