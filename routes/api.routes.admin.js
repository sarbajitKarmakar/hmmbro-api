import express from 'express';
import authenticateUser from '../middleware/authenticateUser.js';
import checkAdmin from '../middleware/checkAdmin.js';

import { 
    getAllUser,
    getSpecificUser, 
    deleteUser,
    searchUser,
} from '../controller/api.controller.adminUser.js';

import {
    deactivateAcc,
    activateAcc,
} from '../controller/api.controller.common.js';




const router = express.Router();

// getting all user by admin 
router.route('/all')
    .get(getAllUser)

    router.route('/search')
        .get(authenticateUser, checkAdmin, searchUser); // to be checked 
    // get specific user details by admin
router.route('/:id')
    .get(getSpecificUser)
    .delete(deleteUser);

router.route('/:id/deactivate')
    .put(deactivateAcc);
    
router.route('/:id/activate')
    .put(activateAcc);


export default router;