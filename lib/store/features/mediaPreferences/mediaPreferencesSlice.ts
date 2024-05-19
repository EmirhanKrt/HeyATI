import { createSlice } from "@reduxjs/toolkit";

type MediaPreferencesStateType = {
  isMicrophoneActive: boolean;
  isCameraActive: boolean;
  isScreenSharingActive: boolean;
};

const initialState: MediaPreferencesStateType = {
  isMicrophoneActive: false,
  isCameraActive: false,
  isScreenSharingActive: false,
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
  },
});

export const { toggleMicrophone, toggleCamera, toggleScreenShare } =
  mediaPreferencesSlice.actions;

export default mediaPreferencesSlice.reducer;
