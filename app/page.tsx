"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      {/* Glowing orbs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-violet-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/10 rounded-full blur-[150px]" />

      {/* Content */}
      <div className="relative flex min-h-screen w-full items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-300 tracking-wider">HACKATHON PLATFORM</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  CC-Hackathon
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Build. Compete. Win. The ultimate platform for managing hackathons with real-time evaluations and seamless team collaboration.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
              {/* Feature 1 */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl opacity-0 blur group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 mb-4">
                    <svg className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Real-time</h3>
                  <p className="text-sm text-slate-400">Live updates and instant notifications</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl opacity-0 blur group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20 mb-4">
                    <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Secure</h3>
                  <p className="text-sm text-slate-400">Enterprise-grade security</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-xl opacity-0 blur group-hover:opacity-30 transition-opacity duration-500" />
                <div className="relative rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 mb-4">
                    <svg className="h-6 w-6 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Collaborative</h3>
                  <p className="text-sm text-slate-400">Seamless team workflow</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center items-center mt-12">
              {/* Login Button */}
              <button
                onClick={handleGoToLogin}
                className="group/btn relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 p-[2px] transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-[0.98]"
              >
                <div className="relative flex items-center gap-2 rounded-[10px] bg-slate-900 px-8 py-4 text-base font-semibold text-white transition-all duration-300 group-hover/btn:bg-slate-900/50">
                  <span>Get Started</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
            </div>

          </div>

          
        </div>
      </div>
    </main>
  );
}