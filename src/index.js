import "dotenv/config.js";
import express from "express";
import http from "http";
import { matchesRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";

const app = express();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

app.use(express.json());

app.use("/matches", matchesRouter);

const { broadcastMatchCreate } = attachWebSocketServer(server);

app.locals.broadcastMatchCreate = broadcastMatchCreate;

server.listen(PORT, HOST, () => {
  const baseUrl = HOST === "0.0.0.0" ? `http://localhost:${PORT}` : HOST;
  console.log(`Server is listening on PORT ${baseUrl}`);
  console.log(
    `WebSocket server is listening on ${baseUrl.replace("http", "ws")}/ws`,
  );
});
