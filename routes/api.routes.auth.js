import express from 'express';

import upload from '../middleware/multer.js';

import {
    refreshAccessToken,
    generateOtpAndSendEmailController,
    verifyOtpController,
    createUser,
    loginUser,
    test
} from '../controller/api.controller.auth.js';

const router = express.Router();


router.route('/refresh-token')
    .post(refreshAccessToken);

router.route('/generate-otp-and-send-email')
    .post(generateOtpAndSendEmailController);

router.route('/verify-otp')
    .post(verifyOtpController);

router.route('/signup')
    .post(createUser);

router.route('/login')
    .post(loginUser);

router.route('/test')
    .post(upload.single('avatar'), test);


export default router;