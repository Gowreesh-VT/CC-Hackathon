"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function RoundDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;

  const [round, setRound] = useState<any>(null);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Round State
  const [instructions, setInstructions] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Create Subtask State
  const [createSubtaskOpen, setCreateSubtaskOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDesc, setNewSubtaskDesc] = useState("");

  const fetchData = async () => {
    try {
      const [roundRes, subtasksRes] = await Promise.all([
        fetch(`/api/admin/rounds/${roundId}`),
        fetch(`/api/admin/subtasks?round_id=${roundId}`)
      ]);

      if (roundRes.ok) {
        const data = await roundRes.json();
        setRound(data);
        setInstructions(data.instructions || "");
        // Format dates for input datetime-local if needed, or just display
        // For simplicity, we might just handle instructions for now
        // handling datetime-local needs YYYY-MM-DDThh:mm format
      }

      if (subtasksRes.ok) {
        const data = await subtasksRes.json();
        setSubtasks(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roundId) fetchData();
  }, [roundId]);

  const handleUpdateRound = async () => {
    try {
        const res = await fetch(`/api/admin/rounds/${roundId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instructions,
                // start_time: startTime, // TODO: Implement date picking
                // end_time: endTime
            })
        });
        if (res.ok) {
            alert("Round updated");
            fetchData();
        } else {
            alert("Failed to update round");
        }
    } catch (e) {
        console.error(e);
        alert("Error updating round");
    }
  };

  const handleCreateSubtask = async () => {
    try {
        const res = await fetch("/api/admin/subtasks", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                round_id: roundId,
                title: newSubtaskTitle,
                description: newSubtaskDesc
            })
        });

        if (res.ok) {
            setCreateSubtaskOpen(false);
            setNewSubtaskTitle("");
            setNewSubtaskDesc("");
            fetchData();
        } else {
            alert("Failed to create subtask");
        }
    } catch (e) {
        console.error(e);
        alert("Error creating subtask");
    }
  };

  const handleDeleteSubtask = async (id: string) => {
      if (!confirm("Are you sure you want to delete this subtask?")) return;
      try {
          const res = await fetch(`/api/admin/subtasks/${id}`, { method: 'DELETE' });
          if (res.ok) fetchData();
      } catch (e) {
          console.error(e);
      }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!round) return <div className="p-8">Round not found</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/admin/rounds")}
          className="rounded-full"
        >
          <ArrowLeft className="size-5" />
        </Button>
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
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
         {/* Left Column: Details */}
         <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Round Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Instructions</Label>
                        <Textarea 
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            placeholder="Round instructions..."
                            className="min-h-[100px]"
                        />
                    </div>
                    {/* Add Date pickers here later */}
                    <Button onClick={handleUpdateRound} className="gap-2">
                        <Save className="size-4" /> Save Changes
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Subtasks</CardTitle>
                    <Dialog open={createSubtaskOpen} onOpenChange={setCreateSubtaskOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                                <Plus className="size-4"/> Add Subtask
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
                </CardHeader>
                <CardContent>
                    {subtasks.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No subtasks defined.</p>
                    ) : (
                        <div className="space-y-3">
                            {subtasks.map((task) => (
                                <div key={task._id} className="flex items-start justify-between p-4 rounded-lg border bg-muted/20">
                                    <div>
                                        <h4 className="font-medium">{task.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => handleDeleteSubtask(task._id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
         </div>

         {/* Right Column: Stats or Teams (Future) */}
         <div className="space-y-8">
             <Card>
                 <CardHeader>
                     <CardTitle>Info</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-sm text-muted-foreground">
                         Manage subtasks and configuration for this round. 
                         Teams will see these subtasks when they enter the round.
                     </p>
                 </CardContent>
             </Card>
         </div>
      </div>
    </div>
  );
}
