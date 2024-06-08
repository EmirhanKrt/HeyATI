import { SafeUserType } from "@/server/models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type VideoChatStateType = {
  roomId: string | null;
  showPreview: boolean;
  showPreviewType:
    | null
    | "create_live_chat"
    | "create_channel_live_chat"
    | "join_live_chat"
    | "join_channel_live_chat";
  showPreviewPayload: any;
  isFullScreen: boolean;
};

const initialState: VideoChatStateType = {
  roomId: null,
  showPreview: false,
  showPreviewType: null,
  showPreviewPayload: {},
  isFullScreen: true,
};

export const videoChatSlice = createSlice({
  name: "videoChat",
  initialState,
  reducers: {
    requestedCreateCall: (
      state,
      action: PayloadAction<{ userName: string }>
    ) => {
      state.showPreview = true;
      state.showPreviewType = "create_live_chat";
      state.showPreviewPayload = action.payload;
      state.isFullScreen = true;
    },
    requestedCreateChannelCall: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        channel_name: string;
      }>
    ) => {
      state.showPreview = true;
      state.showPreviewType = "create_channel_live_chat";
      state.showPreviewPayload = action.payload;
      state.isFullScreen = true;
    },
    receivedJoinCall: (
      state,
      action: PayloadAction<{
        roomId: string;
        calledRoomId: string;
        callerUser: SafeUserType;
      }>
    ) => {
      state.showPreview = true;
      state.showPreviewType = "join_live_chat";
      state.showPreviewPayload = action.payload;
      state.isFullScreen = true;
    },
    receivedJoinChannelCall: (
      state,
      action: PayloadAction<{
        roomId: string;
        calledRoomId: string;
        calledServerId: number;
        calledChannelId: number;
        calledChannelName: string;
      }>
    ) => {
      state.showPreview = true;
      state.showPreviewType = "join_channel_live_chat";
      state.showPreviewPayload = action.payload;
      state.isFullScreen = true;
    },
    createCall: (state) => {
      state.roomId = "";
      state.isFullScreen = true;
    },
    joinCall: (
      state,
      action: PayloadAction<{
        roomId: string;
      }>
    ) => {
      state.roomId = action.payload.roomId;
      state.showPreview = false;
      state.showPreviewType = null;
      state.showPreviewPayload = {};
      state.isFullScreen = true;
    },
    rejectCall: (state) => {
      state.showPreview = false;
      state.showPreviewType = null;
      state.showPreviewPayload = {};
    },
    leaveCall: (state) => {
      state.roomId = null;
      state.showPreview = false;
      state.showPreviewType = null;
      state.showPreviewPayload = {};
      state.isFullScreen = false;
    },
    toggleFullScreen: (state) => {
      state.isFullScreen = !state.isFullScreen;
    },
    setFullScreen: (state, action: PayloadAction<boolean>) => {
      state.isFullScreen = action.payload;
    },
  },
});

export const {
  requestedCreateCall,
  requestedCreateChannelCall,
  receivedJoinCall,
  receivedJoinChannelCall,
  createCall,
  rejectCall,
  joinCall,
  leaveCall,
  toggleFullScreen,
  setFullScreen,
} = videoChatSlice.actions;

export default videoChatSlice.reducer;
