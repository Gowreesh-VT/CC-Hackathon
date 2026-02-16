"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  useGetRoundDetailsQuery, 
  useGetSubtasksQuery, 
  useUpdateRoundMutation, 
  useCreateSubtaskMutation, 
  useDeleteSubtaskMutation 
} from "@/lib/redux/api/adminApi";
import { toast } from "sonner";

export default function RoundDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;

  // RTK Query Hooks
  const { data: round, isLoading: roundLoading } = useGetRoundDetailsQuery(roundId);
  const { data: subtasks = [], isLoading: subtasksLoading } = useGetSubtasksQuery(roundId);
  const [updateRound] = useUpdateRoundMutation();
  const [createSubtask] = useCreateSubtaskMutation();
  const [deleteSubtask] = useDeleteSubtaskMutation();

  // Local State for forms
  const [instructions, setInstructions] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [createSubtaskOpen, setCreateSubtaskOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskDesc, setNewSubtaskDesc] = useState("");

  const loading = roundLoading || subtasksLoading;

  // Initialize form state when data is loaded
  useEffect(() => {
    if (round) {
      setInstructions(round.instructions || "");
      if (round.start_time) {
          const date = new Date(round.start_time);
          const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          setStartTime(localIso);
      }
      if (round.end_time) {
          const date = new Date(round.end_time);
          const localIso = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
          setEndTime(localIso);
      }
    }
  }, [round]);

  const handleUpdateRound = async () => {
    try {
        await updateRound({
            id: roundId,
            body: {
                instructions,
                start_time: startTime ? new Date(startTime).toISOString() : undefined,
                end_time: endTime ? new Date(endTime).toISOString() : undefined
            }
        }).unwrap();
        toast.success("Round updated successfully");
    } catch (e) {
        console.error(e);
        toast.error("Error updating round");
    }
  };

  const handleCreateSubtask = async () => {
    try {
        await createSubtask({
            round_id: roundId,
            title: newSubtaskTitle,
            description: newSubtaskDesc
        }).unwrap();

        toast.success("Subtask created successfully");
        setCreateSubtaskOpen(false);
        setNewSubtaskTitle("");
        setNewSubtaskDesc("");
    } catch (e) {
        console.error(e);
        toast.error("Error creating subtask");
    }
  };

  const handleDeleteSubtask = async (id: string) => {
      if (!confirm("Are you sure you want to delete this subtask?")) return;
      try {
          await deleteSubtask(id).unwrap();
          toast.success("Subtask deleted");
      } catch (e) {
          console.error(e);
          toast.error("Error deleting subtask");
      }
  };

  if (loading) return <div className="p-8">Loading round details...</div>;
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input 
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="block"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input 
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="block"
                            />
                        </div>
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
                            {subtasks.map((task: any) => (
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
