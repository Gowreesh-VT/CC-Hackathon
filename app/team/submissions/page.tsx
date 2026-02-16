"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TeamSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team/submission")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubmissions(data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Submissions</h1>
        <p className="text-gray-400">View your submission history.</p>
      </div>
      
      <Card className="bg-neutral-900 border-neutral-800 text-white">
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-neutral-800 p-3 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white">No submissions yet</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">
                You haven't made any submissions yet. Once you submit a project for a round, it will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral-800 text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Round</th>
                    <th className="px-6 py-3">Submitted At</th>
                    <th className="px-6 py-3">Links</th>
                    <th className="px-6 py-3">Overview</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub._id} className="border-b border-neutral-800 hover:bg-neutral-800/50">
                      <td className="px-6 py-4 font-medium">
                        {sub.round_id?.round_number ? `Round ${sub.round_id.round_number}` : "Unknown Round"}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(sub.submitted_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {sub.github_link && (
                            <Link href={sub.github_link} target="_blank" className="flex items-center gap-1 text-lime-400 hover:underline">
                              GitHub <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                          {sub.file_url && (
                             <Link href={sub.file_url} target="_blank" className="flex items-center gap-1 text-blue-400 hover:underline">
                              Document <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate" title={sub.overview}>
                        {sub.overview || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Submitted
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
