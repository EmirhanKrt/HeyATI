import {
  postMessage,
  updateMessage,
  deleteMessage,
} from "../../features/interactedUsers/interactedUsersSlice";
import {
  addChannel,
  deleteChannel,
  deleteChannelMessage,
  postChannelMessage,
  updateChannel,
  updateChannelMessage,
} from "../../features/server/serverSlice";
import {
  createCall,
  joinCall,
  receivedJoinCall,
  receivedJoinChannelCall,
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

    case "request_user_to_join_channel_live_chat":
      dispatch(
        receivedJoinChannelCall({
          roomId: data.room_id,
          calledRoomId: data.room_id,
          calledServerId: data.server_id,
          calledChannelId: data.channel_id,
          calledChannelName: data.channel_name,
        })
      );
      break;

    case "join_live_chat":
      dispatch(joinCall({ roomId: data.room_id }));
      break;

    case "post_channel_message":
      dispatch(
        postChannelMessage({
          server_id: data.server_id,
          channel_id: data.channel_id,
          message: data.message,
        })
      );
      break;

    case "update_channel_message":
      dispatch(
        updateChannelMessage({
          server_id: data.server_id,
          channel_id: data.channel_id,
          message: data.message,
        })
      );
      break;

    case "delete_channel_message":
      dispatch(
        deleteChannelMessage({
          server_id: data.server_id,
          channel_id: data.channel_id,
          message: data.message,
        })
      );
      break;

    case "post_channel":
      dispatch(
        addChannel({
          server_id: data.server_id,
          channel: data.channel,
        })
      );
      break;

    case "update_channel":
      dispatch(
        updateChannel({
          server_id: data.server_id,
          channel: data.channel,
        })
      );
      break;

    case "delete_channel":
      dispatch(
        deleteChannel({
          server_id: data.server_id,
          channel: data.channel,
        })
      );
      break;

    default:
      break;
  }
};

export default webSocketMessageHandler;
