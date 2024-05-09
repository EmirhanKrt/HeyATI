export type WebSocketType = any;

class WebSocketManager {
  private static instance: WebSocketManager;
  private connectedUserMappedWebsocket: Record<string, WebSocketType | null>;

  private constructor() {
    this.connectedUserMappedWebsocket = {};
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public getAllConnectedUsers(): Record<string, WebSocketType | null> {
    return this.connectedUserMappedWebsocket;
  }

  public getConnectedUserWebSocket(userName: string): WebSocketType | null {
    return this.connectedUserMappedWebsocket[userName] || null;
  }

  public setConnectedUserWebSocket(userName: string, ws: WebSocketType): void {
    if (!this.connectedUserMappedWebsocket[userName]) {
      this.connectedUserMappedWebsocket[userName] = ws;
    }
  }

  public removeConnectedUserWebSocket(userName: string): void {
    if (this.connectedUserMappedWebsocket[userName]) {
      delete this.connectedUserMappedWebsocket[userName];
    }
  }
}

export default WebSocketManager;
