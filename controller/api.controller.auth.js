import {
    verifyRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    generateOtpService,
    verifyOtpService
} from '../services/auth.service.js';

// import { 
//     uploadImage,
//     deleteImage,
// } from '../services/cloudenary.sevice.js'

import {
    hashPassword,
    verifyPassword
} from '../utils/hashPass.js';


import {
    findUserByUserIdQuery,
    insertNewUserQuery,
    findUserByEmailQuery
} from '../model/db.js';




// helper: hash OTP (must match generate controller)
const generateOtpAndSendEmailController = async (req, res) => {


    try {
        const { user_id, email, otp_type } = req.body;

        if (!email || !otp_type || !user_id) {
            return res.status(400).json({
                message: "email, otp_type and user_id are required"
            });
        }

        const trimmedEmail = email.trim().toLowerCase();
        const otp_type_lower = otp_type.trim().toLowerCase();

        // console.log(otp, trimmedEmail, user_id, otpHash, otp_type_lower, expiresAt)
        await generateOtpService(trimmedEmail, user_id, otp_type_lower)

        return res.status(200).json({
            message: "OTP sent successfully",
            expires_in_seconds: 300
        });

    } catch (error) {
        if (error.message === "User not found") {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (error.message === "Failed to send OTP email") {
            return res.status(500).json({
                message: "Failed to send OTP email"
            });
        }
        if (error.message === "OTP generation limit exceeded") {
            return res.status(429).json({
                message: "OTP generation limit exceeded. Please try again later."
            });
        }

        return res.status(500).json({
            message: "Failed to generate OTP" + error
        });
    }
}

const verifyOtpController = async (req, res) => {
    //   

    try {
        const { contact, otp, otp_type } = req.body;

        if (!contact || !otp || !otp_type) {
            return res.status(400).json({
                message: "contact, otp and otp_type are required"
            });
        }



        await verifyOtpService(contact, otp_type, otp);

        return res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {
        // 
        // console.error(error);
        if (error.message === "Invalid or expired OTP") {
            return res.status(400).json({
                message: "Invalid or expired OTP"
            });
        }
        return res.status(500).json({
            message: "OTP verification failed"
        });
    }
};


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
    // console.log(req.body);
    const { username, email, password, phone } = req.body;
    const imageUrl = null;
    const publicId = null;
    let active = false;

    if (req.user) {
        if (req.user.role === 'admin') {
            active = true;
        }
    }

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone?.trim();

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
        return res.status(500).json("Error hashing password");
    }
    try {
        const data = await insertNewUserQuery(username, trimmedEmail, hashedPassword, trimmedPhone, imageUrl, publicId, active);

        if (!req.user) {

            generateOtpService(trimmedEmail, data.id, "email");
            return res.status(201).json({ message: `OTP sent to ${trimmedEmail}`, data });
        }

        return res.status(201).json({ message: "User created successfully", data });
    } catch (error) {
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

const test = (req, res) => {
    console.log(req.file, req.body)
    res.json({ message: "API is working!" });
}

export {
    refreshAccessToken,
    generateOtpAndSendEmailController,
    verifyOtpController,
    createUser,
    loginUser,
    test
}