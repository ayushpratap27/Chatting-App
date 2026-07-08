import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { summarize } from "../controllers/ai.controller.js";

const aiRoutes = Router();

aiRoutes.post("/summarize", verifyToken, summarize);

export default aiRoutes;
