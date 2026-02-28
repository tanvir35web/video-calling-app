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
  remoteUser: RemoteUser | null;
  isJoined: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isLoading: boolean;
  error: string | null;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  leaveChannel: () => Promise<void>;
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
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Leave channel
  const leaveChannel = useCallback(async () => {
    try {
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      screenTrackRef.current?.close();
      originalVideoTrackRef.current?.close();
      await clientRef.current?.leave();
      setIsJoined(false);
      setRemoteUser(null);
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

        // Client তৈরি করা
        const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        clientRef.current = client;

        // Remote user publish হলে (অন্যজন join করলে)
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);

          if (mediaType === "video") {
            setRemoteUser((prev) => ({
              ...prev,
              uid: user.uid,
              videoTrack: user.videoTrack,
            }));
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
            setRemoteUser((prev) => ({
              ...prev,
              uid: user.uid,
              audioTrack: user.audioTrack,
            }));
          }
        });

        // Remote user leave করলে
        client.on("user-unpublished", (_user, mediaType) => {
          if (mediaType === "video") {
            setRemoteUser((prev) =>
              prev ? { ...prev, videoTrack: undefined } : null
            );
          }
        });

        client.on("user-left", () => {
          setRemoteUser(null);
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
        const errorMessage = err instanceof Error ? err.message : "Camera/Mic access দিন এবং আবার চেষ্টা করুন";
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    init();

    // Cleanup — page ছাড়লে
    return () => {
      leaveChannel();
    };
  }, [channelName, userName, leaveChannel]);

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

  return {
    localVideoTrack,
    remoteUser,
    isJoined,
    isMuted,
    isCameraOff,
    isScreenSharing,
    isLoading,
    error,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    leaveChannel,
  };
}