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
    unPublishProduct
} from "../controller/api.controller.products.js";



const router = express.Router();


router.route('/')
    .get(getProducts)  //get all products and also specific products by sending different query
    .post(authenticateUser, checkAdmin, insertNewProduct); //insert new product (admin only)

router.route('/:id')
.patch(authenticateUser, checkAdmin, updateProduct)
.delete(authenticateUser, checkAdmin, deleteProduct);

router.route('/:id/parmanent')
    .delete(authenticateUser, checkAdmin, parmanentDeleteProduct);

router.route('/:id/publish')
    .put(authenticateUser, checkAdmin, publishProduct);

router.route('/:id/unpublish')
    .put(authenticateUser, checkAdmin, unPublishProduct);


export default router;