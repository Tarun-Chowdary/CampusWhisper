import { io } from "socket.io-client";

const socket = io("https://campuswhisper.onrender.com");

export default socket;
