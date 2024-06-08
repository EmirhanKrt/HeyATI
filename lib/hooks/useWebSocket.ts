import { useEffect, useRef } from "react";
import { useAppSelector } from "../store/hooks";
import { getHostForWS } from "../api";

export const useWebSocket = (onMessage: (message: any) => void) => {
  const socketRef = useRef<WebSocket | null>(null);
  const { roomId } = useAppSelector((state) => state.videoChat);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`${getHostForWS()}/ws/${roomId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onclose = (event) => {
      console.log("WebSocket disconnected", event);
      if (event.wasClean) {
        console.log(
          `Closed cleanly, code=${event.code} reason=${event.reason}`
        );
      } else {
        console.log(`Connection died`);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      const { data } = JSON.parse(event.data);
      onMessage(data);
    };

    socketRef.current = ws;

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [roomId, onMessage]);

  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not open");
    }
  };

  return { sendMessage };
};
