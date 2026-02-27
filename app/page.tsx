"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link, Video, Copy, Check, ArrowRight } from "lucide-react";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<"join" | "create">("join");

  // Join state
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  // Create state
  const [creatorName, setCreatorName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [generatedRoomId, setGeneratedRoomId] = useState("");
  const [copied, setCopied] = useState(false);
  const [createError, setCreateError] = useState("");

  const handleJoin = () => {
    if (!userName.trim()) { setError("আপনার নাম দিন"); return; }
    if (!roomId.trim()) { setError("Room ID দিন"); return; }
    setError("");
    router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(userName.trim())}`);
  };

  const handleCreate = () => {
    if (!creatorName.trim()) { setCreateError("আপনার নাম দিন"); return; }
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
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">📹 Video Call</h1>
        <p className="text-gray-400 text-center mb-6">যেকোনো জায়গা থেকে connect করুন</p>

        {/* Tabs */}
        <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab("join")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "join" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Video size={16} /> Join করুন
          </button>
          <button
            onClick={() => setTab("create")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "create" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Link size={16} /> Link তৈরি করুন
          </button>
        </div>

        {/* Join Tab */}
        {tab === "join" && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">আপনার নাম</label>
              <input
                type="text"
                placeholder="যেমন: Rahim"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-1 block">Room ID</label>
              <input
                type="text"
                placeholder="যেমন: ABC123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleJoin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors flex items-center justify-center gap-2"
            >
              Join করুন <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Create Tab */}
        {tab === "create" && (
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">আপনার নাম</label>
              <input
                type="text"
                placeholder="যেমন: Karim"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                disabled={!!generatedLink}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 disabled:opacity-50"
              />
            </div>

            {createError && <p className="text-red-400 text-sm">{createError}</p>}

            {!generatedLink ? (
              <button
                onClick={handleCreate}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors flex items-center justify-center gap-2"
              >
                <Link size={18} /> Link তৈরি করুন
              </button>
            ) : (
              <div className="space-y-3">
                {/* Generated link */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Shareable Link:</p>
                  <p className="text-blue-400 text-sm break-all">{generatedLink}</p>
                </div>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className={`w-full font-semibold rounded-lg py-3 transition-colors flex items-center justify-center gap-2 ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  {copied ? <><Check size={18} /> Copied!</> : <><Copy size={18} /> Link Copy করুন</>}
                </button>

                {/* Start call */}
                <button
                  onClick={handleStartCall}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors flex items-center justify-center gap-2"
                >
                  Call শুরু করুন <ArrowRight size={18} />
                </button>

                <p className="text-gray-600 text-xs text-center">
                  Link share করুন, অন্যজন click করলে নাম দিয়ে join করতে পারবে
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}