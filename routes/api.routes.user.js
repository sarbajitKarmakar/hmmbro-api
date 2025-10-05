import express from 'express';
import { createUser,getUser,getAllUser } from '../controller/api.controller.user.js';


const router = express.Router();

router.route('/')
    .get( getUser )

    .post( createUser )

    .put((req, res) => {
        console.log(res.body);
    })

    .patch((req, res) => {
        console.log(res.body);
    })

    .delete((req, res) => {
        console.log(res.body);
    })

    // getting all user details
router.route('all')
    .get(getAllUser)

    export default router;