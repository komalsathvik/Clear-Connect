import { io } from "socket.io-client";

const socket = io(`${URL}`);

export default socket;
