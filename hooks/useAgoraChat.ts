import { useEffect, useRef, useState, useCallback } from "react";
import Pusher from "pusher-js";

export interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isLocal: boolean;
}

interface UseAgoraChatReturn {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
  isConnected: boolean;
}

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER!;

export function useAgoraChat(
  channelName: string,
  userName: string
): UseAgoraChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!channelName || !userName || !PUSHER_KEY) return;

    try {
      // Initialize Pusher
      const pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
      });

      pusherRef.current = pusher;

      // Subscribe to channel
      const channel = pusher.subscribe(`chat-${channelName}`);
      channelRef.current = channel;

      // Connection state
      pusher.connection.bind("connected", () => {
        setIsConnected(true);
        console.log("Chat connected via Pusher");
      });

      pusher.connection.bind("disconnected", () => {
        setIsConnected(false);
        console.log("Chat disconnected");
      });

      pusher.connection.bind("error", (err: any) => {
        console.error("Pusher connection error:", err);
      });

      // Listen for messages
      channel.bind("message", (data: any) => {
        console.log("Message received:", data);
        
        // Don't add our own messages again
        if (data.sender === userName) return;

        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          text: data.text,
          sender: data.sender,
          timestamp: data.timestamp,
          isLocal: false,
        };
        setMessages((prev) => [...prev, newMessage]);
      });

      console.log("Chat initialized for channel:", channelName);
    } catch (err) {
      console.error("Chat init error:", err);
    }

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
      console.log("Chat cleaned up");
    };
  }, [channelName, userName]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        console.log("Cannot send empty message");
        return;
      }

      try {
        const messageData = {
          text: text.trim(),
          sender: userName,
          timestamp: Date.now(),
        };

        // Send to backend API
        const response = await fetch("/api/send-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: channelName,
            message: messageData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        console.log("Message sent:", messageData);

        // Add to local messages
        const newMessage: Message = {
          id: Date.now().toString() + Math.random(),
          text: text.trim(),
          sender: userName,
          timestamp: Date.now(),
          isLocal: true,
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        console.error("Send message error:", err);
      }
    },
    [channelName, userName]
  );

  return {
    messages,
    sendMessage,
    isConnected,
  };
}
