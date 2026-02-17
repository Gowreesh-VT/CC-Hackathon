"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useGetTeamRoundsQuery } from "@/lib/redux/api/teamApi";
import { LoadingState } from "@/components/loading-state";
import { setBreadcrumbs } from "@/lib/hooks/useBreadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Page() {
  const { data: rounds = [], isLoading } = useGetTeamRoundsQuery();

  // Set breadcrumbs for team rounds
  useEffect(() => {
    setBreadcrumbs([{ label: "Rounds", href: "/team/rounds" }]);
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading rounds..." fullScreen={true} />;
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Available Rounds
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a round to view and manage your submissions
        </p>
      </header>

      {rounds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No rounds are currently available.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Rounds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50">
                  <TableRow>
                    <TableHead>Round</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Subtask</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rounds.map((round: any) => (
                    <TableRow key={round._id}>
                      <TableCell className="font-semibold">
                        Round {round.round_number}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(round.start_time)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(round.end_time)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {round.has_selected ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-sm">
                            {round.has_selected ? "Selected" : "Not Selected"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {round.has_submitted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-sm">
                            {round.has_submitted
                              ? "Submitted"
                              : "Not Submitted"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            round.is_active
                              ? "default"
                              : round.submission_enabled
                                ? "secondary"
                                : "outline"
                          }
                          className={cn(
                            round.is_active &&
                              "bg-green-500/10 text-green-700 hover:bg-green-500/10",
                          )}
                        >
                          {round.is_active
                            ? "Active"
                            : round.submission_enabled
                              ? "Submissions Open"
                              : "Locked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/team/rounds/${round._id}`}>
                          <Button size="sm" variant="outline">
                            {round.submitted ? "View" : "Open"}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
