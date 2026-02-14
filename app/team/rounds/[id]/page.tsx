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

type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
  await connectDB();

  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;
  const user = email ? await User.findOne({ email }).lean() : null;
  const teamId = user?.team_id ?? null;

  const round = await Round.findById(params.id).lean();
  if (!round) {
    return <div className="p-6 text-white">Round not found</div>;
  }

  // check existing selection
  const selection = teamId
    ? await TeamSubtaskSelection.findOne({
        team_id: teamId,
        round_id: params.id,
      }).lean()
    : null;

  if (selection) {
    const subtask = selection.subtask_id
      ? await Subtask.findById(selection.subtask_id).lean()
      : null;
    const submission = teamId
      ? await Submission.findOne({
          team_id: teamId,
          round_id: params.id,
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

          <div className="mt-6">
            <SubmissionForm
              subtask={{
                id: subtask?._id.toString() ?? "",
                title: subtask?.title ?? "",
              }}
              allowFileUpload={Boolean(round.round_number === 1)}
              onFinalSubmitted={() => null}
            />
          </div>

          {submission && (
            <div className="mt-4 text-sm text-gray-300">
              Submitted: {new Date(submission.submitted_at).toLocaleString()}
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
          <RoundInteraction initial={initial} roundId={params.id} />
        </div>
      </div>
    </main>
  );
}
