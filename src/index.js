import "dotenv/config.js";
import express from "express";

import { securityMiddleware } from "./arcjet.js";

import http from "http";
import { matchesRouter } from "./routes/matches.js";
import { attachWebSocketServer } from "./ws/server.js";

const app = express();

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

app.use(express.json());

app.use(securityMiddleware());

app.use("/matches", matchesRouter);

const { broadcastMatchCreate } = attachWebSocketServer(server);

app.locals.broadcastMatchCreate = broadcastMatchCreate;

server.listen(PORT, HOST, () => {
  const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
  const httpUrl = `http://${displayHost}:${PORT}`;
  const wsUrl = `ws://${displayHost}:${PORT}/ws`;
  console.log(`Server is listening on ${httpUrl}`);
  console.log(`WebSocket server is listening on ${wsUrl}`);
});
