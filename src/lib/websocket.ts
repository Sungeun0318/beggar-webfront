import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const SOCKET_URL = `${API_BASE_URL}/ws-stomp`;

export class WebSocketClient {
  private client: Client;
  private connected: boolean = false;
  private connectionPromise: Promise<void> | null = null;
  private resolvePromise: (() => void) | null = null;
  private rejectPromise: ((reason?: any) => void) | null = null;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.connected = true;
        this.connectionPromise = null;
        console.log("✅ WebSocket connected");
        if (this.resolvePromise) {
          this.resolvePromise();
          this.resolvePromise = null;
          this.rejectPromise = null;
        }
      },
      onDisconnect: () => {
        this.connected = false;
        this.connectionPromise = null;
        console.log("🔌 WebSocket disconnected");
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        this.handleError(frame);
      },
      onWebSocketClose: (event) => {
        this.connected = false;
        this.connectionPromise = null;
        console.warn("WebSocket closed:", {
          code: event.code,
          reason: event.reason,
        });
        this.handleError(event);
      },
      onWebSocketError: (event) => {
        this.connected = false;
        this.connectionPromise = null;
        console.error("WebSocket connection error:", {
          socketUrl: SOCKET_URL,
          event,
        });
        this.handleError(event);
      },
    });
  }

  private handleError(error: any) {
    if (this.rejectPromise) {
      this.rejectPromise(error);
      this.rejectPromise = null;
      this.resolvePromise = null;
    }
  }

  async connect(onConnect?: (frame: IFrame) => void): Promise<void> {
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.client.connectHeaders = {
        Authorization: `Bearer ${token}`,
      };
    }

    if (this.connected && this.client.active) {
      onConnect?.({} as IFrame);
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise.then(() => {
        onConnect?.({} as IFrame);
      });
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;

      // 이미 activate된 경우 강제 재연결 시도 또는 상태 확인이 필요할 수 있으나, 
      // 여기서는 새로 활성화합니다.
      this.client.activate();
    });

    return this.connectionPromise.then(() => {
      onConnect?.({} as IFrame);
    });
  }

  isConnected() {
    return this.connected && this.client.active;
  }

  subscribe(topic: string, callback: (message: IMessage) => void) {
    if (!this.connected) {
      console.warn("Socket not connected. Subscription might fail.");
    }
    return this.client.subscribe(topic, callback);
  }

  publish(destination: string, body: any) {
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect() {
    this.client.deactivate();
    this.connected = false;
    this.connectionPromise = null;
  }
}

export const wsClient = new WebSocketClient();
