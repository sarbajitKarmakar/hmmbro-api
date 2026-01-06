import express from 'express';
import { specificUpdateUser } from '../controller/api.controller.user.js';
import { deactivateAcc } from '../controller/api.controller.common.js';
import authenticateUser from '../middleware/authenticateUser.js'


const router = express.Router();


router.route('/update/:id')     //update specific feild of user
    .patch(authenticateUser, specificUpdateUser)
    

router.route('/:id')     //deactivate user account
    .delete(authenticateUser, deactivateAcc)


export default router;