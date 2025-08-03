import { io } from "socket.io-client";
export const BackendURL = import.meta.env.VITE_API_URL;

const socket = io(`${BackendURL}`);

export default socket;
