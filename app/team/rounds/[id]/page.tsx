"use server";

import { connectDB } from "@/config/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/models/User";
import Team from "@/models/Team";
import Round from "@/models/Round";
import Subtask from "@/models/Subtask";
import TeamSubtaskSelection from "@/models/TeamSubtaskSelection";
import Submission from "@/models/Submission";
import RoundInteraction from "@/components/team/RoundInteraction";
import SubmissionForm from "@/components/team/SubmissionForm";

type Props = { params: Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  await connectDB();
  const { id } = await params;

  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const user = email ? await User.findOne({ email }).lean() : null;
  const teamId = user?.team_id ?? null;

  const round = await Round.findById(id).lean();
  if (!round) {
    return <div className="p-6 text-white">Round not found</div>;
  }

  // check existing selection
  const selection = teamId
    ? await TeamSubtaskSelection.findOne({
        team_id: teamId,
        round_id: id,
      }).lean()
    : null;

  if (selection) {
    const subtask = selection.subtask_id
      ? await Subtask.findById(selection.subtask_id).lean()
      : null;
    const submission = teamId
      ? await Submission.findOne({
          team_id: teamId,
          round_id: id,
        }).lean()
      : null;

    return (
      <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
        <div className="max-w-4xl mx-auto">
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
                Selected subtask not found.
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
                    id: subtask?._id.toString() ?? "",
                    title: subtask?.title ?? "",
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

  // no selection: pick two random subtasks
  const subs = await Subtask.aggregate([
    { $match: { round_id: round._id } },
    { $sample: { size: 2 } },
  ]);

  const initial = subs.map((s: any) => ({
    id: s._id.toString(),
    title: s.title,
    description: s.description,
  }));

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-bold">Round {round.round_number}</h2>
        <div className="mt-6">
          <RoundInteraction initial={initial} roundId={id} />
        </div>
      </div>
    </main>
  );
}