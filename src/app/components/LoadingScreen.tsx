"use client";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0f1117]">
      {/* Just the word aR with a subtle pulse and glow */}
      <span className="text-cyan-500 text-6xl font-black tracking-tighter animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
        a
      </span>
    </div>
  );
}