"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link, Video, Copy, Check, ArrowRight, Users } from "lucide-react";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"join" | "create">("join");

  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const [creatorName, setCreatorName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedRoomId, setGeneratedRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleJoin = () => {
    if (!userName.trim()) { setError("Please enter your name"); return; }
    if (!roomId.trim()) { setError("Please enter Room ID"); return; }
    setError("");
    router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(userName.trim())}`);
  };

  const handleCreate = () => {
    if (!creatorName.trim()) { setCreateError("Please enter your name"); return; }
    setCreateError("");
    const newRoomId = generateRoomId();
    const link = `${window.location.origin}/room/${newRoomId}`;
    setGeneratedRoomId(newRoomId);
    setGeneratedLink(link);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartCall = () => {
    router.push(`/room/${generatedRoomId}?name=${encodeURIComponent(creatorName.trim())}`);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-125 h-125 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30 mb-4">
            <Video size={30} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Video<span className="bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Call</span>
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Connect with anyone, anywhere</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/5">
            <button
              onClick={() => { setTab("join"); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === "join"
                  ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Users size={15} /> Join Room
            </button>
            <button
              onClick={() => { setTab("create"); setCreateError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                tab === "create"
                  ? "bg-linear-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Link size={15} /> Create Room
            </button>
          </div>

          {/* Sliding panels */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-350 ease-in-out"
              style={{ width: "200%", transform: tab === "join" ? "translateX(0)" : "translateX(-50%)" }}
            >
              {/* Join panel */}
              <div className="space-y-4 min-w-0" style={{ width: "50%", paddingRight: "1.5rem" }}>
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => { setUserName(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-600 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block">Room ID</label>
                  <input
                    type="text"
                    placeholder="e.g. ABC123"
                    value={roomId}
                    onChange={(e) => { setRoomId(e.target.value); setError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-gray-600 transition-all font-mono tracking-widest"
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  onClick={handleJoin}
                  className="w-full bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Join Room <ArrowRight size={16} />
                </button>
              </div>

              {/* Create panel */}
              <div className="space-y-4 min-w-0" style={{ width: "50%", paddingLeft: "1.5rem" }}>
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-xs font-medium uppercase tracking-wider block">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={creatorName}
                    onChange={(e) => { setCreatorName(e.target.value); setCreateError(""); }}
                    disabled={!!generatedLink}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 placeholder-gray-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                {createError && (
                  <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {createError}
                  </p>
                )}

                {!generatedLink ? (
                  <button
                    onClick={handleCreate}
                    className="w-full bg-linear-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Link size={16} /> Generate Room Link
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                      <p className="text-gray-500 text-xs mb-1.5 uppercase tracking-wider font-medium">Shareable Link</p>
                      <p className="text-blue-400 text-xs break-all font-mono leading-relaxed">{generatedLink}</p>
                    </div>

                    <button
                      onClick={handleCopy}
                      className={`w-full font-semibold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${
                        copied
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                          : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {copied ? <><Check size={16} /> Link Copied!</> : <><Copy size={16} /> Copy Link</>}
                    </button>

                    <button
                      onClick={handleStartCall}
                      className="w-full bg-linear-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Start Call <ArrowRight size={16} />
                    </button>

                    <p className="text-gray-600 text-xs text-center leading-relaxed">
                      Share this link — others can click it to join your call
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
