import { Client, type IFrame, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const defaultBaseUrl =
  "http://savemyfriendship-env.eba-h8rmizc9.ap-northeast-2.elasticbeanstalk.com";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl;

// 프로토콜을 http -> ws, https -> wss로 변환
const SOCKET_URL = API_BASE_URL.replace(/^http/, "ws") + "/ws-stomp";

export class WebSocketClient {
  private client: Client;
  private connected: boolean = false;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    this.client = new Client({
      brokerURL: SOCKET_URL,
      // SockJS가 필요한 경우를 위해 webSocketFactory 유지 (백엔드 설정에 따라 선택)
      webSocketFactory: () => new SockJS(API_BASE_URL + "/ws-stomp"),
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
      onConnect?.({} as IFrame);
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
        console.log("Connected to STOMP broker");
        onConnect?.(frame);
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
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
    return this.client.subscribe(topic, callback);
  }

  publish(destination: string, body: any) {
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  disconnect() {
    if (this.client.active) {
      this.client.deactivate();
      this.connected = false;
      this.connectionPromise = null;
    }
  }
}

export const wsClient = new WebSocketClient();
