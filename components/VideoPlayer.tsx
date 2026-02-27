"use client";

import { useEffect, useRef } from "react";
import { ILocalVideoTrack, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack | null | undefined;
  isLocal?: boolean;
  userName?: string;
  isCameraOff?: boolean;
}

export default function VideoPlayer({
  videoTrack,
  isLocal = false,
  userName = "User",
  isCameraOff = false,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !videoTrack || isCameraOff) return;

    videoTrack.play(containerRef.current);

    return () => {
      videoTrack.stop();
    };
  }, [videoTrack, isCameraOff]);

  return (
    <div className="relative w-full h-full bg-gray-800 rounded-2xl overflow-hidden">
      {/* Video element */}
      {!isCameraOff && videoTrack ? (
        <div ref={containerRef} className="w-full h-full" />
      ) : (
        // Camera off হলে avatar দেখাবে
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-400 text-sm">Camera বন্ধ</p>
        </div>
      )}

      {/* নাম ও local/remote badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          {isLocal ? `${userName} (আপনি)` : userName}
        </span>
      </div>
    </div>
  );
}