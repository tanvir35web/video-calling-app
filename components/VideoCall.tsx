"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAgora } from "@/hooks/useAgora";
import VideoPlayer from "./VideoPlayer";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Wifi, MonitorUp, MonitorX } from "lucide-react";

interface VideoCallProps {
  channelName: string;
  userName: string;
}

export default function VideoCall({ channelName, userName }: VideoCallProps) {
  const router = useRouter();
  const [isScreenShareSupported, setIsScreenShareSupported] = useState(true);
  
  const {
    localVideoTrack,
    remoteUser,
    isMuted,
    isCameraOff,
    isScreenSharing,
    isLoading,
    error,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    leaveChannel,
  } = useAgora(channelName, userName);

  // Check if screen sharing is supported
  useEffect(() => {
    const checkScreenShareSupport = () => {
      // Check if getDisplayMedia is available
      const isSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
      
      // iOS Safari doesn't support screen sharing
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      setIsScreenShareSupported(isSupported && !isIOS);
    };
    
    checkScreenShareSupport();
  }, []);

  const handleLeave = async () => {
    await leaveChannel();
    router.push("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Camera ও Mic চালু হচ্ছে...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-400 text-center text-lg">⚠️ {error}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          ← ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4 gap-4">

      {/* Room info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Room: {channelName}</h2>
          <p className="text-gray-500 text-sm">
            {remoteUser ? "✅ Connected" : "⏳ অন্যজনের জন্য অপেক্ষা করছি..."}
          </p>
        </div>
        <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Wifi size={12} /> Live
        </span>
      </div>

      {/* Video area */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: "60vh" }}>

        {/* Remote video — বড় */}
        <div className="relative w-full h-full min-h-64">
          {remoteUser ? (
            <VideoPlayer
              videoTrack={remoteUser.videoTrack}
              isLocal={false}
              userName="Guest"
              isCameraOff={!remoteUser.videoTrack}
            />
          ) : (
            <div className="w-full h-full min-h-64 bg-gray-800 rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="text-5xl">👤</div>
              <p className="text-gray-400">অন্যজন এখনো join করেনি</p>
              <p className="text-gray-600 text-sm">Room ID শেয়ার করুন: <span className="text-blue-400">{channelName}</span></p>
            </div>
          )}
        </div>

        {/* Local video */}
        <div className="relative w-full h-full min-h-64">
          <VideoPlayer
            videoTrack={localVideoTrack}
            isLocal={true}
            userName={userName}
            isCameraOff={isCameraOff && !isScreenSharing}
          />
          {isScreenSharing && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <MonitorUp size={12} /> Screen Sharing
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-2">

        {/* Mic button */}
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-gray-800 text-white hover:bg-gray-700"
          }`}
          title={isMuted ? "Mic চালু করুন" : "Mic বন্ধ করুন"}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

       

        {/* Camera button */}
        <button
          onClick={toggleCamera}
          disabled={isScreenSharing}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isCameraOff || isScreenSharing
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-gray-800 text-white hover:bg-gray-700"
          } ${isScreenSharing ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isCameraOff ? "Camera চালু করুন" : "Camera বন্ধ করুন"}
        >
          {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        {/* Screen Share button - only show if supported */}
        {isScreenShareSupported && (
          <button
            onClick={toggleScreenShare}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              isScreenSharing
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
            title={isScreenSharing ? "Screen share বন্ধ করুন" : "Screen share করুন"}
          >
            {isScreenSharing ? <MonitorX size={22} /> : <MonitorUp size={22} />}
          </button>
        )}

         {/* Leave button */}
        <button
          onClick={handleLeave}
          className="w-fit px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-colors shadow-lg"
          title="Call শেষ করুন"
        >
          <PhoneOff size={26} />
          Leave
        </button>

      </div>
    </div>
  );
}