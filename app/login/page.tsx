"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl items-center px-6 py-16">
        <div className="w-full">
          {/* Header */}
          <div className="mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-300 tracking-wider">
                SYSTEM ONLINE
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              <span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                HACKATHON
              </span>
              <span className="block text-slate-100 mt-1">
                ACCESS PORTAL
              </span>
            </h1>

            <p className="text-slate-400 font-mono text-sm">
              Initialize authentication protocol
            </p>
          </div>

          {/* Main Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500" />

            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl overflow-hidden">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="p-6 md:p-8 space-y-8">
                {/* Terminal Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-500">
                    <span className="text-cyan-400">root@hackathon</span>
                    <span>~</span>
                    <span className="text-violet-400">$</span>
                    <span className="animate-pulse">_</span>
                  </div>

                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Authentication Required
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Select your access level to continue
                  </p>
                </div>

                {/* Access Cards */}
                <div className="grid gap-4">

                  {/* TEAM LOGIN */}
                  <div
                    onClick={() =>
                      signIn("google", {
                        callbackUrl: "/team/dashboard",
                      })
                    }
                    className="cursor-pointer group/card relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.99]"
                  >
                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-cyan-400 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 group-hover/card:bg-cyan-500/20 group-hover/card:border-cyan-500/40 transition-all duration-300">
                        <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-sm">
                            Team Access
                          </h3>
                          <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono text-cyan-400 border border-cyan-500/20">
                            LEADER
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          Team leaders authenticate with Google to access the dashboard and manage submissions.
                        </p>

                        <div className="pt-2 text-xs font-mono text-cyan-400 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          Click to authenticate →
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ADMIN / JUDGE LOGIN */}
                  <div
                    onClick={() =>
                      signIn("google", {
                        callbackUrl: "/admin",
                      })
                    }
                    className="cursor-pointer group/card relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 p-5 transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-800/70 hover:shadow-lg hover:shadow-violet-500/10 active:scale-[0.99]"
                  >
                    <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-violet-400 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 group-hover/card:bg-violet-500/20 group-hover/card:border-violet-500/40 transition-all duration-300">
                        <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622z" />
                        </svg>
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-white text-sm">
                            Admin & Judge Access
                          </h3>
                          <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-mono text-violet-400 border border-violet-500/20">
                            ORGANIZER
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          Administrators and judges authenticate via Google OAuth to manage rounds and evaluate submissions.
                        </p>

                        <div className="pt-2 text-xs font-mono text-violet-400 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          Click to authenticate →
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Secure connection</span>
                  </div>
                  <div className="text-xs font-mono text-slate-500">
                    v2.0.1
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom Tags */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-600">
            <span>ENCRYPTED</span>
            <span>VERIFIED</span>
            <span>PROTECTED</span>
          </div>

        </div>
      </div>
    </main>
  );
}