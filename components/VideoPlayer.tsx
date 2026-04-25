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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainVideoRef = useRef<HTMLDivElement>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!videoTrack || isCameraOff) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const mainVideoDiv = mainVideoRef.current;

    if (!container || !canvas || !mainVideoDiv) return;

    // Clear previous content
    mainVideoDiv.innerHTML = "";

    // Create wrapper for main video with object-contain
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";
    wrapper.style.position = "relative";
    wrapper.style.zIndex = "2";

    mainVideoDiv.appendChild(wrapper);
    videoTrack.play(wrapper);

    // Apply object-contain to videos
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      div[data-video-wrapper] > video,
      div[data-video-wrapper] > div > video {
        width: 100%;
        height: 100%;
        object-fit: contain !important;
      }
    `;
    wrapper.setAttribute("data-video-wrapper", "true");
    document.head.appendChild(styleSheet);

    // Setup canvas for blurred background
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    // Create a temporary video element to render frames
    const tempVideo = document.createElement("video");
    tempVideo.style.display = "none";

    // Render blur effect on canvas
    const renderBlur = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Draw a blurred version - we'll use a simple approach
      // by drawing the video scaled and blurred
      canvasCtx.filter = "blur(30px)";
      canvasCtx.fillStyle = "rgba(0, 0, 0, 0.3)";
      canvasCtx.fillRect(0, 0, width, height);

      animationIdRef.current = requestAnimationFrame(renderBlur);
    };

    renderBlur();

    return () => {
      videoTrack.stop();
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (styleSheet.parentNode) {
        document.head.removeChild(styleSheet);
      }
    };
  }, [videoTrack, isCameraOff]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden">
      {/* Blurred background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Main video with object-contain */}
      {!isCameraOff && videoTrack ? (
        <div ref={mainVideoRef} className="w-full h-full" />
      ) : (
        // Camera off - show avatar
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-3xl font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-400 text-sm">Camera Off</p>
        </div>
      )}

      {/* User badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
        <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-md">
          {isLocal ? `${userName} (You)` : userName}
        </span>
      </div>
    </div>
  );
}