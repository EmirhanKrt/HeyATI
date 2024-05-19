import { Elysia, t } from "elysia";

import * as plugins from "@/server/plugins";
import WebSocketManager from "../websocket-data";

const OPERATION = {
  READY: "ready",
  CREATE: "create",
  JOIN: "join",
  ["ICE-CANDIDATE"]: "ice-candidate",
  OFFER: "offer",
  ANSWER: "answer",
  LEAVE: "leave",
};

const WebsocketServer = new Elysia({ name: "websocket-server" })
  .onStart(() => {
    console.log("Websocket server running.");
  })
  .use(plugins.jwtPlugin)
  .use(plugins.authPlugin)
  .derive(async () => {
    return {
      wsManager: await WebSocketManager,
    };
  })
  .ws("/ws", {
    body: t.Object({
      operation_type: t.String(),
      payload: t.Any(),
    }),
    open(ws) {
      const currentUser = ws.data.user;

      console.log("Socket Opened", currentUser.user_name);
      const wsManager = ws.data.wsManager;

      ws.raw.send(
        JSON.stringify({
          success: true,
          message: `User connected live feed.`,
          data: {
            type: "connected",
            user: currentUser,
          },
        })
      );

      wsManager.onUserConnected(currentUser.user_name as string, {
        socket: ws,
      });
    },
    message(ws, message) {
      const currentUser = ws.data.user;
      const receiverUserNameList = message.payload.user_name;

      const wsManager = ws.data.wsManager;

      if (message.operation_type === OPERATION.CREATE) {
        const room_id = crypto.randomUUID();

        const roomUserMap = [
          currentUser.user_name as string,
          ...receiverUserNameList,
        ];

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

        if (Array.isArray(receiverUserNameList)) {
          for (const receiverUserName of receiverUserNameList) {
            if (receiverUserName === currentUser.user_name) continue;

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
          }
        }
      } else if (message.operation_type === OPERATION.JOIN) {
        ws.send(
          JSON.stringify({
            success: true,
            message: `Joined room succesfully.`,
            data: {
              type: "join_live_chat",
              room_id: message.payload.room_id,
            },
          })
        );
      }
    },
    close(ws) {
      const currentUser = ws.data.user;

      const wsManager = ws.data.wsManager;
      console.log("Socket Closed", currentUser.user_name);

      wsManager.onUserClosed(currentUser.user_name as string);
      ws.raw.send(
        JSON.stringify({
          success: true,
          message: `User closed live feed.`,
          data: {
            type: "closed",
            user: currentUser,
          },
        })
      );
    },
  })
  .ws("/ws/:room_id", {
    body: t.Object({
      operation_type: t.String(),
      payload: t.Any(),
    }),

    open(ws) {
      const currentUser = ws.data.user;
      const room_id = ws.data.params.room_id;

      console.log(
        currentUser.user_name,
        "Joined to room",
        ws.data.params.room_id
      );

      const wsManager = ws.data.wsManager;
      const room = wsManager.getRoomByRoomId(room_id);

      if (room && room.includes(currentUser.user_name as string)) {
        let roomUserSockets = wsManager.getRoomUserSocketsByRoomId(room_id);

        if (!roomUserSockets) roomUserSockets = new Map();

        roomUserSockets.set(currentUser.user_name as string, { socket: ws });

        wsManager.setRoomUserSocketByRoomId(room_id, roomUserSockets);
      } else {
        ws.close();
      }
    },

    message(ws, message) {
      const currentUser = ws.data.user;
      const room_id = ws.data.params.room_id;
      const wsManager = ws.data.wsManager;

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
        case OPERATION.READY:
          roomUserList.forEach((socketsInRooom, userName) => {
            if (userName !== currentUser.user_name) {
              socketsInRooom.socket.raw.send(
                JSON.stringify({
                  success: true,
                  message: `User: ${currentUser.user_name} joined call.`,
                  data: {
                    type: "new_user_joined_to_live_chat",
                    room_id: room_id,
                    user: currentUser,
                  },
                })
              );
            }
          });
          break;

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

        case OPERATION.LEAVE:
          roomUserList.forEach((socketsInRooom, userName) => {
            if (userName !== currentUser.user_name) {
              socketsInRooom.socket.raw.send(
                JSON.stringify({
                  success: true,
                  message: `User: ${currentUser.user_name} left from call.`,
                  data: {
                    type: "user_left_from_live_chat",
                    room_id: room_id,
                    user: currentUser,
                  },
                })
              );
            }
          });
          break;

        default:
          break;
      }
    },

    close(ws) {
      const currentUser = ws.data.user;
      const room_id = ws.data.params.room_id;

      console.log(
        currentUser.user_name,
        "Leaved from room",
        ws.data.params.room_id
      );

      const wsManager = ws.data.wsManager;

      wsManager.removeRoomUserSocketByRoomIdAndUserName(
        room_id,
        currentUser.user_name as string
      );

      let roomUserSockets = wsManager.getRoomUserSocketsByRoomId(room_id);

      if (roomUserSockets && roomUserSockets.size === 0) {
        wsManager.removeRoom(room_id);
      }
    },
  })
  .listen(3001);

export default WebsocketServer;
