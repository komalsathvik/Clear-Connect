const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const PORT = process.env.PORT;
const url = process.env.MONGO_URL;
const cors = require("cors");
const authRoute = require("./routes/authRoute");
const path = require("path");
const passport = require("passport");
require("../config/Passport");

const server = http.createServer(app);
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:9000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(passport.initialize());
app.use("/", authRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const io = new Server(server, {
  origin: "*",
});
io.on("connection", (socket) => {
  socket.on("join-room", ({ username, meetingid }) => {
    socket.join(meetingid);
    socket.data.username = username;
    const usersInRoom = Array.from(
      io.sockets.adapter.rooms.get(meetingid) || []
    );
    const usersData = usersInRoom
      .filter((id) => id !== socket.id)
      .map((id) => ({
        userId: id,
        username: io.sockets.sockets.get(id)?.data?.username || "user",
      }));
    socket.emit("all-users", usersData);
    socket.to(meetingid).emit("user-joined", {
      userId: socket.id,
      username,
    });

    socket.on("signal", ({ to, from, signal }) => {
      io.to(to).emit("signal", { from, signal });
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-left", { userId: socket.id });
    });
  });
});

async function connectDb() {
  await mongoose
    .connect(url)
    .then(() => {
      console.log("db connected");
    })
    .catch((err) => {
      console.log(err);
    });
}

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDb();
});
