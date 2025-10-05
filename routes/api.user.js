import express from 'express';
import { createUser } from '../controller/app.users.js';


const router = express.Router();

router.route('/')
    .get(async (req, res) => {
    })

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



    export default router;