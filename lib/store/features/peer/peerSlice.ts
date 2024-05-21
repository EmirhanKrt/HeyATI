import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PeerConnectionState {
  isMicrophoneActive: boolean;
  isCameraActive: boolean;
  isScreenActive: boolean;
  screenShareTrackId?: string;
}

interface PeersState {
  peerConnectionStates: Record<string, PeerConnectionState>;
}

const initialState: PeersState = {
  peerConnectionStates: {},
};

const peerConnectionStateSlice = createSlice({
  name: "peerConnectionState",
  initialState,
  reducers: {
    initializePeerConnectionState: (
      state,
      action: PayloadAction<{
        peerId: string;
      }>
    ) => {
      if (!state.peerConnectionStates[action.payload.peerId]) {
        state.peerConnectionStates[action.payload.peerId] = {
          isMicrophoneActive: false,
          isCameraActive: false,
          isScreenActive: false,
        };
      }
    },
    updatePeerConnectionState: (
      state,
      action: PayloadAction<{
        peerId: string;
        mediaType: "camera" | "microphone" | "screen";
        mediaStatus: boolean;
      }>
    ) => {
      if (state.peerConnectionStates[action.payload.peerId]) {
        const peerConnectionState: any = {};

        switch (action.payload.mediaType) {
          case "camera":
            peerConnectionState.isCameraActive = action.payload.mediaStatus;
            break;

          case "microphone":
            peerConnectionState.isMicrophoneActive = action.payload.mediaStatus;
            break;

          case "screen":
            peerConnectionState.isScreenActive = action.payload.mediaStatus;
            break;

          default:
            break;
        }

        state.peerConnectionStates[action.payload.peerId] = {
          ...state.peerConnectionStates[action.payload.peerId],
          ...peerConnectionState,
        };
      }
    },
    removePeerConnectionState: (
      state,
      action: PayloadAction<{
        peerId: string;
      }>
    ) => {
      if (state.peerConnectionStates[action.payload.peerId]) {
        delete state.peerConnectionStates[action.payload.peerId];
      }
    },
  },
});

export const {
  initializePeerConnectionState,
  updatePeerConnectionState,
  removePeerConnectionState,
} = peerConnectionStateSlice.actions;

export default peerConnectionStateSlice.reducer;
