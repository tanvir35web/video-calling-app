"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VideoCall from "@/components/VideoCall";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

function RoomContent({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const userName = searchParams.get("name") || "Guest";

  return <VideoCall channelName={roomId} userName={userName} />;
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