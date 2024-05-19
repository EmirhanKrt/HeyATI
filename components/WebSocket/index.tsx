"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/lib/store/hooks";

const WebSocketConnection = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch({
      type: "WEBSOCKET_CONNECT",
    });

    return () => {};
  }, []);

  return null;
};

export default WebSocketConnection;
