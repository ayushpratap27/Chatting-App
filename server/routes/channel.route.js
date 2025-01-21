import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { createChannel, getUserChannels } from "../controllers/channel.controller.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUserChannels);

export default channelRoutes;