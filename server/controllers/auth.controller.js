import User from "../models/user.model.js";
import { response } from "express";
import jwt from "jsonwebtoken";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAge });
};

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return response.status(400).send("Email and password are required");    
        }

        const user = await User.create({ email, password });
        res.cookie("jwt", createToken(email, user._id), { 
            maxAge,
            secure: true,
            sameSite: "none",
        });

        return response.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
            },
        });
    } catch (error) {
        console.log({error});
        return response.status(500).send("Internal server error");
    }
}