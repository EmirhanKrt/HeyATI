import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import {
  MessagesGroupedByDateType,
  PrivateMessageSuccessResponseBodyDataType,
  SafeUserType,
} from "@/server/models";
import { convertToLocalDateString } from "@/lib/convertToLocalTimeString";

type InteractedUserWithPrivateMessagesType = Record<
  string,
  SafeUserType & {
    messages: MessagesGroupedByDateType;
  }
>;

type OrderedInteractedUserWithPrivateMessagesType = {
  users: InteractedUserWithPrivateMessagesType;
  order: string[];
};

const initialState = {
  users: {},
  order: [],
} as OrderedInteractedUserWithPrivateMessagesType;

export const interactedUsersSlice = createSlice({
  name: "interactedUsersSlice",
  initialState,
  reducers: {
    initializeInteractedUsers: (
      state,
      action: PayloadAction<SafeUserType[]>
    ) => {
      const newState = state;

      for (const safeUser of action.payload) {
        if (!newState.users[safeUser.user_name]) {
          newState.users[safeUser.user_name] = { ...safeUser, messages: {} };
          newState.order.push(safeUser.user_name);
        }
      }

      return newState;
    },

    addInteractedUser: (state, action: PayloadAction<SafeUserType>) => {
      const newState = state;

      if (!newState.users[action.payload.user_name]) {
        newState.users[action.payload.user_name] = {
          ...action.payload,
          messages: {},
        };
        newState.order.push(action.payload.user_name);
      }

      return newState;
    },

    setFirstInteractedUserByUserName: (
      state,
      action: PayloadAction<string>
    ) => {
      const newState = state;

      newState.order = newState.order.filter(
        (state) => state !== action.payload
      );

      newState.order.unshift(action.payload);

      return newState;
    },

    setMessagesByUserName: (
      state,
      action: PayloadAction<{
        user_name: string;
        messages: PrivateMessageSuccessResponseBodyDataType[];
      }>
    ) => {
      const newState = state;

      const newMessagesGrouped = action.payload.messages.reduce(
        (
          acc: MessagesGroupedByDateType,
          message: PrivateMessageSuccessResponseBodyDataType
        ) => {
          const date = convertToLocalDateString(message.created_at);
          acc[date] = acc[date] || [];
          acc[date].push(message);
          return acc;
        },
        {}
      );

      newState.users[action.payload.user_name].messages = newMessagesGrouped;

      return newState;
    },

    postMessage: (
      state,
      action: PayloadAction<{
        user_name: string;
        message: PrivateMessageSuccessResponseBodyDataType;
      }>
    ) => {
      const newState = state;

      const date = convertToLocalDateString(action.payload.message.created_at);

      if (newState.users[action.payload.user_name].messages) {
        if (newState.users[action.payload.user_name].messages[date]) {
          newState.users[action.payload.user_name].messages[date].unshift(
            action.payload.message
          );
        } else {
          newState.users[action.payload.user_name].messages[date] = [
            action.payload.message,
          ];
        }
      } else {
        newState.users[action.payload.user_name].messages = {
          [date]: [action.payload.message],
        };
      }

      newState.order = newState.order.filter(
        (state) => state !== action.payload.user_name
      );

      newState.order.unshift(action.payload.user_name);

      return newState;
    },

    updateMessage: (
      state,
      action: PayloadAction<{
        user_name: string;
        message: PrivateMessageSuccessResponseBodyDataType;
      }>
    ) => {
      const newState = state;

      const date = convertToLocalDateString(action.payload.message.created_at);

      if (newState.users[action.payload.user_name].messages) {
        if (newState.users[action.payload.user_name].messages[date]) {
          const updatedMessageIndex = newState.users[
            action.payload.user_name
          ].messages[date].findIndex(
            (message) =>
              message.private_message_id ===
              action.payload.message.private_message_id
          );

          newState.users[action.payload.user_name].messages[date][
            updatedMessageIndex
          ] = action.payload.message;
        }
      }

      newState.order = newState.order.filter(
        (state) => state !== action.payload.user_name
      );

      newState.order.unshift(action.payload.user_name);

      return newState;
    },

    deleteMessage: (
      state,
      action: PayloadAction<{
        user_name: string;
        message: PrivateMessageSuccessResponseBodyDataType;
      }>
    ) => {
      const newState = state;

      const date = convertToLocalDateString(action.payload.message.created_at);

      if (newState.users[action.payload.user_name].messages) {
        if (newState.users[action.payload.user_name].messages[date]) {
          newState.users[action.payload.user_name].messages[date] =
            newState.users[action.payload.user_name].messages[date].filter(
              (message) =>
                message.private_message_id !==
                action.payload.message.private_message_id
            );
        }
      }

      newState.order = newState.order.filter(
        (state) => state !== action.payload.user_name
      );

      newState.order.unshift(action.payload.user_name);

      return newState;
    },
  },
});

export const {
  initializeInteractedUsers,
  setFirstInteractedUserByUserName,
  setMessagesByUserName,
  postMessage,
  updateMessage,
  deleteMessage,
} = interactedUsersSlice.actions;

export const selectInteractedUser = (state: RootState) => state.user;

export default interactedUsersSlice.reducer;
