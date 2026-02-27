"use client";

import { use, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Video, ArrowRight } from "lucide-react";
import VideoCall from "@/components/VideoCall";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

function RoomContent({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const nameFromUrl = searchParams.get("name");
  const [name, setName] = useState("");
  const [confirmedName, setConfirmedName] = useState(nameFromUrl || "");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!name.trim()) { setError("আপনার নাম দিন"); return; }
    setError("");
    setConfirmedName(name.trim());
  };

  // নাম না থাকলে name input দেখাবে
  if (!confirmedName) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600/20 rounded-full mx-auto mb-4">
            <Video size={32} className="text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">
            Video Call এ যোগ দিন
          </h1>
          <p className="text-gray-400 text-center text-sm mb-6">
            Room: <span className="text-blue-400 font-mono">{roomId}</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">আপনার নাম</label>
              <input
                type="text"
                placeholder="যেমন: Rahim"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                autoFocus
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
        </div>
      </main>
    );
  }

  return <VideoCall channelName={roomId} userName={confirmedName} />;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { roomId } = use(params);

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RoomContent roomId={roomId} />
    </Suspense>
  );
}