import { combineReducers, configureStore } from "@reduxjs/toolkit";

import userSlice from "./features/user/userSlice";
import serverSlice from "./features/server/serverSlice";
import interactedUsersSlice from "./features/interactedUsers/interactedUsersSlice";
import videoChatSlice from "./features/videoChat/videoChatSlice";
import mediaPreferencesSlice from "./features/mediaPreferences/mediaPreferencesSlice";
import peerConnectionStateSlice from "./features/peer/peerSlice";

import webSocketMiddleware from "./middlewares/webSocket/webSocketMiddleware";

const socketMiddleware = webSocketMiddleware({
  wsConnect: "WEBSOCKET_CONNECT",
  wsSendMessage: "WEBSOCKET_SEND_MESSAGE",
});

const reducer = combineReducers({
  user: userSlice,
  server: serverSlice,
  interactedUsers: interactedUsersSlice,
  videoChat: videoChatSlice,
  mediaPreferences: mediaPreferencesSlice,
  peerConnectionState: peerConnectionStateSlice,
});

export type TRootState = ReturnType<typeof reducer>;

export const makeStore = () => {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(socketMiddleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
