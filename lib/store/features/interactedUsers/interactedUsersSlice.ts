import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { SafeUserType } from "@/server/models";

const initialState = [] as SafeUserType[];

export const interactedUsersSlice = createSlice({
  name: "interactedUsersSlice",
  initialState,
  reducers: {
    initializeInteractedUsers: (
      state,
      action: PayloadAction<SafeUserType[]>
    ) => {
      return action.payload;
    },
    addInteractedUser: (state, action: PayloadAction<SafeUserType>) => {
      return [...state, action.payload];
    },
  },
});

export const { initializeInteractedUsers } = interactedUsersSlice.actions;

export const selectInteractedUser = (state: RootState) => state.user;

export default interactedUsersSlice.reducer;
