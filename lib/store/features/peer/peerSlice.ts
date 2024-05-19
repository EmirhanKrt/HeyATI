import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface DataChannels {
  muteStatus: RTCDataChannel;
  cameraStatus: RTCDataChannel;
  screenShareStatus: RTCDataChannel;
}

interface PeerConnectionState {
  connection: RTCPeerConnection;
  dataChannels: DataChannels;
  streams: {
    camera: MediaStream | null;
    microphone: MediaStream | null;
    screen: MediaStream | null;
  };
}

interface PeersState {
  peers: Record<string, PeerConnectionState>;
}

const initialState: PeersState = {
  peers: {},
};

export const addPeerConnection = createAsyncThunk(
  "peers/addPeerConnection",
  async ({
    peerId,
    connection,
    dataChannels,
  }: {
    peerId: string;
    connection: RTCPeerConnection;
    dataChannels: DataChannels;
  }) => {
    return { peerId, connection, dataChannels };
  }
);

const peerSlice = createSlice({
  name: "peer",
  initialState,
  reducers: {
    removePeerConnection: (
      state,
      action: PayloadAction<{ peerId: string }>
    ) => {
      const { peerId } = action.payload;
      delete state.peers[peerId];
    },
    updatePeerStream: (
      state,
      action: PayloadAction<{
        peerId: string;
        streamType: "camera" | "microphone" | "screen";
        stream: MediaStream;
      }>
    ) => {
      const { peerId, streamType, stream } = action.payload;
      if (state.peers[peerId]) {
        state.peers[peerId].streams[streamType] = stream;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      addPeerConnection.fulfilled,
      (
        state,
        action: PayloadAction<{
          peerId: string;
          connection: RTCPeerConnection;
          dataChannels: DataChannels;
        }>
      ) => {
        const { peerId, connection, dataChannels } = action.payload;
        state.peers[peerId] = {
          connection,
          dataChannels,
          streams: {
            camera: null,
            microphone: null,
            screen: null,
          },
        };
      }
    );
  },
});

export const { removePeerConnection, updatePeerStream } = peerSlice.actions;

export default peerSlice.reducer;
