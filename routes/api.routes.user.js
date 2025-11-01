import express from 'express';
import { createUser, getUser, getAllUser, specificUpdateUser } from '../controller/api.controller.user.js';
import authenticateUser from '../middleware/authenticateUser.js'
import checkAdmin from '../middleware/checkAdmin.js';


const router = express.Router();

router.route('/')
    .post(createUser)

    .get(authenticateUser, getUser)

    .patch(authenticateUser, specificUpdateUser)

    .delete((req, res) => {
        console.log(res.body);  
    })

// getting all user details
router.route('/all')
    .get(authenticateUser, checkAdmin, getAllUser)


export default router;