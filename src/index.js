import express from "express";
import { securityMiddleware } from "./arcjet.js";
import { matchesRouter } from "./routes/matches.js";

const app = express();

const port = 8080;

app.use(express.json());

app.use(securityMiddleware());

app.use("/matches", matchesRouter);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
