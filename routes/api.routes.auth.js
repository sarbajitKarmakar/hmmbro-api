import express from 'express';

import upload from '../middleware/multer.js';

import { 
    refreshAccessToken,
    createUser,
    loginUser,
    test
 } from '../controller/api.controller.auth.js';

const router = express.Router();


router.route('/refresh-token')
.post(refreshAccessToken);

router.route('/signup')
    .post(upload.single('avatar'),createUser);

router.route('/login')
    .post(loginUser);

router.route('/test')
    .post(upload.single('avatar'), test);


export default router;