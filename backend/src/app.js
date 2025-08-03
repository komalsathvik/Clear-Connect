const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const PORT = 9000;
const url = process.env.MONGO_URL;
const cors = require("cors");
const authRoute = require("./routes/authRoute");
const path = require("path");
const { handleSocket } = require("./controllers/socketController.js");
const passport = require("passport");
require("../config/Passport");

const server = http.createServer(app);
app.use(express.json());
app.use(
  cors({
    origin: ["https://clear-connect.vercel.app","http://localhost:5173", "http://localhost:9000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(passport.initialize());
app.use("/", authRoute);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("server page");
});
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  handleSocket(io, socket);
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
