import { io } from "socket.io-client";
const BackendURL = import.meta.env.VITE_BACKEND_URL;

const socket = io(`${BackendURL}`);

export default socket;
