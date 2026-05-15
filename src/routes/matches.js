import { desc } from "drizzle-orm";
import { Router } from "express";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../utils/match-status.js";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";

export const matchesRouter = Router();

const MAX_LIMIT = 100;

matchesRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      details: parsed.error.issues,
      error: "Invalid query",
    });
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);

    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to list matches",
    });
  }
});

matchesRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      details: parsed.error.issues,
      error: "Invalid payload",
    });
  }
  const {
    data: { startTime, endTime, homeScore, awayScore },
  } = parsed;

  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime),
      })
      .returning();

    if (typeof res.app.locals.broadcastMatchCreate === "function") {
      try {
        res.app.locals.broadcastMatchCreate(event);
      } catch (error) {
        console.error("Failed to broadcast match_created", error);
      }
    }
    res.status(201).json({ data: event });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to create match",
    });
  }
});
