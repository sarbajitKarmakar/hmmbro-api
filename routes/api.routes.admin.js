import express from 'express';

import { 
    getAllUser,
    getSpecificUser, 
    deleteUser,
} from '../controller/api.controller.adminUser.js';

import {
    deactivateAcc,
    activateAcc,
} from '../controller/api.controller.common.js';



const router = express.Router();

// getting all user by admin 
router.route('/all')
    .get(getAllUser)

    // get specific user details by admin
router.route('/:id')
    .get(getSpecificUser)
    .delete(deleteUser);

router.route('/:id/deactivate')
    .put(deactivateAcc);
    
router.route('/:id/activate')
    .put(activateAcc);



export default router;