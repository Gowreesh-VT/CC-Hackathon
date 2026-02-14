"use server";

import Link from "next/link";
import { connectDB } from "@/config/db";
import Round from "@/models/Round";

type RoundItem = { id: string; name: string; status: string };

export default async function Page() {
  await connectDB();
  const rounds = await Round.find({}).sort({ round_number: 1 }).lean();

  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-black via-neutral-900 to-neutral-800 text-white">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rounds</h1>
          <div className="text-sm text-gray-400">
            Select a round to view details
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rounds.map((r: any) => (
            <Link
              key={r._id.toString()}
              href={`/team/rounds/${r._id.toString()}`}
              className="block"
            >
              <article className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-300">{`Round ${r.round_number}`}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      ID: {r._id.toString()}
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      r.is_active
                        ? "bg-lime-600 text-black"
                        : r.submission_enabled
                        ? "bg-amber-600 text-black"
                        : "bg-gray-700 text-gray-200"
                    }`}
                  >
                    {r.is_active
                      ? "Open"
                      : r.submission_enabled
                      ? "Submission"
                      : "Locked"}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
