const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("Voice server is up!");
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.onAny((event, audioChunk) => {
    if (event.startsWith("send-voice-")) {
      const room = event.replace("send-voice-", "");
      socket.broadcast.emit(`receive-voice-${room}`, audioChunk);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
