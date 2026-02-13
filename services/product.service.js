import pool,
{
    getSpecificProductByNameQuery,
    insertNewProductQuery,
    insertNewProductVariant,
    deleteProductQuery,
    deleteProductVariantOnProductDeleteQuery,
    recoverProductQuery,
    recoverProductVariantOnProductDeleteQuery,
    getVariantDetails,
    productImageUploadQuery,
    updateProductVariantsQuery,
    deleteImageQuery,
} from '../model/db.js';

import productCodeGen from '../utils/productCodeGen.js';
import { deleteLocalFile } from '../utils/file.js'

import { 
    uploadImage,
    deleteImage,
 } from './cloudenary.sevice.js'

 import {
    UPDATABLE_FEILDS
 } from '../constants/product.constants.js'



const createProductService = async (req) => {
    const {
        productName,
        type,
        description,
        variants,
    } = req.body;

    const errHandelData = [];// storing only public id of product images to delete all recent uploaded image if got error
    // decleared variable here for blocked scope
    const client = await pool.connect();
    let productId, productDetails; // to hold product id and details
    const jsonFormattedVariants = variants;
    try {
        await client.query('BEGIN');
        
        const trimmedName = productName.trim();
        
        productDetails = await getSpecificProductByNameQuery(trimmedName);
        
        if (productDetails) { // if product exists, use existing product id  
            
            productId = productDetails.id;
            
        } else { // else create new product
            const productCode = productCodeGen(trimmedName);
            productDetails = await insertNewProductQuery(client, productName, type, description, productCode);
            productId = productDetails.id;
        }
        
        
        //storing variant_ml in an array to check if they exist in the variant table
        const variant_ml_arr = jsonFormattedVariants.map(variant => variant.varient);
        
        // if(variant_ml_arr) 
        
        //get only the variants that exist in the variant table to avoid foreign key constraint error when inserting into product_variant table
        const variantDetails = await getVariantDetails(client, variant_ml_arr);
        
        //store the variant_ml of the existing variants in a set for easy lookup
        const existingVariantMLs = new Set(variantDetails.map(variant => variant.variant_ml));
        
        //filter the variants to get only the ones that exist in the variant table and are included in the request body
        const applyableVariant = jsonFormattedVariants
        .filter(variant => existingVariantMLs.has(Number(variant.varient)))
        .map(variant => {
            variant.variant_id = variantDetails.find(v => v.variant_ml === variant.variant_ml)?.id
            return variant;
        });
        
        if (applyableVariant.length === 0) {
            throw new Error("None of the provided variants exist in the database.");
        }
        
        const payload = applyableVariant.map(variant => { // create payload for each variant to be inserted into product_variant table
            const sku = `${productDetails.product_code}-${variant.variant_ml}`;
            const slug = `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${variant.variant_ml}ml`;
            return [
                productId,
                variant.variant_id, 
                variant.price,
                variant.stock, 
                sku, 
                slug,
                //  variant.description, 
                variant.seoTitle, 
                variant.seoDescription,
                variant.seoTags
            ];
        })
        
       
        const insertedId = await insertNewProductVariant(client, payload);
        
        if (req.files > 0) {
            const imgpayload = []; // making image payload
            const queryText = []; // query text ($1,$2)
            const prodVariants = []

            let productVariantId, i = 0 , defaultPrimaryImg = false;
            for (const file of req.files) {
                const fieldKey = file.fieldname.split("][")[0] + "]";
                productVariantId = insertedId[Number(fieldKey.match(/variants\[(\d+)\]/)[1])]["id"]; //getting variant id
                if (!prodVariants.includes(fieldKey)){ // to set default primary image of every 1st image of every variant
                     prodVariants.push(fieldKey)
                     defaultPrimaryImg = true
                }
                const result = await uploadImage(file.path, 'products');
                errHandelData.push({publicId: result.publicId, path: file.path});
                imgpayload.push(productVariantId, result.url, result.publicId, defaultPrimaryImg);
                queryText.push(`($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`);

                defaultPrimaryImg = false
                i++;
            };
           

            await productImageUploadQuery(client, imgpayload, queryText.join(', '));


        }
        await client.query('COMMIT');
    } catch (error) {
        for (const data of errHandelData){
            await deleteImage(data.publicId);
            await deleteLocalFile(data.path)
        }
            await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

const deleteProductService = async (productId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const deletedProduct = await deleteProductQuery(productId);
        if (!deletedProduct) {
            throw new Error("Product not found or already deleted.");
        }

        const deletedProductjsonFormattedVariants = await deleteProductVariantOnProductDeleteQuery(productId);
        // console.log(deletedProductjsonFormattedVariants);
        // console.log("inside service")
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

}

const recoverProductService = async (productId) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const recoveredProduct = await recoverProductQuery(productId);
        if (!recoveredProduct) {
            throw new Error("Product not found or already recovered.");
        }

        const recoveredProductjsonFormattedVariants = await recoverProductVariantOnProductDeleteQuery(productId);
        // console.log("trouble")
        // console.log(deletedProductjsonFormattedVariants);
        // console.log("inside service")
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

}

export const updateProductService = async (req) =>{
    const client = await pool.connect();
    let productDetails;
    const id = req.params.id;
    try{
        client.query(`BEGIN`)
        const prodVarFeild = Object.keys(req.body).filter(key => UPDATABLE_FEILDS.includes(key));
        const trimmedName = req.body.productName?.trim();
        if(trimmedName) productDetails = await getSpecificProductByNameQuery(trimmedName);
        let newProductDetail;
        if (trimmedName && !productDetails) { // if product exists, use existing product id  
            
            const productCode = productCodeGen(trimmedName);
            newProductDetail = await insertNewProductQuery(client, trimmedName, req.body.type, productCode);
        } 
        
        if (prodVarFeild.length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }
        const setClause = prodVarFeild.map((key, i) => `${key} = $${i + 1}`); //set the query
        const prodVarValue = prodVarFeild.map(key => req.body[key]);
        if(newProductDetail) setClause.push(`product_id= ${newProductDetail.id}`)
            setClause.push(`updated_at = NOW()`);  // to store last update time

        const updatedProductVariant = await updateProductVariantsQuery(id, setClause, prodVarValue);
        if (!updatedProductVariant) return res.status(404).json({ message: "Product Variant not found" });
        
        const imageDetails = JSON.parse(req.body.imageDetails);
        
        let deletedImageDetails;
        if(imageDetails){
            if(imageDetails.deleted_image_ids.length > 0) 
                deletedImageDetails = await deleteImageQuery(client , imageDetails.deleted_image_ids, id );
            
            if(imageDetails.primary_image_type === 'existing' && imageDetails.primary_existing_id){
                 //push isprimary in schema
            }

            for(const imgDetials of deletedImageDetails){
                await deleteImage(imgDetials.image_id)
            }
        }

        let defaultPrimaryImg = false;

        if(  req.files){
            if(!defaultPrimaryImg){
                
            }
            const imgPayload = [];
            let i = 0;
            for(const file of req.files){
                const result = await uploadImage(file.path);
                if(imageDetails.primary_image_type === 'new' && Number(imageDetails.primary_new_index) === i){
                    defaultPrimaryImg = true;
                }
                imgPayload.push(id, result.url, result.publicId, defaultPrimaryImg);
                queryText.push(`($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`);
                defaultPrimaryImg = false;
                i++;
            }
        }       
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        }
        finally{
            client.release();
        }
}

export {
    createProductService,
    deleteProductService,
    recoverProductService,
}