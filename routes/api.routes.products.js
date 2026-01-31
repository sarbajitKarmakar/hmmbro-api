import express from "express";

import authenticateUser from "../middleware/authenticateUser.js";
import checkAdmin from "../middleware/checkAdmin.js";

import {
    getProducts,
    getProductsVariant,
    getSpecificProduct,
    getSpecificProductVariant,
    insertNewProduct,
    updateProduct,
    updateProductVariants,
    deleteProduct,
    parmanentDeleteProduct,
    deleteProductVariant,
    recoverProduct,
    recoverProductVariant,
    publishProduct,
    unPublishProduct,
    searchProduct,
    getVariants,
    createVariant,
    getDeletedProducts
} from "../controller/api.controller.products.js";



const router = express.Router();


router.route('/')
    .get(authenticateUser, checkAdmin, getProducts)  //get all products 
    .post(authenticateUser, checkAdmin, insertNewProduct); //insert new product (admin only)

router.route('/deleted')
    .get(authenticateUser, checkAdmin, getDeletedProducts);  //get all products including deleted ones

router.route('/product-variant')
    .get(authenticateUser, checkAdmin, getProductsVariant)  //get all products variants

router.route('/variant')
    .get(authenticateUser, checkAdmin, getVariants) //get variant by ml
    .post(authenticateUser, checkAdmin, createVariant); //create new variant
// .put(authenticateUser, checkAdmin, deleteVariant); //create new variant

router.route('/search')
    .post(authenticateUser, checkAdmin, searchProduct);

router.route('/:id')
    .get(authenticateUser, checkAdmin, getSpecificProduct) //get specific product by id (admin only)
    .patch(authenticateUser, checkAdmin, updateProduct)//edit product (admin only)

router.route('/:id/delete')
    .put(authenticateUser, checkAdmin, deleteProduct); //soft delete product (admin only)

router.route(`/:id/recover`)
    .put(authenticateUser, checkAdmin, recoverProduct); //soft delete product (admin only)


router.route('/product-variant/:id')
    .get(authenticateUser, checkAdmin, getSpecificProductVariant) //get specific product by id (admin only)
    .patch(authenticateUser, checkAdmin, updateProductVariants);//edit product variant (admin only)

router.route('/product-variant/:id/delete')
    .put(authenticateUser, checkAdmin, deleteProductVariant); //soft delete product (admin only)

router.route('/product-variant/:id/recover')
    .put(authenticateUser, checkAdmin, recoverProductVariant); //soft delete product (admin only)



router.route('/:id/publish')
    .put(authenticateUser, checkAdmin, publishProduct); //  publish product (admin only)


router.route('/:id/unpublish')
    .put(authenticateUser, checkAdmin, unPublishProduct);//uspublish product (admin only)



// router.route('/:id/parmanent')
//     .delete(authenticateUser, checkAdmin, parmanentDeleteProduct); //parmanent delete product (admin only)
export default router;