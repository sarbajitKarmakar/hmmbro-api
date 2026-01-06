import express from 'express';
import { 
    refreshAccessToken,
    createUser,
    loginUser
 } from '../controller/api.controller.auth.js';

const router = express.Router();

router.route('/refresh-token')
.post(refreshAccessToken);

router.route('/signup')
    .post(createUser);

router.route('/login')
    .post(loginUser);



export default router;