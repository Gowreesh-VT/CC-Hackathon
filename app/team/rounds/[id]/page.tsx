"use client";

import { useGetTeamRoundDetailsQuery } from "@/lib/redux/api/teamApi";
import RoundInteraction from "@/components/team/RoundInteraction";
import SubmissionForm from "@/components/team/SubmissionForm";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Page() {
    const params = useParams();
    const id = params.id as string;

    const { data, isLoading, error } = useGetTeamRoundDetailsQuery(id);

    if (isLoading) {
        return (
            <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-lime-500" />
            </main>
        );
    }

    if (error || !data || !data.round) {
        return (
            <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white flex items-center justify-center flex-col gap-4">
                <div className="text-red-400">Round not found or error loading data.</div>
                <Link href="/team/rounds" className="text-lime-400 hover:underline">Back to Rounds</Link>
            </main>
        );
    }

    const { round, selection, subtask, submission, initialSubtasks } = data;

    // Check existing selection
    if (selection) {
        return (
            <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
                <div className="max-w-4xl mx-auto">
                    <Link href="/team/rounds" className="text-gray-400 hover:text-white mb-4 inline-block text-sm">&larr; Back</Link>
                    <h2 className="text-xl font-bold">Your selection</h2>
                    <div className="mt-4">
                        {subtask ? (
                            <div className="p-4 rounded bg-neutral-900 border border-neutral-800">
                                <div className="font-semibold">{subtask.title}</div>
                                <div className="text-sm text-gray-300 mt-2">
                                    {subtask.description}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-300">
                                Selected subtask details not found.
                            </div>
                        )}
                    </div>

                    {submission ? (
                        <div className="mt-6 p-6 rounded-xl bg-neutral-900 border border-green-500/20 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Submission Received</h3>
                                    <p className="text-sm text-gray-400">Submitted on {new Date(submission.submitted_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {submission.github_link && (
                                        <div className="p-3 bg-neutral-800 rounded-lg">
                                            <div className="text-xs text-gray-400 uppercase font-semibold mb-1">GitHub Repository</div>
                                            <a href={submission.github_link} target="_blank" rel="noopener noreferrer" className="text-lime-400 hover:underline break-all">
                                                {submission.github_link}
                                            </a>
                                        </div>
                                    )}
                                    {submission.file_url && (
                                        <div className="p-3 bg-neutral-800 rounded-lg">
                                            <div className="text-xs text-gray-400 uppercase font-semibold mb-1">File / Document</div>
                                            <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                                                View Document
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {submission.overview && (
                                    <div className="p-3 bg-neutral-800 rounded-lg">
                                        <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Project Overview</div>
                                        <p className="text-gray-300 whitespace-pre-wrap">{submission.overview}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6">
                            <SubmissionForm
                                subtask={{
                                    id: subtask?._id || "",
                                    title: subtask?.title || "",
                                }}
                                roundId={id}
                                allowFileUpload={true}
                            />
                        </div>
                    )}
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
            <div className="max-w-4xl mx-auto">
                <Link href="/team/rounds" className="text-gray-400 hover:text-white mb-4 inline-block text-sm">&larr; Back</Link>
                <h2 className="text-xl font-bold">Round {round.round_number}</h2>
                <div className="mt-6">
                    <RoundInteraction initial={initialSubtasks || []} roundId={id} />
                </div>
            </div>
        </main>
    );
}