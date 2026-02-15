"use client";

import { useState, useEffect } from "react";
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
  const [roundNumber, setRoundNumber] = useState("");
  const [instructions, setInstructions] = useState("");
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Rounds
  const fetchRounds = async () => {
    try {
      const res = await fetch("/api/admin/rounds");
      if (res.ok) {
        const data = await res.json();
        setRounds(data);
      }
    } catch (error) {
      console.error("Error fetching rounds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRounds();
  }, []);

  const handleCreateRound = async () => {
    if (!roundNumber) return;

    try {
      const res = await fetch("/api/admin/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          round_number: parseInt(roundNumber),
          instructions,
          // name is not in schema but maybe we interpret "Round X"
        }),
      });

      if (res.ok) {
        alert("Round created successfully");
        setCreateOpen(false);
        setRoundNumber("");
        setInstructions("");
        fetchRounds();
      } else {
        const err = await res.json();
        alert(`Failed to create round: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create round");
    }
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
                  Enter the round number and optional instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="round-number">Round Number</Label>
                  <Input
                    id="round-number"
                    type="number"
                    placeholder="e.g. 2"
                    value={roundNumber}
                    onChange={(e) => setRoundNumber(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions (Optional)</Label>
                  <Input
                    id="instructions"
                    placeholder="Brief instructions..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
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
                  disabled={!roundNumber}
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
            {loading ? (
                <p className="text-sm text-muted-foreground">Loading rounds...</p>
            ) : rounds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rounds found. Create one to get started.</p>
            ) : (
                rounds.map((round) => (
                  <Link
                    key={round._id}
                    href={`/admin/rounds/${round._id}`}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all",
                      "hover:border-primary/30 hover:bg-muted/40 hover:shadow-md",
                      "focus-visible:outline focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-foreground">
                        {`Round ${round.round_number}`}
                      </span>
                      <Badge
                        variant={
                          round.is_active
                            ? "default"
                            : round.end_time && new Date() > new Date(round.end_time)
                              ? "secondary" // Passed/Closed
                              : "outline" // Upcoming/Inactive
                        }
                      >
                         {round.is_active ? "active" : "inactive"}
                      </Badge>
                      {round.submission_enabled && (
                        <Badge variant="secondary">Submissions on</Badge>
                      )}
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </Link>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}