import express from 'express';

import { 
    getAllUser,
    deleteUser,
    searchUser,
} from '../controller/api.controller.adminUser.js';

import {
    getSpecificUser, 
    deactivateAcc,
    activateAcc,
} from '../controller/api.controller.common.js';




const router = express.Router();

// getting all user by admin 
router.route('/all')
    .get(getAllUser)

router.route('/search')
        .post(searchUser);
    // get specific user details by admin
router.route('/:id')
    .get(getSpecificUser)
    .delete(deleteUser);

router.route('/:id/deactivate')
    .put(deactivateAcc);
    
router.route('/:id/activate')
    .put(activateAcc);


export default router;