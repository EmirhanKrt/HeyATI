import { ServerService } from "./services";

type WebSocketType = any;

type UserNameType = string;

type ConnectedUserMapType = Map<UserNameType, WebSocketType>;

type ServerIdType = number;
type ChannelIdType = number;
type EventIdType = number;

type EventMapType = Map<EventIdType, true>;

type ChannelMapType = Map<ChannelIdType, EventMapType>;

type ServerType = {
  users: UserNameType[];
  channels: ChannelMapType;
};

type ServerMapType = Map<ServerIdType, ServerType>;

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private userSocketMap: ConnectedUserMapType;
  private serverSocketMap: ServerMapType;

  constructor() {
    this.userSocketMap = new Map();
    this.serverSocketMap = new Map();
  }

  public static async getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
      await WebSocketManager.instance.initialize();
    }
    return WebSocketManager.instance;
  }

  private async initialize() {
    const userSocketMap = new Map();
    const serverSocketMap = new Map();

    const serverDataList =
      await ServerService.getInitialServerDataForWebsocketManager();

    for (const serverData of serverDataList) {
      const channelMap: ChannelMapType = new Map();

      for (const channel of serverData.channel_list) {
        const eventMap: EventMapType = new Map();

        for (const event of channel.event_list) {
          eventMap.set(event.event_id, true);
        }

        channelMap.set(channel.channel_id, eventMap);
      }

      serverSocketMap.set(serverData.server_id, {
        users: serverData.user_name_list,
        channels: channelMap,
      });
    }

    this.userSocketMap = userSocketMap;
    this.serverSocketMap = serverSocketMap;
  }

  public getAllUsersWebSocket() {
    return this.userSocketMap;
  }

  public addUserWebSocket(userName: UserNameType, ws: WebSocketType): void {
    this.userSocketMap.set(userName, ws);
  }

  public getUserWebSocket(userName: UserNameType) {
    return this.userSocketMap.get(userName);
  }

  public removeUserWebSocket(userName: UserNameType): void {
    this.userSocketMap.delete(userName);
  }

  public getAllServersData() {
    return this.serverSocketMap;
  }
}

export default WebSocketManager;
