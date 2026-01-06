import express from "express";

import authenticateUser from "../middleware/authenticateUser.js";
import checkAdmin from "../middleware/checkAdmin.js";

import {
    getProducts,
    insertNewProduct,
    updateProduct,
    deleteProduct,
    parmanentDeleteProduct,
    publishProduct,
    unPublishProduct,
    searchProduct
} from "../controller/api.controller.products.js";



const router = express.Router();


router.route('/')
    .get(authenticateUser, checkAdmin, getProducts)  //get all products and also specific products by sending id in query
    .post(authenticateUser, checkAdmin, insertNewProduct); //insert new product (admin only)

router.route('/search')
    .post(authenticateUser, checkAdmin, searchProduct);

router.route('/:id')
    .patch(authenticateUser, checkAdmin, updateProduct)//edit product (admin only)
    .delete(authenticateUser, checkAdmin, deleteProduct); //temporary delete product (admin only)

router.route('/:id/parmanent')
    .delete(authenticateUser, checkAdmin, parmanentDeleteProduct); //parmanent delete product (admin only)

router.route('/:id/publish')
    .put(authenticateUser, checkAdmin, publishProduct); //  publish product (admin only)


router.route('/:id/unpublish')
    .put(authenticateUser, checkAdmin, unPublishProduct);//uspublish product (admin only)

// router.route('/variant')
//     .get()
//     .post(authenticateUser, checkAdmin,)


export default router;