import pool, 
{ 
    insertNewProductQuery ,
    insertNewProductVariant
} from '../model/db.js';


const createProduct = async (body) => {
    const { 
        type ,
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
            const payload = [productId, variant_id, price, stock, sku, ispublish, img_urls];
            if(ispublish && img_urls.length > 0 && payload.includes(undefined)){
                //stop publishing if any field is missing
                throw new Error("To publish a product, all fields including img_urls must be provided.");
            } 
            await insertNewProductVariant(client, payload);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.log("error")
        throw error;
    } finally {
        client.release();
    }
}

export {
    createProduct,
}