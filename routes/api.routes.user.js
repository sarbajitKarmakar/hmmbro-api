import express from 'express';
import { createUser, getUser, specificUpdateUser } from '../controller/api.controller.user.js';
import { deactivateAcc } from '../controller/api.controller.common.js';
import authenticateUser from '../middleware/authenticateUser.js'


const router = express.Router();

router.route('/')
    .post(createUser)

    .get( getUser)

    .patch(authenticateUser, specificUpdateUser)



router.route('/:id')
    .delete(authenticateUser, deactivateAcc)






export default router;