"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (!roomId.trim()) {
      setError("Room ID দিন");
      return;
    }
    if (!userName.trim()) {
      setError("আপনার নাম দিন");
      return;
    }
    setError("");
    router.push(`/room/${roomId.trim()}?name=${encodeURIComponent(userName.trim())}`);
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2 flex items-center justify-center gap-3">
          <Video size={36} /> Video Call
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Room ID দিয়ে যেকোনো জনকে call করুন
        </p>

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
              placeholder="যেমন: room123"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleJoin}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 transition-colors"
          >
            Join করুন →
          </button>
        </div>

        <p className="text-gray-600 text-xs text-center mt-6">
          দুজনকে একই Room ID দিতে হবে
        </p>
      </div>
    </main>
  );
}