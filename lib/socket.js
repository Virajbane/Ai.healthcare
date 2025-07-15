// lib/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Use Render URL in prod

export default socket;
