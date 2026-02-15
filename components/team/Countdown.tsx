"use client";

import { useEffect, useState } from "react";

type CountdownProps = { endTime: string };

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeRemaining(end: Date): Remaining {
  const now = new Date();
  const diff = Math.max(0, end.getTime() - now.getTime());
  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds };
}

export default function Countdown({ endTime }: CountdownProps) {
  // Avoid using Date.now() during initial render to prevent
  // server/client hydration mismatches. Render a deterministic
  // placeholder on the server and the initial client render,
  // then start the live interval after mount.
  const [mounted, setMounted] = useState(false);
  const [remaining, setRemaining] = useState<Remaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const end = new Date(endTime);
    // compute immediately once on mount so UI updates from the
    // deterministic placeholder to the real countdown.
    setRemaining(computeRemaining(end));
    const id = setInterval(() => setRemaining(computeRemaining(end)), 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return (
    <div className="flex gap-3 items-center text-center text-sm md:text-base">
      <TimeUnit value={remaining.days} label="d" />
      <Separator />
      <TimeUnit value={remaining.hours} label="h" />
      <Separator />
      <TimeUnit value={remaining.minutes} label="m" />
      <Separator />
      <TimeUnit value={remaining.seconds} label="s" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[3.5rem] bg-gradient-to-br from-gray-800 via-neutral-900 to-black px-3 py-2 rounded-lg font-mono text-white shadow">
      <div className="text-2xl font-bold">{String(value).padStart(2, "0")}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function Separator() {
  return <div className="text-gray-500">:</div>;
}
