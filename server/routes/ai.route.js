import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { summarize, suggestReplies, enhanceMessage } from "../controllers/ai.controller.js";

const aiRoutes = Router();

aiRoutes.post("/summarize", verifyToken, summarize);
aiRoutes.post("/suggest-replies", verifyToken, suggestReplies);
aiRoutes.post("/enhance-message", verifyToken, enhanceMessage);

export default aiRoutes;
