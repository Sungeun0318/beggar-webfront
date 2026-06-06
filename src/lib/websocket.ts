import { Client, IFrame, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const SOCKET_URL = `${API_BASE_URL}/ws-stomp`;

export class WebSocketClient {
  private client: Client;
  private connected: boolean = false;

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

  connect(onConnect: (frame: IFrame) => void) {
    this.client.onConnect = (frame) => {
      this.connected = true;
      onConnect(frame);
    };

    this.client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    this.client.activate();
  }

  subscribe(topic: string, callback: (message: IMessage) => void) {
    if (!this.connected) {
      console.warn("Socket not connected. Subscription might fail.");
    }
    return this.client.subscribe(topic, callback);
  }

  disconnect() {
    this.client.deactivate();
    this.connected = false;
  }
}

export const wsClient = new WebSocketClient();
