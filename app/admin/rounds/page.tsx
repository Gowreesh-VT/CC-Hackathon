"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, ChevronRight, ListOrdered } from "lucide-react";
import { mockRounds } from "@/lib/mock/adminMockData";
import { cn } from "@/lib/utils";

// Define round type
type Round = {
  id: string;
  name: string;
  status: 'completed' | 'active' | 'pending';
  submissions: number;
};

export default function AdminRoundsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [newRoundName, setNewRoundName] = useState("");

  const handleCreateRound = () => {
    // TODO: useCreateRoundMutation() when backend is ready
    console.log("Create round", newRoundName);
    setNewRoundName("");
    setCreateOpen(false);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Rounds
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage all rounds and open round details to edit subtasks and teams.
        </p>
      </header>

      <Card
        className={cn(
          "overflow-hidden border-white/10 bg-card/80 shadow-lg backdrop-blur-sm",
          "dark:border-white/10 dark:bg-card/80"
        )}
      >
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListOrdered className="size-5 text-muted-foreground" />
            All rounds
          </CardTitle>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl">
                <Plus className="size-4" />
                Create round
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create new round</DialogTitle>
                <DialogDescription>
                  Add a new round to the event. You can set subtasks and
                  controls from the round detail page.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="round-name">Round name</Label>
                  <Input
                    id="round-name"
                    placeholder="e.g. Round 2"
                    value={newRoundName}
                    onChange={(e) => setNewRoundName(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRound}
                  disabled={!newRoundName.trim()}
                  className="rounded-xl"
                >
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockRounds.map((round) => (
              <Link
                key={round.id}
                href={`/admin/round/${round.id}`}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all",
                  "hover:border-primary/30 hover:bg-muted/40 hover:shadow-md",
                  "focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-foreground">
                    {round.name ?? `Round ${round.round_number ?? round.id}`}
                  </span>
                  <Badge
                    variant={
                      round.status === "active"
                        ? "default"
                        : round.status === "closed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {round.status ?? "draft"}
                  </Badge>
                  {round.submission_enabled && (
                    <Badge variant="secondary">Submissions on</Badge>
                  )}
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}