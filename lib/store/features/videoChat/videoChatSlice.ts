import { SafeUserType } from "@/server/models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type VideoChatStateType = {
  roomId: string | null;
  showPreview: boolean;
  showPreviewType: null | "create_live_chat" | "join_live_chat";
  showPreviewPayload: any;
};

const initialState: VideoChatStateType = {
  roomId: null,
  showPreview: false,
  showPreviewType: null,
  showPreviewPayload: {},
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
    },
    createCall: (state) => {
      state.roomId = "";
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
    },
    leaveCall: (state) => {
      state.roomId = null;
      state.showPreview = false;
      state.showPreviewType = null;
      state.showPreviewPayload = {};
    },
  },
});

export const {
  requestedCreateCall,
  receivedJoinCall,
  createCall,
  joinCall,
  leaveCall,
} = videoChatSlice.actions;

export default videoChatSlice.reducer;
