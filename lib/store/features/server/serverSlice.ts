import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { SafeServerType, ServerDetailedDataType } from "@/server/models/server";
import {
  ChannelMessagesGroupedByDateType,
  ChannelMessageSuccessResponseBodyDataType,
  SafeChannelType,
} from "@/server/models";
import { convertToLocalDateString } from "@/lib/convertToLocalTimeString";

export type ServerSliceType = Record<number, ServerDetailedDataType>;

const initialState = {} as ServerSliceType;

export const initialServerDetailedData = (
  server_id: number
): ServerDetailedDataType => ({
  server_id,
  server_name: "initial",
  server_description: "initial",
  owner_id: 0,
  created_at: new Date().toLocaleTimeString(),
  users: [],
  channels: [],
});

export const serverSlice = createSlice({
  name: "server",
  initialState,
  reducers: {
    initializeServer: (
      state,
      action: PayloadAction<ServerDetailedDataType[]>
    ) => {
      action.payload.forEach((server) => {
        state[server.server_id] = {
          ...server,
          users: server.users,
          channels: server.channels,
        };
      });
    },

    addServer: (state, action: PayloadAction<ServerDetailedDataType>) => {
      state[action.payload.server_id] = {
        ...action.payload,
        users: action.payload.users,
        channels: action.payload.channels,
      };
    },

    updateServer: (state, action: PayloadAction<SafeServerType>) => {
      state[action.payload.server_id] = {
        ...state[action.payload.server_id],
        ...action.payload,
      };
    },

    deleteServer: (state, action: PayloadAction<number>) => {
      if (state[action.payload]) delete state[action.payload];
    },

    addChannel: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel: SafeChannelType;
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const channelIndex = server.channels.findIndex(
        (channel) => channel.channel_id === action.payload.channel.channel_id
      );
      if (channelIndex !== -1) return action;

      state[action.payload.server_id].channels.push({
        ...action.payload.channel,
        messages: {},
        events: [],
      });
    },

    updateChannel: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel: SafeChannelType;
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const channelIndex = server.channels.findIndex(
        (channel) => channel.channel_id === action.payload.channel.channel_id
      );
      if (channelIndex === -1) return action;

      let channel = server.channels[channelIndex];
      if (!channel) return action;

      state[action.payload.server_id].channels[channelIndex] = {
        ...state[action.payload.server_id].channels[channelIndex],
        ...action.payload.channel,
      };
    },

    deleteChannel: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel: SafeChannelType;
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const channelIndex = server.channels.findIndex(
        (channel) => channel.channel_id === action.payload.channel.channel_id
      );
      if (channelIndex === -1) return action;

      let channel = server.channels[channelIndex];
      if (!channel) return action;

      state[action.payload.server_id].channels.splice(channelIndex, 1);
    },

    setMessagesByChannelId: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        messages: ChannelMessageSuccessResponseBodyDataType[];
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const channelIndex = server.channels.findIndex(
        (channel) => channel.channel_id === action.payload.channel_id
      );
      if (channelIndex === -1) return action;

      const channel = server.channels[channelIndex];
      if (!channel) return action;

      const newMessagesGrouped = action.payload.messages.reduce(
        (
          acc: ChannelMessagesGroupedByDateType,
          message: ChannelMessageSuccessResponseBodyDataType
        ) => {
          const date = convertToLocalDateString(message.created_at);
          acc[date] = acc[date] || [];
          acc[date].push(message);
          return acc;
        },
        {}
      );

      channel.messages = newMessagesGrouped;
    },

    postChannelMessage: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        message: ChannelMessageSuccessResponseBodyDataType;
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const channelIndex = server.channels.findIndex(
        (channel) => channel.channel_id === action.payload.channel_id
      );
      if (channelIndex === -1) return action;

      const channel = server.channels[channelIndex];
      if (!channel) return action;

      const date = convertToLocalDateString(action.payload.message.created_at);

      if (!channel.messages) channel.messages = {};
      if (!channel.messages[date]) channel.messages[date] = [];
      channel.messages[date].unshift(action.payload.message);
    },

    updateChannelMessage: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        message: ChannelMessageSuccessResponseBodyDataType;
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const channelIndex = server.channels.findIndex(
        (channel) => channel.channel_id === action.payload.channel_id
      );
      if (channelIndex === -1) return action;

      const channel = server.channels[channelIndex];
      if (!channel) return action;

      const date = convertToLocalDateString(action.payload.message.created_at);

      if (!channel.messages) channel.messages = {};
      if (!channel.messages[date]) channel.messages[date] = [];

      const originalMessageIndex = channel.messages[date].findIndex(
        (message) =>
          message.channel_message_id ===
          action.payload.message.channel_message_id
      );

      if (originalMessageIndex !== -1) {
        state[action.payload.server_id].channels[channelIndex].messages[date][
          originalMessageIndex
        ] = action.payload.message;
      }

      return state;
    },

    deleteChannelMessage: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        message: ChannelMessageSuccessResponseBodyDataType;
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const channelIndex = server.channels.findIndex(
        (channel) => channel.channel_id === action.payload.channel_id
      );
      if (channelIndex === -1) return action;

      const channel = server.channels[channelIndex];
      if (!channel) return action;

      const date = convertToLocalDateString(action.payload.message.created_at);

      if (!channel.messages[date]) channel.messages[date] = [];
      const originalMessageIndex = channel.messages[date].findIndex(
        (message) =>
          message.channel_message_id ===
          action.payload.message.channel_message_id
      );

      if (originalMessageIndex !== -1) {
        state[action.payload.server_id].channels[channelIndex].messages[
          date
        ].splice(originalMessageIndex, 1);
      }

      return state;
    },
  },
});

export const {
  initializeServer,

  addServer,
  updateServer,
  deleteServer,

  addChannel,
  updateChannel,
  deleteChannel,

  setMessagesByChannelId,
  postChannelMessage,
  updateChannelMessage,
  deleteChannelMessage,
} = serverSlice.actions;

export const selectServer = (state: RootState) => state.server;

export default serverSlice.reducer;
