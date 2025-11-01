import express from 'express';
import { createUser, getUser, getAllUser, specificUpdateUser, deactivateAcc } from '../controller/api.controller.user.js';
import authenticateUser from '../middleware/authenticateUser.js'
import checkAdmin from '../middleware/checkAdmin.js';


const router = express.Router();

router.route('/')
    .post(createUser)

    .get( getUser)

    .patch(authenticateUser, specificUpdateUser)



router.route('/:id')
    .delete(authenticateUser, deactivateAcc)



// getting all user details(admin)
router.route('/all')
    .get(authenticateUser, checkAdmin, getAllUser)


export default router;