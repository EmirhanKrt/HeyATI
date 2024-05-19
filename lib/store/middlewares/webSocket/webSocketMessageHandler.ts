import {
  postMessage,
  updateMessage,
  deleteMessage,
} from "../../features/interactedUsers/interactedUsersSlice";
import {
  createCall,
  joinCall,
  receivedJoinCall,
} from "../../features/videoChat/videoChatSlice";

const webSocketMessageHandler = (event: MessageEvent<any>, dispatch: any) => {
  const message = event.data;

  const messageAsJson = JSON.parse(message);

  const data = messageAsJson.data;

  switch (data.type) {
    case "post_private_message":
      dispatch(
        postMessage({
          user_name: data.sender_user_name,
          message: data.message,
        })
      );
      break;

    case "update_private_message":
      dispatch(
        updateMessage({
          user_name: data.sender_user_name,
          message: data.message,
        })
      );
      break;

    case "delete_private_message":
      dispatch(
        deleteMessage({
          user_name: data.sender_user_name,
          message: data.message,
        })
      );
      break;

    case "create_live_chat":
      dispatch(createCall(data.room_id));

      dispatch({
        type: "WEBSOCKET_SEND_MESSAGE",
        payload: JSON.stringify({
          operation_type: "join",
          payload: { room_id: data.room_id },
        }),
      });
      break;

    case "request_user_to_join_live_chat":
      dispatch(
        receivedJoinCall({
          roomId: data.room_id,
          calledRoomId: data.room_id,
          callerUser: data.user,
        })
      );
      break;

    case "join_live_chat":
      dispatch(joinCall({ roomId: data.room_id }));
      break;

    default:
      break;
  }
};

export default webSocketMessageHandler;
