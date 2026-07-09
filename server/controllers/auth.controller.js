import { compare, hash } from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { renameSync, unlinkSync, existsSync } from "fs";
import path from "path";

const maxAge = 3 * 24 * 60 * 60 * 1000;
const maxAgeSeconds = 3 * 24 * 60 * 60; // JWT expiresIn expects seconds

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    maxAge,
    httpOnly: true,
    secure: isProduction,          // HTTPS only in production; HTTP allowed locally
    sameSite: isProduction ? "none" : "lax", // cross-domain on Vercel; lax for localhost
};

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxAgeSeconds });
};

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and password are required");    
        }

        const user = await User.create({ email, password });

        res.cookie("jwt", createToken(email, user.id), cookieOptions);

        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).send("An account with this email already exists");
        }
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("Email and password are required");    
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("Invalid email or password");
        }
        const auth = await compare(password, user.password);
        if (!auth) {
            return res.status(401).send("Invalid email or password");
        }
        res.cookie("jwt", createToken(email, user.id), cookieOptions);

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            },
        });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};

export const getUserInfo = async (req, res, next) => {
    try {
        const userData = await User.findById(req.userId);
        if(!userData) {
            return res.status(404).send("User with the given id not found.");
        } 

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,

        });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { userId } = req;
        const { firstName, lastName, color } = req.body;
        if(!firstName || !lastName) {
            return res.status(400).send("First name, last name, and color are required");
        }

        const userData = await User.findByIdAndUpdate(
            userId,
            {
                firstName,
                lastName,
                color,
                profileSetup: true,
            },
            { new: true, runValidators: true }
        ); 

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,

        });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};

export const addProfileImage = async (req, res, next) => {
    try {
        if(!req.file) {
            return res.status(400).send("File is required");
        }

        const date = Date.now();
        const safeName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
        let fileName = "uploads/profiles/" + date + "-" + safeName;
        renameSync(req.file.path, fileName);

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { image: fileName },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            image: updatedUser.image,
        });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};


export const removeProfileImage = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).send("User not found");
        }

        if(user.image) {
            if (existsSync(user.image)) {
                unlinkSync(user.image);
            }
        }

        user.image = null;
        await user.save();

        return res.status(200).send("Profile image removed successfully");
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};

export const logout = async (req, res, next) => {
    try {
        res.cookie("jwt", "", { maxAge: 1, httpOnly: true, secure: isProduction, sameSite: isProduction ? "none" : "lax" });
        return res.status(200).send("Logged out successfully");
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
};