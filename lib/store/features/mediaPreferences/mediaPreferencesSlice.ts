import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type MediaPreferencesStateType = {
  isMicrophoneActive: boolean;
  isCameraActive: boolean;
  isScreenSharingActive: boolean;
  devices: MediaDeviceInfo[];
  activeMicrophoneDeviceId: string;
  activeCameraDeviceId: string;
};

const initialState: MediaPreferencesStateType = {
  isMicrophoneActive: false,
  isCameraActive: false,
  isScreenSharingActive: false,
  devices: [],
  activeMicrophoneDeviceId: "",
  activeCameraDeviceId: "",
};

export const mediaPreferencesSlice = createSlice({
  name: "mediaPreferences",
  initialState,
  reducers: {
    toggleMicrophone: (state) => {
      state.isMicrophoneActive = !state.isMicrophoneActive;
    },
    toggleCamera: (state) => {
      state.isCameraActive = !state.isCameraActive;
    },
    toggleScreenShare: (state) => {
      state.isScreenSharingActive = !state.isScreenSharingActive;
    },
    setScreenShareClosed: (state) => {
      state.isScreenSharingActive = false;
    },
    setDevices: (state, action: PayloadAction<MediaDeviceInfo[]>) => {
      state.devices = action.payload;
    },
    setActiveMicrophoneDeviceId: (state, action: PayloadAction<string>) => {
      state.activeMicrophoneDeviceId = action.payload;
    },
    setActiveCameraDeviceId: (state, action: PayloadAction<string>) => {
      state.activeCameraDeviceId = action.payload;
    },
  },
});

export const {
  toggleMicrophone,
  toggleCamera,
  toggleScreenShare,
  setScreenShareClosed,
  setDevices,
  setActiveMicrophoneDeviceId,
  setActiveCameraDeviceId,
} = mediaPreferencesSlice.actions;

export default mediaPreferencesSlice.reducer;
