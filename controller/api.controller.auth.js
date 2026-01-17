import { 
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
} from '../services/auth.js';

import { 
    uploadImage,
    deleteImage,
} from '../services/cloudenary.js'

import {
    hashPassword,
    verifyPassword
} from '../utils/hashPass.js';

import { 
    findUserByUserIdQuery,
    insertNewUserQuery,
    findUserByEmailQuery
} from '../model/db.js';




const refreshAccessToken = async (req, res) => {
    const refreshToken = req.body.token;
    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required" });
}

    try {
        const decoded = verifyRefreshToken(refreshToken);
        // console.log("decoded");
        const user = await findUserByUserIdQuery(decoded.id);
        // console.log(user);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.active) return res.status(403).json({ message: "This account is deactivated" });
        const accessToken = generateAccessToken(user);
        return res.json({ accessToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
}

const createUser = async (req, res) => {
    const { username, email, password, phone } = req.body;
    let imageUrl = null, publicId = null;

    if (!email || !password || !username) {
        return res.status(400).json({ message: "Missing fields" });
    }
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone?.trim();
    if (!trimmedEmail || !password || !username) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
        return res.status(500).json("Error hashing password");
    }
    try {
        const result = req.file? await uploadImage(req.file.path, "Avatars") : null;
        imageUrl = result? result.url: null;
        publicId = result? result.publicId: null;
        const data = await insertNewUserQuery(username, trimmedEmail, hashedPassword, trimmedPhone, imageUrl, publicId);
        return res.status(201).json({ message: "User created successfully ", data });
    } catch (error) {
        await deleteImage(publicId)
        if (error.code === "23505") {
            // console.log(error.constraint);
            if (error.constraint === "email") {
                return res.status(409).json({ message: "Email already exists" });
            }
            if (error.constraint === "phone") {
                return res.status(409).json({ message: "Phone no already exists" });
            }
        }
        return res.status(500).json("Error creating user , " + error);
    }
}

const loginUser = async (req, res) => {
    const email = req.body.email.trim().toLowerCase();
    // console.log("not here");
    try {
        const user = await findUserByEmailQuery(email);
        
        if (user) {
            if (!user.active) return res.status(403).json({ message: "This account is deactivated" });
            const isPasswordValid = await verifyPassword(req.body.password, user.password);
            if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            return res.status(200).json({
                message: "Login Successful",
                data: {
                    id: user.id, 
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                    avatar: user.avatar,
                    role: user.role,
                    active: user.active
                },
                token: {
                    accessToken,
                    refreshToken
                }
            });
        } else {
            return res.status(404).json("User not found");
        }

    } catch (error) {
        return res.status(500).json("Error fetching user , " + error);
    }

}

const test = (req, res) =>{
        console.log(req.file, req.body)
        res.json({ message: "API is working!" });
}

export {
    refreshAccessToken,
    createUser,
    loginUser,
    test
}