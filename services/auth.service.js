import jwt from 'jsonwebtoken';
import pool, {
    findLatestValidQuery,
    markOtpAsVerifiedQuery,
    insertOtpQuery
} from "../model/db.js";

import { sendOtpEmail } from './email.service.js';

import {
    generateRandomOTP,
    hashOTP
}from '../utils/otp.js';


const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || 'your-256-bit-secret';
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || 'your-512-bit-secret';

const generateAccessToken = (user) => {
    // console.log("Generating access token for user:", user);
    const payload = {
        id: user.id,
        role: user.role,
        avatar_id: user.avatar_id
    }

    return jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' });
}

const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
    }

    return jwt.sign(payload, refreshTokenSecret, { expiresIn: '7d' });

}

const verifyAccessToken = (token) => {
    try {
        const verify = jwt.verify(token, accessTokenSecret);
        // console.log(verify);

        return verify;
    } catch (err) {
        // console.log("verification failed . err:- " + err);

        return null;
    }
}

const verifyRefreshToken = (token) => {
    try {
        const verify = jwt.verify(token, refreshTokenSecret);
        // console.log(verify);

        return verify;
    } catch (err) {
        // console.log("verification failed . err:- " + err);

        return null;
    }
}

const generateOtpService = async (email, user_id, otp_type) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const otp = generateRandomOTP();
        const otpHash = hashOTP(otp);

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        // store OTP (append-only)
        // console.log(email   
            
        // )
        const result = await insertOtpQuery(client, user_id, email, otpHash, otp_type, expiresAt);
        // send email
        // console.log(result);
        await sendOtpEmail({ to: email, otp });
        // const subject = "Your HmmBro verification code";
        // const text =
        //   `Your verification code is ${otp}.\n` +
        //   `This code is valid for 5 minutes.\n\n` +
        //   `If you did not request this, you can ignore this email.`;
        // await sendOtpEmail(email, subject, text);

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
        // console.error(error);
    } finally {
        client.release();
    }
}

const verifyOtpService = async (contact, otp_type, otp) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const otpHash = hashOTP(otp);
        // 1️⃣ Find latest valid OTP
        // console.log("Finding latest valid OTP for:", contact, otp_type, otpHash);
        const latestOtpId = await findLatestValidQuery(client, contact, otp_type, otpHash);
        // console.log(latestOtpId);

        if (!latestOtpId) {
            await client.query("ROLLBACK");
            throw new Error("Invalid or expired OTP");

        }

        const otpId = latestOtpId.id;
        const userId = latestOtpId.user_id;

        // 2️⃣ Mark OTP as verified (single-use)
        markOtpAsVerifiedQuery(client, otpId, userId);


        await client.query("COMMIT");


    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
}

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateOtpService,
    verifyOtpService
};