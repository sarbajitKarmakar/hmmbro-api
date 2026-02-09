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
} from '../model/db.js';

import productCodeGen from '../utils/productCodeGen.js';

import { 
    uploadImage,
    deleteImage,
 } from './cloudenary.sevice.js'



const createProductService = async (req) => {
    const {
        name,
        type,
        variants,
        // img_urls
    } = req.body;

    const publicIds = [];// storing only public id of product images to delete all recent uploaded image if got error
    // decleared variable here for blocked scope

    const client = await pool.connect()
    let productId, productDetails; // to hold product id and details
    const jsonFormattedVariants = JSON.parse(variants)
    try {
        await client.query('BEGIN');

        const trimmedName = name.trim();

        productDetails = await getSpecificProductByNameQuery(trimmedName);

        if (productDetails) { // if product exists, use existing product id  

            productId = productDetails.id;

        } else { // else create new product
            const productCode = productCodeGen(trimmedName);
            productDetails = await insertNewProductQuery(client, name, type, productCode);
            productId = productDetails.id;
        }


        //storing variant_ml in an array to check if they exist in the variant table
        const variant_ml_arr = jsonFormattedVariants.map(variant => variant.variant_ml);

        //get only the variants that exist in the variant table to avoid foreign key constraint error when inserting into product_variant table
        const variantDetails = await getVariantDetails(client, variant_ml_arr);

        //store the variant_ml of the existing variants in a set for easy lookup
        const existingVariantMLs = new Set(variantDetails.map(variant => variant.variant_ml));

        //filter the variants to get only the ones that exist in the variant table and are included in the request body
        const applyableVariant = jsonFormattedVariants
            .filter(variant => existingVariantMLs.has(variant.variant_ml))
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
            return [productId, variant.variant_id, variant.price, variant.stock, sku, slug];
        })

        const insertedId = await insertNewProductVariant(client, payload);

        if (req.files) {
            const imgpayload = []; // making image payload
            const queryText = []; // query text ($1,$2)

            let productVariantId, i = 0;
            for (const file of req.files) {
                const fieldKey = file.fieldname.split("][")[0] + "]";
                productVariantId = insertedId[Number(fieldKey.match(/variants\[(\d+)\]/)[1])]["id"]; //getting variant id 
                const result = await uploadImage(file.path, 'products');
                imgpayload.push(productVariantId, result.url, result.publicId);
                publicIds.push(result.publicId);
                queryText.push(`($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`);
                i++;
            };

            await productImageUploadQuery(client, imgpayload, queryText.join(', '));


        }
        await client.query('COMMIT');
    } catch (error) {
        for (const id of publicIds){
            await deleteImage(id);
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

export {
    createProductService,
    deleteProductService,
    recoverProductService,
}