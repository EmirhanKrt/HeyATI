import { Elysia, t } from "elysia";

import * as plugins from "@/server/plugins";
import WebSocketManager from "../websocket-data";

const OPERATION = {
  CREATE: "create",
  JOIN: "join",
  ["ICE-CANDIDATE"]: "ice-candidate",
  OFFER: "offer",
  ANSWER: "answer",
  LEAVE: "leave",
};

const WebsocketServer = new Elysia({ name: "websocket-server" })
  .onStart(async () => {
    console.log("websocket is started");

    await WebSocketManager.getInstance();
  })
  .use(plugins.jwtPlugin)
  .use(plugins.authPlugin)
  .ws("/ws", {
    body: t.Object({
      operation_type: t.String(),
      payload: t.Any(),
    }),
    open: async (ws) => {
      const currentUser = ws.data.user;

      console.log("Socket Opened", currentUser.user_name);
      const wsManager = await WebSocketManager.getInstance();

      wsManager.onUserConnected(currentUser.user_name as string, {
        socket: ws,
      });

      return;
    },
    message: async (ws, message) => {
      const currentUser = ws.data.user;
      const receiverUserName = message.payload.user_name;

      const wsManager = await WebSocketManager.getInstance();

      if (message.operation_type === OPERATION.CREATE) {
        const room_id = crypto.randomUUID();

        const roomUserMap = [currentUser.user_name as string, receiverUserName];

        wsManager.createRoom(room_id, roomUserMap);

        ws.send(
          JSON.stringify({
            success: true,
            message: `Created room (${room_id}) succesfully.`,
            data: {
              type: "create_live_chat",
              room_id: room_id,
            },
          })
        );

        const receiverUserSocket =
          wsManager.getUserConnection(receiverUserName);

        if (receiverUserSocket) {
          receiverUserSocket.socket.send(
            JSON.stringify({
              success: true,
              message: `User: ${currentUser.user_name} called.`,
              data: {
                type: "request_user_to_join_live_chat",
                room_id: room_id,
                user: currentUser,
              },
            })
          );
        }
      } else if (message.operation_type === OPERATION.JOIN) {
        ws.send(
          JSON.stringify({
            success: true,
            message: `Joined room succesfully.`,
            data: {
              type: "join_live_chat",
            },
          })
        );
      }
    },
    close: async (ws) => {
      const currentUser = ws.data.user;

      console.log("Socket Closed", currentUser.user_name);
      const wsManager = await WebSocketManager.getInstance();

      wsManager.onUserClosed(currentUser.user_name as string);
      return;
    },
  })
  .ws("/ws/:room_id", {
    body: t.Object({
      operation_type: t.String(),
      payload: t.Any(),
    }),

    open: async (ws) => {
      const currentUser = ws.data.user;
      const room_id = ws.data.params.room_id;

      console.log(
        currentUser.user_name,
        "Joined to room",
        ws.data.params.room_id
      );

      const wsManager = await WebSocketManager.getInstance();
      const room = wsManager.getRoomByRoomId(room_id);

      if (room && room.includes(currentUser.user_name as string)) {
        let roomUserSockets = wsManager.getRoomUserSocketsByRoomId(room_id);

        if (roomUserSockets) {
          roomUserSockets.forEach(({ socket }, user) => {
            const message = {
              success: true,
              message: `User: ${currentUser.user_name} joined call.`,
              data: {
                type: "new_user_joined_to_live_chat",
                room_id: room_id,
                user: currentUser,
              },
            };

            if (user !== currentUser.user_name)
              socket.raw.send(JSON.stringify(message));
          });
        } else {
          roomUserSockets = new Map();
        }

        roomUserSockets.set(currentUser.user_name as string, { socket: ws });

        wsManager.setRoomUserSocketByRoomId(room_id, roomUserSockets);
      } else {
        ws.close();
      }
    },

    message: async (ws, message) => {
      const currentUser = ws.data.user;
      const room_id = ws.data.params.room_id;

      const wsManager = await WebSocketManager.getInstance();

      const roomUserList = wsManager.getRoomUserSocketsByRoomId(room_id);

      if (!roomUserList) return;

      console.log(
        "Request sender:",
        currentUser.user_name,
        "Operation:",
        message.operation_type,
        "Target user's user_name:",
        message.payload.user_name
      );

      switch (message.operation_type) {
        case OPERATION.OFFER:
          var targetSocket = roomUserList.get(
            message.payload.user_name as string
          )!;

          targetSocket.socket.raw.send(
            JSON.stringify({
              success: true,
              message: `Received offer from user: ${currentUser.user_name}.`,
              data: {
                type: "offer_live_chat",
                user: currentUser,
                offer: message.payload.offer,
              },
            })
          );
          break;

        case OPERATION.ANSWER:
          var targetSocket = roomUserList.get(
            message.payload.user_name as string
          )!;

          targetSocket.socket.raw.send(
            JSON.stringify({
              success: true,
              message: `Received answer from user: ${currentUser.user_name}.`,
              data: {
                type: "answer_live_chat",
                user: currentUser,
                answer: message.payload.answer,
              },
            })
          );
          break;

        case OPERATION["ICE-CANDIDATE"]:
          var targetSocket = roomUserList.get(
            message.payload.user_name as string
          )!;

          targetSocket.socket.raw.send(
            JSON.stringify({
              success: true,
              message: `Received ice candidate from user: ${currentUser.user_name}.`,
              data: {
                type: "ice_candidate_live_chat",
                user: currentUser,
                candidate: message.payload.candidate,
              },
            })
          );
          break;

        default:
          break;
      }
    },

    close: async (ws) => {
      const currentUser = ws.data.user;
      const room_id = ws.data.params.room_id;

      console.log(
        currentUser.user_name,
        "Leaved from room",
        ws.data.params.room_id
      );

      const wsManager = await WebSocketManager.getInstance();

      wsManager.removeRoomUserSocketByRoomIdAndUserName(
        room_id,
        currentUser.user_name as string
      );

      let roomUserSockets = wsManager.getRoomUserSocketsByRoomId(room_id);

      if (roomUserSockets) {
        if (roomUserSockets.size !== 0) {
          roomUserSockets.forEach(({ socket }, user) => {
            const message = {
              success: true,
              message: `User: ${user} joined call.`,
              data: {
                type: "user_left_from_live_chat",
                room_id: room_id,
                user: currentUser,
              },
            };

            socket.raw.send(JSON.stringify(message));
          });
        } else {
          wsManager.removeRoom(room_id);
        }
      }
    },
  })
  .listen(3001);

export default WebsocketServer;
