import pool,
{
    getSpecificProductByNameQuery,
    insertNewProductQuery,
    insertNewProductVariant,
    deleteProductQuery,
    deleteProductVariantOnProductDeleteQuery,
    recoverProductQuery,
    recoverProductVariantOnProductDeleteQuery,
} from '../model/db.js';

import productCodeGen from '../utils/productCodeGen.js';



const createProductService = async (body) => {
    const {
        name,
        type,
        variant,
        price,
        stock = 0,
        ispublish = false,
        // img_urls
    } = body;

    /*
    name: string,
    type: string,
    variant:{
        variant_id: 2,
        variant_ml: 30,
    } ,
    */

    const client = await pool.connect()
    let productId, productDetails; // to hold product id and details

    try {
        await client.query('BEGIN');
        // console.log("inside service")
        
            const trimmedName = name.trim();
            // console.log("inside product name")
            productDetails = await getSpecificProductByNameQuery(trimmedName);

            if(productDetails){ // if product exists, use existing product id  

                productId = productDetails.id;

            }else{ // else create new product
                const productCode = productCodeGen(trimmedName);
                productDetails = await insertNewProductQuery(client, name, type, productCode);
                productId = productDetails.id;
            }

            const sku = `${productDetails.product_code}-${variant.variant_ml}`;
            const slug = `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${variant.variant_ml}ml`;
            const payload = [productId, variant.variant_id, price, stock, sku, img_urls, slug];
            // console.log(payload.includes(undefined))
            const img = img_urls?.length || 0;
            if (ispublish && (Number(img) === 0 || payload.includes(undefined))) {
                // console.log("aaaaaa")
                //stop publishing if any field is missing

                throw new Error("To publish a product, all fields must be completed with minimum single image.");
            }

            await insertNewProductVariant(client, payload);
        await client.query('COMMIT');
    } catch (error) {
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

        const deletedProductVariants = await deleteProductVariantOnProductDeleteQuery(productId);
        // console.log(deletedProductVariants);
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
        
        const recoveredProductVariants = await recoverProductVariantOnProductDeleteQuery(productId);
        // console.log("trouble")
        // console.log(deletedProductVariants);
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