import { configureStore } from "@reduxjs/toolkit";

import userSlice from "./features/user/userSlice";
import serverSlice from "./features/server/serverSlice";
import interactedUsersSlice from "./features/interactedUsers/interactedUsersSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userSlice,
      server: serverSlice,
      interactedUsers: interactedUsersSlice,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;

export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
