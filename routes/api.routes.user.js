import express from 'express';

import { specificUpdateUser } from '../controller/api.controller.user.js';
import {
    getSpecificUser,
    deactivateAcc
} from '../controller/api.controller.common.js';

import upload from '../middleware/multer.js'


const router = express.Router();


  //update specific feild of user

router.route('/profile')
    .get(getSpecificUser)
    .patch(upload.single('avatar'),specificUpdateUser)


router.route('/deactivate')     //deactivate user account
    .patch(deactivateAcc)


export default router;