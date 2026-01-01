import express from 'express';
import { createUser, loginUser, specificUpdateUser } from '../controller/api.controller.user.js';
import { deactivateAcc } from '../controller/api.controller.common.js';
import authenticateUser from '../middleware/authenticateUser.js'


const router = express.Router();

router.route('/signup')
    .post(createUser)

router.route('/update/:id')    
    .patch(authenticateUser, specificUpdateUser)
    
router.route('/login')
    .post(loginUser)


router.route('/:id')
    .delete(authenticateUser, deactivateAcc)


export default router;