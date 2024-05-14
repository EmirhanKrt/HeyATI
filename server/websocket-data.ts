import { ServerService } from "./services";

type WebSocketType = { socket: any };

type UserNameType = string;
type UserMapType = Map<UserNameType, WebSocketType>;

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

type RoomMap = Map<string, UserNameType[]>;

type RoomUserMap = Map<string, UserMapType>;

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private userSocketMap: UserMapType;
  private serverSocketMap: ServerMapType;
  private roomJoinableUserMap: RoomMap;
  private roomUserSocketMap: RoomUserMap;

  constructor() {
    this.userSocketMap = new Map();
    this.serverSocketMap = new Map();
    this.roomJoinableUserMap = new Map();
    this.roomUserSocketMap = new Map();
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

  public getUserConnection(userName: UserNameType) {
    return this.userSocketMap.get(userName);
  }

  public onUserConnected(userName: UserNameType, ws: WebSocketType): void {
    this.userSocketMap.set(userName, ws);
  }

  public onUserClosed(userName: UserNameType): void {
    this.userSocketMap.delete(userName);
  }

  public createRoom(roomId: string, userNameList: UserNameType[]) {
    this.roomJoinableUserMap.set(roomId, userNameList);
  }

  public getRoomByRoomId(roomId: string) {
    return this.roomJoinableUserMap.get(roomId);
  }

  public removeRoom(roomId: string) {
    this.roomJoinableUserMap.delete(roomId);
  }

  public setRoomUserSocketByRoomId(roomId: string, userSocket: UserMapType) {
    this.roomUserSocketMap.set(roomId, userSocket);
  }

  public getRoomUserSocketsByRoomId(roomId: string) {
    return this.roomUserSocketMap.get(roomId);
  }

  public removeRoomUserSocketByRoomIdAndUserName(
    roomId: string,
    userName: string
  ) {
    const room = this.getRoomUserSocketsByRoomId(roomId);

    if (room) {
      room.delete(userName);

      this.setRoomUserSocketByRoomId(roomId, room);
    }
  }

  public addRoomUserSocketByRoomIdAndUserName(
    roomId: string,
    userName: string
  ) {
    const room = this.getRoomUserSocketsByRoomId(roomId);

    if (room) {
      room.delete(userName);

      this.setRoomUserSocketByRoomId(roomId, room);
    }
  }
}

export default WebSocketManager;
