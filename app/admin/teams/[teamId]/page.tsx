"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Github, FileText, Lock, UserX, AlertTriangle } from "lucide-react";
import { useGetTeamDetailsQuery } from "@/lib/redux/api/adminApi";

export default function TeamDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const teamId = params.teamId as string;

    const { data: details, isLoading } = useGetTeamDetailsQuery(teamId);

    if (isLoading) return <div className="p-8">Loading team details...</div>;
    if (!details || !details.team) return <div className="p-8">Team not found</div>;

    const { team, history } = details;

    const getStatusVariant = (status: string) => {
        switch(status) {
            case "Submitted": return "default";
            case "Active": return "secondary";
            default: return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="size-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {team.name}
                        <Badge variant="outline" className="text-lime-500 border-lime-500">{team.track}</Badge>
                    </h1>
                    <div className="flex gap-2 mt-2">
                        {team.isLocked && <Badge variant="destructive" className="gap-1"><Lock className="size-3"/> Locked</Badge>}
                        {team.isShortlisted && <Badge className="bg-lime-500 text-black gap-1">Shortlisted</Badge>}
                        {team.isEliminated && <Badge variant="secondary" className="gap-1"><UserX className="size-3"/> Eliminated</Badge>}
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                <Card className="border-white/10 bg-card/50">
                    <CardHeader>
                        <CardTitle>Round History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left rtl:text-right text-gray-400">
                                <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Round</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Selection</th>
                                        <th scope="col" className="px-6 py-3">Submission</th>
                                        <th scope="col" className="px-6 py-3">Score</th>
                                        <th scope="col" className="px-6 py-3">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((round: any) => (
                                        <tr key={round.round_id} className="border-b border-gray-700 bg-gray-800 odd:bg-gray-900">
                                            <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                                {round.round_name}
                                            </th>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusVariant(round.status)}>{round.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {round.selection || <span className="text-gray-600 italic">None</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {round.github_link && (
                                                        <a href={round.github_link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                            <Github className="size-4" />
                                                        </a>
                                                    )}
                                                    {round.submission_file && (
                                                        <a href={round.submission_file} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                            <FileText className="size-4" />
                                                        </a>
                                                    )}
                                                    {!round.github_link && !round.submission_file && "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-white">
                                                {round.score !== null ? round.score : "-"}
                                            </td>
                                            <td className="px-6 py-4 truncate max-w-[200px]" title={round.remarks}>
                                                {round.remarks || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
