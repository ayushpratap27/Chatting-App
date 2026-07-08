import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js"
import { getMessages, uploadFile } from "../controllers/messages.controller.js";
import multer from "multer";

const messagesRoutes = Router();

const uploadMessageFile = multer({
    dest: "uploads/files",
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

messagesRoutes.post("/get-messages", verifyToken, getMessages);
messagesRoutes.post("/upload-file", verifyToken, uploadMessageFile.single("file"), uploadFile);

export default messagesRoutes;