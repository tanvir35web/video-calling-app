import { useEffect, useRef, useState, useCallback } from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
} from "agora-rtc-sdk-ng";

interface RemoteUser {
  uid: string | number;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
}

interface UseAgoraReturn {
  localVideoTrack: ILocalVideoTrack | null;
  remoteUsers: RemoteUser[];
  isJoined: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isLoading: boolean;
  error: string | null;
  errorType: "permission" | "device" | "unknown" | null;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  leaveChannel: () => Promise<void>;
  retryConnection: () => void;
}

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID as string;
const TOKEN = process.env.NEXT_PUBLIC_AGORA_TOKEN || null;

if (!APP_ID) {
  throw new Error(".env.local এ NEXT_PUBLIC_AGORA_APP_ID সেট করুন");
}

export function useAgora(channelName: string, userName: string): UseAgoraReturn {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ILocalVideoTrack | null>(null);
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const screenTrackRef = useRef<ILocalVideoTrack | null>(null);
  const originalVideoTrackRef = useRef<ILocalVideoTrack | null>(null);

  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"permission" | "device" | "unknown" | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // Leave channel
  const leaveChannel = useCallback(async () => {
    try {
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      screenTrackRef.current?.close();
      originalVideoTrackRef.current?.close();
      await clientRef.current?.leave();
      setIsJoined(false);
      setRemoteUsers([]);
      setLocalVideoTrack(null);
      setIsScreenSharing(false);
    } catch (err) {
      console.error("Leave error:", err);
    }
  }, []);

  // Join channel and setup
  useEffect(() => {
    if (!channelName) return;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setErrorType(null);

        // Client তৈরি করা
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Remote user publish হলে (অন্যজন join করলে)
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            setRemoteUsers((prev) => {
              const existingIndex = prev.findIndex((u) => u.uid === user.uid);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], videoTrack: user.videoTrack };
                return updated;
              }
              return [...prev, { uid: user.uid, videoTrack: user.videoTrack }];
            });
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
            setRemoteUsers((prev) => {
              const existingIndex = prev.findIndex((u) => u.uid === user.uid);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], audioTrack: user.audioTrack };
                return updated;
              }
              return [...prev, { uid: user.uid, audioTrack: user.audioTrack }];
            });
          }
        });

        // Remote user unpublish করলে
        client.on("user-unpublished", (user, mediaType) => {
          if (mediaType === "video") {
            setRemoteUsers((prev) =>
              prev.map((u) =>
                u.uid === user.uid ? { ...u, videoTrack: undefined } : u
              )
            );
          }
        });

        // Remote user leave করলে
        client.on("user-left", (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        });

        // Channel এ join করা (token ছাড়া টেস্টের জন্য null)
        const uid = await client.join(APP_ID, channelName, TOKEN, userName);
        console.log("Joined with UID:", uid);

        // নিজের camera + mic track তৈরি
        const [audioTrack, videoTrack] =
          await AgoraRTC.createMicrophoneAndCameraTracks();

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        setLocalVideoTrack(videoTrack);

        // Publish করা
        await client.publish([audioTrack, videoTrack]);

        setIsJoined(true);
        setIsLoading(false);
      } catch (err: unknown) {
        console.error("Agora error:", err);
        
        // Detect error type
        let detectedErrorType: "permission" | "device" | "unknown" = "unknown";
        let errorMessage = "Camera/Mic access দিন এবং আবার চেষ্টা করুন";

        if (err instanceof Error) {
          const errorName = err.name;
          const errorMsg = err.message.toLowerCase();

          // Permission denied errors
          if (
            errorName === "NotAllowedError" ||
            errorMsg.includes("permission") ||
            errorMsg.includes("denied")
          ) {
            detectedErrorType = "permission";
            errorMessage = "Camera এবং Microphone permission দিতে হবে";
          }
          // Device not found or in use errors
          else if (
            errorName === "NotFoundError" ||
            errorName === "NotReadableError" ||
            errorMsg.includes("not found") ||
            errorMsg.includes("not readable") ||
            errorMsg.includes("device in use")
          ) {
            detectedErrorType = "device";
            errorMessage = "Camera বা Mic খুঁজে পাওয়া যায়নি বা অন্য app ব্যবহার করছে";
          }
        }

        setErrorType(detectedErrorType);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    init();

    // Cleanup — page ছাড়লে
    return () => {
      leaveChannel();
    };
  }, [channelName, userName, leaveChannel, retryTrigger]);

  // Mic toggle
  const toggleMic = useCallback(async () => {
    if (!localAudioTrackRef.current) return;
    await localAudioTrackRef.current.setEnabled(isMuted);
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  // Camera toggle
  const toggleCamera = useCallback(async () => {
    if (!localVideoTrackRef.current) return;
    await localVideoTrackRef.current.setEnabled(isCameraOff);
    setIsCameraOff((prev) => !prev);
  }, [isCameraOff]);

  // Screen share toggle
  const toggleScreenShare = useCallback(async () => {
    if (!clientRef.current) return;

    // Check if screen sharing is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      alert("Screen sharing is not supported on this device/browser. Please use Chrome, Firefox, or Edge on desktop.");
      return;
    }

    try {
      if (isScreenSharing) {
        // Stop screen sharing, switch back to camera
        if (screenTrackRef.current) {
          await clientRef.current.unpublish(screenTrackRef.current);
          screenTrackRef.current.close();
          screenTrackRef.current = null;
        }

        // Restore original camera track
        if (originalVideoTrackRef.current) {
          localVideoTrackRef.current = originalVideoTrackRef.current;
          setLocalVideoTrack(originalVideoTrackRef.current);
          await clientRef.current.publish(originalVideoTrackRef.current);
          originalVideoTrackRef.current = null;
        }

        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, "auto");

        // Handle if user cancels screen share
        if (Array.isArray(screenTrack)) {
          screenTrackRef.current = screenTrack[0];
        } else {
          screenTrackRef.current = screenTrack;
        }

        // Save current camera track
        originalVideoTrackRef.current = localVideoTrackRef.current;

        // Unpublish camera, publish screen
        if (localVideoTrackRef.current) {
          await clientRef.current.unpublish(localVideoTrackRef.current);
        }

        await clientRef.current.publish(screenTrackRef.current);
        localVideoTrackRef.current = screenTrackRef.current;
        setLocalVideoTrack(screenTrackRef.current);
        setIsScreenSharing(true);

        // Handle when user stops sharing via browser UI
        screenTrackRef.current.on("track-ended", () => {
          // Stop screen sharing when user clicks browser's stop button
          setIsScreenSharing(false);
          if (originalVideoTrackRef.current && clientRef.current) {
            localVideoTrackRef.current = originalVideoTrackRef.current;
            setLocalVideoTrack(originalVideoTrackRef.current);
            clientRef.current.unpublish(screenTrackRef.current!).then(() => {
              clientRef.current!.publish(originalVideoTrackRef.current!);
              screenTrackRef.current?.close();
              screenTrackRef.current = null;
              originalVideoTrackRef.current = null;
            });
          }
        });
      }
    } catch (err: unknown) {
      console.error("Screen share error:", err);
      const error = err as { code?: string; name?: string };
      if (error.code === "PERMISSION_DENIED" || error.name === "NotAllowedError") {
        alert("Screen share permission denied");
      } else if (error.code === "NOT_SUPPORTED" || error.name === "NotSupportedError") {
        alert("Screen sharing is not supported on this device/browser");
      } else {
        alert("Failed to start screen sharing. Please try again.");
      }
    }
  }, [isScreenSharing]);

  // Leave channel

  // Retry connection
  const retryConnection = useCallback(() => {
    setRetryTrigger((prev) => prev + 1);
  }, []);

  return {
    localVideoTrack,
    remoteUsers,
    isJoined,
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
  };
}