import { io } from "socket.io-client";
import { BackendURL } from "../config";

const socket = io(`${BackendURL}`);

export default socket;
