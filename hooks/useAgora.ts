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
  isLoading: boolean;
  error: string | null;
  toggleMic: () => Promise<void>;
  toggleCamera: () => Promise<void>;
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

  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        client.on("user-unpublished", (user, mediaType) => {
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
      } catch (err: any) {
        console.error("Agora error:", err);
        setError(err?.message || "Camera/Mic access দিন এবং আবার চেষ্টা করুন");
        setIsLoading(false);
      }
    };

    init();

    // Cleanup — page ছাড়লে
    return () => {
      leaveChannel();
    };
  }, [channelName]);

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

  // Leave channel
  const leaveChannel = useCallback(async () => {
    try {
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      await clientRef.current?.leave();
      setIsJoined(false);
      setRemoteUser(null);
      setLocalVideoTrack(null);
    } catch (err) {
      console.error("Leave error:", err);
    }
  }, []);

  return {
    localVideoTrack,
    remoteUser,
    isJoined,
    isMuted,
    isCameraOff,
    isLoading,
    error,
    toggleMic,
    toggleCamera,
    leaveChannel,
  };
}