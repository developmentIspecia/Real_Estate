import { io } from "socket.io-client";
import { GLOBAL_IP } from "../api/api";

const SOCKET_URL = `http://${GLOBAL_IP}:5000`;

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
