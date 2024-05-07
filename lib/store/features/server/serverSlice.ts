import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { SafeServerType } from "@/server/models";

const initialState = [] as SafeServerType[];

export const serverSlice = createSlice({
  name: "server",
  initialState,
  reducers: {
    initializeServer: (state, action: PayloadAction<SafeServerType[]>) => {
      return action.payload;
    },
    addServer: (state, action: PayloadAction<SafeServerType>) => {
      return [...state, action.payload];
    },
  },
});

export const { initializeServer, addServer } = serverSlice.actions;

export const selectServer = (state: RootState) => state.server;

export default serverSlice.reducer;
