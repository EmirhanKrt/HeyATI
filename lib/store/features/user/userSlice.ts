import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { SafeUserType } from "@/server/models";

const initialState: SafeUserType = {
  user_id: 0,
  user_name: "john_doe",
  user_email: "john_doe@mail.com",
  first_name: "John",
  last_name: "Doe",
  created_at: new Date().toISOString(),
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    initializeUser: (state, action: PayloadAction<SafeUserType>) => {
      return action.payload;
    },
  },
});

export const { initializeUser } = userSlice.actions;

export const selectUser = (state: RootState) => state.user;

export default userSlice.reducer;
