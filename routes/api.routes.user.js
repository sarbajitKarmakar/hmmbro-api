import express from 'express';
import { specificUpdateUser } from '../controller/api.controller.user.js';
import {
    getSpecificUser,
    deactivateAcc
} from '../controller/api.controller.common.js';
import authenticateUser from '../middleware/authenticateUser.js'


const router = express.Router();


  //update specific feild of user

router.route('/profile')
    .get(getSpecificUser)
    .patch(specificUpdateUser)


router.route('/deactivate')     //deactivate user account
    .patch(deactivateAcc)


export default router;