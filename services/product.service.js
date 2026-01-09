import pool,
{
    insertNewProductQuery,
    insertNewProductVariant,
    deleteProductQuery,
    deleteProductVariantOnProductDeleteQuery,
    recoverProductQuery,
    recoverProductVariantOnProductDeleteQuery,
} from '../model/db.js';


const createProductService = async (body) => {
    const {
        type,
        productName,
        variant_id,
        price,
        stock = 0,
        sku,
        ispublish = false,
        img_urls
    } = body;

    const client = await pool.connect()
    let productId;

    try {
        await client.query('BEGIN');
        // console.log("inside service")
        if (productName) {
            // console.log("inside product name")
            const result = await insertNewProductQuery(client, productName, type);
            // console.log("Inserted new product with ID:", result.id);
            productId = result.id;

        } else { productId = body.productId }

        if (variant_id) {
            const published_at = ispublish ? 'NOW()' : null;
            const payload = [productId, variant_id, price, stock, sku, published_at, img_urls];
            // console.log(payload.includes(undefined))
            const img = img_urls?.length || 0;
            if (ispublish && (Number(img) === 0 || payload.includes(undefined))) {
                // console.log("aaaaaa")
                //stop publishing if any field is missing

                throw new Error("To publish a product, all fields must be completed with minimum single image.");
            }

            await insertNewProductVariant(client, payload);
        }
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