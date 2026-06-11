import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const SOCKET_URL = `${API_BASE_URL}/ws-stomp`;

export class WebSocketClient {
  private client: Client;
  private connected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
  }

  async connect(onConnect?: (frame: IFrame) => void): Promise<void> {
    if (this.connected && this.client.active) {
      onConnect?.({} as IFrame) // 이미 연결됨
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise.then(() => {
        onConnect?.({} as IFrame);
      });
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      this.client.onConnect = (frame) => {
        this.connected = true;
        this.connectionPromise = null;
        onConnect?.(frame);
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
        this.connectionPromise = null;
        reject(frame);
      };

      this.client.activate();
    });

    return this.connectionPromise;
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
