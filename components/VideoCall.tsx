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
  
  const {
    localVideoTrack,
    remoteUsers,
    isMuted,
    isCameraOff,
    isScreenSharing,
    isLoading,
    error,
    errorType,
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
        <p className="text-gray-400">Camera ও Mic চালু হচ্ছে...</p>
      </div>
    );
  }

  // Error state - now handled by modal
  if (error) {
    return (
      <>
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 p-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-center">Connection চেষ্টা করছি...</p>
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
    <div className="min-h-screen bg-gray-950 flex flex-col p-4 gap-4">

      {/* Room info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold">Room: {channelName}</h2>
          <p className="text-gray-500 text-sm">
            {remoteUsers.length > 0 
              ? `✅ ${remoteUsers.length + 1} জন connected` 
              : "⏳ অন্যজনের জন্য অপেক্ষা করছি..."}
          </p>
        </div>
        <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
          <Wifi size={12} /> Live
        </span>
      </div>

      {/* Video area - Grid layout for multiple participants */}
      {remoteUsers.length === 0 ? (
        /* Only local user - show just own video centered */
        <div className="flex-1 flex items-center justify-center px-4" style={{ minHeight: "60vh" }}>
          <div className="relative w-full max-w-3xl h-[600px]">
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/90 text-gray-300 text-sm px-4 py-2 rounded-full">
              অন্যজনের জন্য অপেক্ষা করছি...
            </div>
          </div>
        </div>
      ) : (
        /* Multiple participants - show grid */
        <div 
          className={`flex-1 grid gap-4 ${
            remoteUsers.length === 1 ? "grid-cols-1 md:grid-cols-2" :
            remoteUsers.length === 2 ? "grid-cols-1 md:grid-cols-3" :
            "grid-cols-2 md:grid-cols-3"
          }`} 
          style={{ minHeight: "60vh" }}
        >
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

          {/* Remote videos */}
          {remoteUsers.map((user) => (
            <div key={user.uid} className="relative w-full h-full min-h-64">
              <VideoPlayer
                videoTrack={user.videoTrack}
                isLocal={false}
                userName={`User ${user.uid}`}
                isCameraOff={!user.videoTrack}
              />
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 md:gap-4 py-2">

        {/* Mic button */}
        <button
          onClick={toggleMic}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${
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
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${
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
            className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-colors ${
              isScreenSharing
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
            title={isScreenSharing ? "Screen share বন্ধ করুন" : "Screen share করুন"}
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
          title="Call শেষ করুন"
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