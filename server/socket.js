import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "./models/messages.model.js";
import Channel from "./models/channel.model.js";

// Parse a raw cookie header string into a key-value object
const parseCookies = (cookieHeader) => {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(";").forEach((part) => {
        const [name, ...rest] = part.split("=");
        if (name) cookies[name.trim()] = rest.join("=").trim();
    });
    return cookies;
};

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    // Verify JWT on every socket connection — rejects unauthenticated clients
    io.use((socket, next) => {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        const token = cookies.jwt;
        if (!token) {
            return next(new Error("Authentication error: no token"));
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_KEY);
            socket.userId = payload.userId;
            next();
        } catch (err) {
            return next(new Error("Authentication error: invalid token"));
        }
    });

    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`);
        for(const [userId, socketId] of userSocketMap.entries()){
            if(socketId === socket.id) {
                userSocketMap.delete(userId);
                break;
            }
        }
    };

    // authenticatedUserId is the server-verified identity — never trust payload.sender
    const sendMessage = async (data, authenticatedUserId) => {
        try {
            if (data.messageType === "text" && (!data.content || !data.content.trim())) {
                return;
            }

            const senderSocketId = userSocketMap.get(authenticatedUserId);
            const recipientSocketId = userSocketMap.get(data.recipient);

            const createdMessage = await Message.create({
                ...data,
                sender: authenticatedUserId, // enforce server-side identity
            });

            const messageData = await Message.findById(createdMessage._id)
                .populate("sender", "id email firstName lastName image color")
                .populate("recipient", "id email firstName lastName image color");

            if (recipientSocketId) {
                io.to(recipientSocketId).emit("receiveMessage", messageData);
            }
            if (senderSocketId) {
                io.to(senderSocketId).emit("receiveMessage", messageData);
            }
        } catch (error) {
            console.log("Error in sendMessage", error.message);
        }
    };

    const sendChannelMessage = async (data, authenticatedUserId) => {
        try {
            const { channelId, content, messageType, fileUrl } = data;

            if (messageType === "text" && (!content || !content.trim())) {
                return;
            }

            const createdMessage = await Message.create({
                sender: authenticatedUserId, // enforce server-side identity
                recipient: null,
                content,
                messageType,
                timestamp: new Date(),
                fileUrl,
            });

            const messageData = await Message.findById(createdMessage._id)
                .populate("sender", "id email firstName lastName image color")
                .exec();

            await Channel.findByIdAndUpdate(channelId, {
                $push: { messages: createdMessage._id },
            });

            const channel = await Channel.findById(channelId).populate("members");

            const finalData = { ...messageData._doc, channelId: channel._id };

            if (channel && channel.members) {
                const memberIds = new Set(channel.members.map((m) => m._id.toString()));
                // Include admin in the notification set (deduplicated)
                memberIds.add(channel.admin.toString());

                memberIds.forEach((userId) => {
                    const socketId = userSocketMap.get(userId);
                    if (socketId) {
                        io.to(socketId).emit("receive-channel-message", finalData);
                    }
                });
            }
        } catch (error) {
            console.log("Error in sendChannelMessage", error.message);
        }
    };

    io.on("connection", (socket) => {
        // socket.userId is set by the JWT middleware above — guaranteed to be valid
        const userId = socket.userId;
        userSocketMap.set(userId, socket.id);
        console.log(`User connected: ${userId} with socket ID: ${socket.id}`);

        socket.on("sendMessage", (message) => sendMessage(message, userId));
        socket.on("send-channel-message", (message) => sendChannelMessage(message, userId));
        socket.on("disconnect", () => disconnect(socket));
    });
};

export default setupSocket;