import { SafeUserType } from "@/server/models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type VideoChatStateType = {
  roomId: string;
  calledRoomId: string;
  callerUser: SafeUserType | null;
  isMicrophoneActive: boolean;
  isCameraActive: boolean;
  isScreenSharingActive: boolean;
};

const initialState: VideoChatStateType = {
  roomId: "",
  calledRoomId: "",
  callerUser: null,
  isMicrophoneActive: false,
  isCameraActive: false,
  isScreenSharingActive: false,
};

export const videoChatSlice = createSlice({
  name: "videoChat",
  initialState,
  reducers: {
    createCall: (state, action: PayloadAction<string>) => {
      const newState = state;

      newState.calledRoomId = action.payload;
      newState.roomId = "";
      newState.callerUser = null;

      return newState;
    },
    joinCall: (state) => {
      const newState = state;

      newState.roomId = newState.calledRoomId;
      newState.calledRoomId = "";
      newState.callerUser = null;

      return newState;
    },
    userCalled: (
      state,
      action: PayloadAction<{
        calledRoomId: string;
        callerUser: SafeUserType;
      }>
    ) => {
      const newState = state;

      newState.calledRoomId = action.payload.calledRoomId;
      newState.callerUser = action.payload.callerUser;

      return newState;
    },
    toggleMicrophone: (state) => {
      state.isMicrophoneActive = !state.isMicrophoneActive;
    },
    toggleCamera: (state) => {
      state.isCameraActive = !state.isCameraActive;
    },
    toggleScreenShare: (state) => {
      state.isScreenSharingActive = !state.isScreenSharingActive;
    },
  },
});

export const {
  createCall,
  joinCall,
  userCalled,
  toggleMicrophone,
  toggleCamera,
  toggleScreenShare,
} = videoChatSlice.actions;

export default videoChatSlice.reducer;
