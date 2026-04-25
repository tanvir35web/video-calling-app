"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link, Video, Copy, Check, ArrowRight, Users } from "lucide-react";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const inputCls =
  "w-full bg-white/4 border border-white/8 text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40 placeholder-gray-600 transition-all";

const primaryBtn =
  "w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-gray-500 text-xs uppercase tracking-wider block">{label}</label>
      {children}
    </div>
  );
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{msg}</p>
  );
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
    if (!roomId.trim()) { setError("Please enter a Room ID"); return; }
    setError("");
    router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(userName.trim())}`);
  };

  const handleCreate = () => {
    if (!creatorName.trim()) { setCreateError("Please enter your name"); return; }
    setCreateError("");
    const newRoomId = generateRoomId();
    setGeneratedRoomId(newRoomId);
    setGeneratedLink(`${window.location.origin}/room/${newRoomId}`);
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
    <main className="min-h-screen bg-[#080810] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 mb-5 shadow-lg shadow-indigo-500/30">
            <Video size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Video<span className="text-indigo-400">Call</span>
          </h1>
          <p className="text-gray-500 mt-1.5 text-sm">Connect with anyone, anywhere</p>
        </div>

        {/* Card */}
        <div className="bg-white/4 border border-white/8 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-white/4 rounded-xl p-1 mb-6">
            {(["join", "create"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); setCreateError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  tab === t
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t === "join" ? <Users size={14} /> : <Link size={14} />}
                {t === "join" ? "Join Room" : "Create Room"}
              </button>
            ))}
          </div>

          {/* Join panel */}
          {tab === "join" && (
            <div className="space-y-4">
              <Field label="Your Name">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className={inputCls}
                />
              </Field>
              <Field label="Room ID">
                <input
                  type="text"
                  placeholder="e.g. ABC123"
                  value={roomId}
                  onChange={(e) => { setRoomId(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  className={`${inputCls} font-mono tracking-widest`}
                />
              </Field>
              {error && <ErrorMsg msg={error} />}
              <button onClick={handleJoin} className={primaryBtn}>
                Join Room <ArrowRight size={15} />
              </button>
            </div>
          )}

          {/* Create panel */}
          {tab === "create" && (
            <div className="space-y-4">
              <Field label="Your Name">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={creatorName}
                  onChange={(e) => { setCreatorName(e.target.value); setCreateError(""); }}
                  disabled={!!generatedLink}
                  className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                />
              </Field>
              {createError && <ErrorMsg msg={createError} />}
              {!generatedLink ? (
                <button onClick={handleCreate} className={primaryBtn}>
                  <Link size={15} /> Generate Room Link
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/4 border border-white/8 rounded-xl p-3.5">
                    <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1.5">Shareable Link</p>
                    <p className="text-indigo-400 text-xs break-all font-mono leading-relaxed">{generatedLink}</p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`w-full rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2 border transition-all duration-200 ${
                      copied
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-white/4 border-white/8 text-gray-400 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                  </button>
                  <button onClick={handleStartCall} className={primaryBtn}>
                    Start Call <ArrowRight size={15} />
                  </button>
                  <p className="text-gray-600 text-xs text-center">Share this link for others to join</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
