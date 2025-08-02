const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const passport = require("passport");

const authRoute = require("./routes/authRoute");
const { handleSocket } = require("./controllers/socketController.js");
require("../config/Passport");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 9000;
const url = process.env.MONGO_URL;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://clear-connect.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(passport.initialize());

// Routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/", authRoute);

// Serve static frontend build files
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));



// Socket setup
io.on("connection", (socket) => {
  handleSocket(io, socket);
});

// DB connection
async function connectDb() {
  await mongoose
    .connect(url)
    .then(() => {
      console.log("✅ DB connected");
    })
    .catch((err) => {
      console.error("❌ DB connection error:", err);
    });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  connectDb();
});
