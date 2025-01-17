import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js"
import { getMessages } from "../controllers/messages.controller.js";

const messagesRoutes = Router();

messagesRoutes.post("/get-messages", verifyToken, getMessages);

export default messagesRoutes;