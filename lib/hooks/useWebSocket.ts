import { useEffect, useRef } from "react";
import { useAppSelector } from "../store/hooks";

export const useWebSocket = (onMessage: (message: any) => void) => {
  const socketRef = useRef<WebSocket | null>(null);
  const { roomId } = useAppSelector((state) => state.videoChat);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/ws/${roomId}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
    ws.onmessage = (event) => {
      const { data } = JSON.parse(event.data);
      onMessage(data);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [roomId, onMessage]);

  const sendMessage = (message: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log("sendMessage", message);
      socketRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
};
