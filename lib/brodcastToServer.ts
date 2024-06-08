import { WebSocketManager } from "@/server/websocket-data";

export const broadcastToServer = (
  wsManager: WebSocketManager,
  server_id: number,
  user_name: string,
  payload: any
) => {
  const userNameList = wsManager.getServerUserSocket(server_id);

  if (userNameList) {
    userNameList
      .filter((userName) => userName !== user_name)
      .forEach((userName) => {
        const websocket = wsManager.getUserConnection(userName);

        if (websocket) {
          websocket.socket.send(JSON.stringify(payload));
        }
      });
  }
};
