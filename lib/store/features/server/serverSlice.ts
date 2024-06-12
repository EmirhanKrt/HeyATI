import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { SafeServerType, ServerDetailedDataType } from "@/server/models/server";
import {
  ChannelMessagesGroupedByDateType,
  ChannelMessageSuccessResponseBodyDataType,
  SafeChannelType,
  SafeEventType,
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

    postChannelEvent: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        event: SafeEventType;
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

      channel.events.push(action.payload.event);

      return state;
    },

    updateChannelEvent: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        event: SafeEventType;
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

      const eventIndex = channel.events.findIndex(
        (event) => event.event_id === action.payload.event.event_id
      );

      if (eventIndex !== -1)
        channel.events[eventIndex] = { ...action.payload.event };

      return state;
    },

    deleteChannelEvent: (
      state,
      action: PayloadAction<{
        server_id: number;
        channel_id: number;
        event: SafeEventType;
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

      const eventIndex = channel.events.findIndex(
        (event) => event.event_id === action.payload.event.event_id
      );

      if (eventIndex !== -1) channel.events.splice(eventIndex, 1);

      return state;
    },

    postServerUser: (
      state,
      action: PayloadAction<{
        server_id: number;
        user: {
          user_id: number;
          user_name: string;
          first_name: string;
          last_name: string;
          role: string;
        };
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      server.users.push(action.payload.user);

      return state;
    },

    updateServerUser: (
      state,
      action: PayloadAction<{
        server_id: number;
        user: {
          user_id: number;
          user_name: string;
          first_name: string;
          last_name: string;
          role: string;
        };
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const userIndex = server.users.findIndex(
        (user) => user.user_id === action.payload.user.user_id
      );

      if (userIndex !== -1)
        server.users[userIndex] = { ...action.payload.user };

      return state;
    },

    deleteServerUser: (
      state,
      action: PayloadAction<{
        server_id: number;
        user: {
          user_id: number;
          user_name: string;
          first_name: string;
          last_name: string;
          role: string;
        };
      }>
    ) => {
      const server = state[action.payload.server_id];
      if (!server) return action;

      const userIndex = server.users.findIndex(
        (user) => user.user_id === action.payload.user.user_id
      );

      if (userIndex !== -1) server.users.splice(userIndex, 1);

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

  postChannelEvent,
  updateChannelEvent,
  deleteChannelEvent,

  postServerUser,
  updateServerUser,
  deleteServerUser,
} = serverSlice.actions;

export const selectServer = (state: RootState) => state.server;

export default serverSlice.reducer;
