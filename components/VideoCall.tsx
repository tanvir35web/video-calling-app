"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAgora } from "@/hooks/useAgora";
import { useAgoraChat } from "@/hooks/useAgoraChat";
import VideoPlayer from "./VideoPlayer";
import PermissionModal from "./PermissionModal";
import ChatPanel from "./ChatPanel";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Wifi, MonitorUp, MonitorX, MessageSquare } from "lucide-react";

interface VideoCallProps {
  channelName: string;
  userName: string;
}

export default function VideoCall({ channelName, userName }: VideoCallProps) {
  const router = useRouter();
  const [isScreenShareSupported, setIsScreenShareSupported] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedUserId, setExpandedUserId] = useState<string | number | null>(null);
  
  const {
    localVideoTrack,
    remoteUsers,
    isMuted,
    isCameraOff,
    isScreenSharing,
    isLoading,
    error,
    errorType,
    hasAudio,
    hasVideo,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    leaveChannel,
    retryConnection,
  } = useAgora(channelName, userName);

  const { messages, sendMessage } = useAgoraChat(channelName, userName);

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

  // Handle Escape key to exit expanded view
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expandedUserId) {
        setExpandedUserId(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [expandedUserId]);

  // Show modal when error occurs
  useEffect(() => {
    if (error && errorType) {
      setShowPermissionModal(true);
    }
  }, [error, errorType]);

  // Track unread messages
  useEffect(() => {
    if (!isChatOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isLocal) {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isChatOpen]);

  // Reset unread count when chat opens
  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  const handleModalClose = () => {
    setShowPermissionModal(false);
    router.push("/");
  };

  const handleRetry = () => {
    setShowPermissionModal(false);
    retryConnection();
  };

  const handleLeave = async () => {
    await leaveChannel();
    router.push("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Initializing Camera and Microphone...</p>
      </div>
    );
  }

  // Error state - now handled by modal
  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 p-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-center">Attempting to connect...</p>
        </div>
        <PermissionModal
          isOpen={showPermissionModal}
          onClose={handleModalClose}
          onRetry={handleRetry}
          errorType={errorType || "unknown"}
        />
      </>
    );
  }

  return (
    <div className="h-[100dvh] w-screen bg-gray-950 flex flex-col p-2 md:p-4 gap-2 md:gap-4 overflow-hidden">

      {/* Warning Banner for missing devices */}
      {(!hasAudio || !hasVideo) && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-2 text-yellow-400 text-sm flex-shrink-0">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold">Device Not Available</p>
            <p className="text-xs text-yellow-300 mt-1">
              {!hasVideo && !hasAudio 
                ? "Camera and Microphone not found. You can still participate in the call but cannot send video or audio."
                : !hasVideo
                ? "Camera not found. You can send audio but not video."
                : "Microphone not found. You can send video but not audio."}
            </p>
          </div>
        </div>
      )}

      {/* Room info */}
      <div className="flex items-center justify-between flex-shrink-0 min-h-0">
        <div className="min-w-0">
          <h2 className="text-white font-semibold text-sm md:text-base truncate">Room: {channelName}</h2>
          <p className="text-gray-500 text-xs md:text-sm truncate">
            {remoteUsers.length > 0 
              ? `✅ ${remoteUsers.length + 1} participants connected` 
              : "⏳ Waiting for others to join..."}
          </p>
        </div>
        <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Wifi size={12} /> Live
        </span>
      </div>

      {/* Video area */}
      {expandedUserId ? (
        /* Expanded/Fullscreen View */
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden min-h-0 bg-black rounded-2xl relative cursor-pointer"
          onClick={() => setExpandedUserId(null)}
        >
          {/* Video container - stop propagation to prevent closing on video click */}
          <div 
            className="w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {expandedUserId === "local" ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  <VideoPlayer
                    videoTrack={localVideoTrack}
                    isLocal={true}
                    userName={userName}
                    isCameraOff={isCameraOff && !isScreenSharing}
                  />
                </div>
                {isScreenSharing && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <MonitorUp size={12} /> Screen Sharing
                  </div>
                )}
              </div>
            ) : (
              <VideoPlayer
                videoTrack={remoteUsers.find(u => u.uid === expandedUserId)?.videoTrack}
                isLocal={false}
                userName={`User ${expandedUserId}`}
                isCameraOff={!remoteUsers.find(u => u.uid === expandedUserId)?.videoTrack}
              />
            )}
          </div>

          {/* Back to Grid button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpandedUserId(null);
            }}
            className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2 z-10"
            title="Back to Grid View (Press ESC)"
          >
            ← Grid View
          </button>

          {/* Info hint at bottom */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            Click background or press ESC to return to grid
          </div>
        </div>
      ) : remoteUsers.length === 0 ? (
        /* Only local user - show just own video centered */
        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
          <div className="relative w-full max-w-3xl h-[600px] cursor-pointer hover:shadow-lg transition-shadow rounded-2xl" onClick={() => setExpandedUserId("local")}>
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
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-2xl flex items-center justify-center opacity-0 hover:opacity-100">
              <span className="text-white text-sm font-medium">Click to expand</span>
            </div>
          </div>
        </div>
      ) : (
        /* Grid view - Multiple participants */
        <div 
          className={`flex-1 gap-2 md:gap-4 overflow-hidden min-h-0 ${
            remoteUsers.length === 1 
              ? "grid grid-cols-1 md:grid-cols-2" 
              : remoteUsers.length === 2 
                ? "grid grid-cols-2 md:grid-cols-3 auto-rows-fr" 
                : "grid grid-cols-2 md:grid-cols-3 auto-rows-fr"
          }`}
        >
          {/* Local video */}
          <div 
            className={`relative w-full h-full ${
              remoteUsers.length === 2 ? "col-span-2 md:col-span-1" : ""
            } cursor-pointer hover:shadow-lg transition-all rounded-2xl overflow-hidden group`}
            onClick={() => setExpandedUserId("local")}
          >
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
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-sm font-medium">Expand</span>
            </div>
          </div>

          {/* Remote videos */}
          {remoteUsers.map((user) => (
            <div 
              key={user.uid} 
              className="relative w-full h-full cursor-pointer hover:shadow-lg transition-all rounded-2xl overflow-hidden group"
              onClick={() => setExpandedUserId(user.uid)}
            >
              <VideoPlayer
                videoTrack={user.videoTrack}
                isLocal={false}
                userName={`User ${user.uid}`}
                isCameraOff={!user.videoTrack}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-sm font-medium">Expand</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 md:gap-4 py-2 flex-shrink-0">

        {/* Mic button */}
        <button
          onClick={toggleMic}
          disabled={!hasAudio}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-gray-800 text-white hover:bg-gray-700"
          } ${!hasAudio ? "opacity-50 cursor-not-allowed" : ""}`}
          title={!hasAudio ? "Microphone not available" : (isMuted ? "Turn on Microphone" : "Turn off Microphone")}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </button>

       

        {/* Camera button */}
        <button
          onClick={toggleCamera}
          disabled={isScreenSharing || !hasVideo}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${
            isCameraOff || isScreenSharing
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-gray-800 text-white hover:bg-gray-700"
          } ${(isScreenSharing || !hasVideo) ? "opacity-50 cursor-not-allowed" : ""}`}
          title={!hasVideo ? "Camera not available" : (isCameraOff ? "Turn on Camera" : "Turn off Camera")}
        >
          {isCameraOff ? <VideoOff size={22} /> : <Video size={22} />}
        </button>

        {/* Screen Share button - only show if supported */}
        {isScreenShareSupported && (
          <button
            onClick={toggleScreenShare}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${
              isScreenSharing
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
            title={isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
          >
            {isScreenSharing ? <MonitorX size={22} /> : <MonitorUp size={22} />}
          </button>
        )}

        {/* Chat button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="relative w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors bg-gray-800 text-white hover:bg-gray-700"
          title="Chat"
        >
          <MessageSquare size={22} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

         {/* Leave button */}
        <button
          onClick={handleLeave}
          className="w-fit px-3 md:px-5 py-2 md:py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-colors shadow-lg"
        title="End Call"
        >
          <PhoneOff size={20} />
          End
        </button>

      </div>

      {/* Chat Panel */}
      <ChatPanel
        messages={messages}
        onSendMessage={sendMessage}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}