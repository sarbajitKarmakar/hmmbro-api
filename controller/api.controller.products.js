import {
    getAllProductsAdminQuery,
    getSpecificProductAdminQuery,
    getSpecificProductVariantAdminQuery,
    updateProductQuery,
    updateProductVariantsQuery,
    deleteProductVariantQuery,
    recoverProductVariantQuery,
    parmanentDeletedProductQuery,
    publishProductQuery,
    unPublishProductQuery,
    searchProductQuery,
} from "../model/db.js";

import {
    createProductService,
    deleteProductService,
    recoverProductService
} from "../services/product.service.js"

const getProducts = async (req, res) => {


    const limit = Number(req.query.limit) || 30;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;

    try {
        const products = await getAllProductsAdminQuery(limit, offset)
        // console.log(products)
        const pageCount = Math.ceil(Number(products.total_count) / limit)
        console.log(pageCount)
        res.status(200).json({
            page,
            pageCount,
            data: products.res,
        });
        // res.send('Get all products - to be implemented');
    } catch (error) {
        console.log(`Error occured to get all Products :- ${error}`);
        res.status(500).json({ error: 'Failed to retrieve products' });
    }

};

const getSpecificProduct = async (req, res) => {
    const id = req.params.id;

    try {
        const product = await getSpecificProductAdminQuery(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        return res.status(200).json(product);

    } catch (error) {
        // console.log(`Error occured to get specific Product :- ${error}`);

        return res.status(500).json({ message: 'Failed to retrieve product' });
    }

}

const getSpecificProductVariant = async (req, res) => {
    const id = req.params.id;

    try {
        const product = await getSpecificProductVariantAdminQuery(id);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        return res.status(200).json(product);

    } catch (error) {
        // console.log(`Error occured to get specific Product :- ${error}`);

        return res.status(500).json({ error: 'Failed to retrieve product' });
    }
}

const insertNewProduct = async (req, res) => {
    // res.json({status:"ok"});
    // console.log(req.body);
    if (!req.body.productName && !req.body.productId) return res.status(400).json({ error: "Please provide productName or productId" })
    try {
        await createProductService(req.body);

        res.status(201).json({ message: "Product Created" });
    } catch (error) {
        // console.log(`Error occured to insert new Product :- ${error.code}`);

        if (error.constraint === "unique_sku") {
            return res.status(409).json({
                message: "SKU already exists. Please use a Unique SKU."
            });
        }

        if (error.constraint === "product_variants_active_unique_idx") {
            return res.status(409).json({
                message: "The variant of this product is already exist"
            })
        }

        if (error.constraint === "product_variants_product_id_fkey") {
            return res.status(409).json({
                message: "The Product Doesn't Exist"
            })
        }
        if (error.constraint === "products_product_id_key") {
            return res.status(409).json({
                message: "Product ID already exists. Please use a Unique Product ID."
            })
        }
        if(error.constraint === "unique_active_product_name"){
            return res.status(409).json({
                message: "Product already exists."
            })
        }

        if(error.message === "To publish a product, all fields must be completed with minimum single image."){
            return res.status(422).json({
                message: error.message
            })
        }

        res.status(500).json({ error: 'Failed to create product: ' + error });
    }
};

const updateProduct = async (req, res) => {

    const PRODUCT_UPDATABLE_FEILDS = [
        'name',
        'type',
    ];

    const id = req.params.id;
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: "Please provide fields to update" })
    }
    if (req.body.id) {
        return res.status(400).json({ message: "Cannot update product id" })
    }
    const field = Object.keys(req.body).filter(key => PRODUCT_UPDATABLE_FEILDS.includes(key));

    const setClauses = field.map((key, i) => (
        `${key} = $${i + 1}`
    ));

    setClauses.push(`updated_at = NOW()`);
    // console.log(setClauses)

    if (field.length === 0) {
        return res.status(400).json({ message: "No valid fields to update" })
    }

    const value = field.map(key => req.body[key].trim());

    try {
        const updatedProduct = await updateProductQuery(id, setClauses, value);
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json({ message: "Product Updated Successfully", updatedProduct });
    } catch (error) {
        // console.log(`Error occured in update product section : ${error}`);
        // console.log(error.constraint);
        if (error.constraint === "unique_active_product_name") {
            return res.status(409).json({
                message: "Product already exists."
            });
        }
        return res.status(500).json({ message: "Failed to update product:" + error });
    }

}

const updateProductVariants = async (req, res) => {
    const UPDATABLE_FEILDS = [
        'product_id',
        'variant_id',
        'price',
        'stock',
        'sku',
        'ispublish',
        'img_urls'
    ];
    try {
        const id = req.params.id;
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Please provide fields to update" });
        }
        if (req.body.id) {
            return res.status(400).json({ message: "Cannot update product variant id" });
        }
        const field = Object.keys(req.body).filter(key => UPDATABLE_FEILDS.includes(key));

        if (field.length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }
        const setlause = field.map((key, i) => `${key} = $${i + 1}`);
        const value = field.map(key => req.body[key]);

        const updatedProductVariant = await updateProductVariantsQuery(id, setlause, value);
        if (!updatedProductVariant) return res.status(404).json({ message: "Product Variant not found" });
        return res.status(200).json({ message: "Product Variant Updated Successfully", updatedProductVariant });

    } catch (error) {
        if (error.constraint === "unique_sku") {
            return res.status(409).json({
                message: "SKU already exists. Please use a Unique SKU."
            });
        }

        if (error.constraint === "unique_product_variant_product_id_variant_id") {
            return res.status(409).json({
                message: "The variant of this product is already exist"
            });
        }

        if (error.constraint === "product_variants_product_id_fkey") {
            return res.status(409).json({
                message: "The Product Doesn't Exist"
            });
        }
        res.status(500).json({ message: "Failed to update product variant:" + error });
    }

}

const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await deleteProductService(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        // console.log(`Error occured in delete product section : ${error}`);
        if (error.message === "Product not found or already deleted.") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ message: "Failed to delete product" })
    }
}

const deleteProductVariant = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedProduct = await deleteProductVariantQuery(id)
        if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "deleted Succefully", deletedProduct })
    } catch (error) {
        console.log(`Error occured in delete product section : ${error}`);
        return res.status(500).json({ message: "Failed to delete product" })
    }
};

const recoverProductVariant = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedProduct = await recoverProductVariantQuery(id)
        if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "deleted Succefully", deletedProduct })
    } catch (error) {
        console.log(`Error occured in delete product section : ${error}`);
        return res.status(500).json({ message: "Failed to delete product" })
    }
};

const recoverProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await recoverProductService(id);
        
        res.status(200).json({ message: "Recovered Succefully"})
    } catch (error) {
        // console.log(`Error occured in delete product section : ${error}`);
        if (error.message === "Product not found or already recovered."){
            return res.status(404).json({message : error.message})
        }
        return res.status(500).json({ message: "Failed to Recover product" })
    }
};

const parmanentDeleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const parmanentDeletedProduct = await parmanentDeletedProductQuery(id)
        if (!parmanentDeletedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "deleted Succefully", parmanentDeletedProduct })
    } catch (error) {
        console.log(`Error occured in parmanenet delete product section : ${error}`);
        return res.status(500).json({ message: "Failed to parmanent delete product" })
    }
}

const publishProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const publishedProduct = await publishProductQuery(id)
        if (!publishedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product Published Succesfully", publishedProduct })
    } catch (error) {
        console.log(`Error occured in publish product section : ${error}`);
        return res.status(500).json({ message: "Failed to publish product" })
    }
}

const unPublishProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const unPublishedProduct = await unPublishProductQuery(id)
        if (!unPublishedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product unpublished Succesfully", unPublishedProduct })
    } catch (error) {
        console.log(`Error occured in unpublish product section : ${error}`);
        return res.status(500).json({ message: "Failed to unpublish product" })
    }
}

const searchProduct = async (req, res) => {
    if (!req.query.value) return res.status(400).json({ message: "Please Sent any value in query to search" })
    const value = req.query.value
        .toString()
        .trim()// remove all unicode leading spaces
        .replace(/^["']|["']$/g, ""); //removing unwanted ""

    const limit = req.query.limit || 30;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;
    // console.log(`${value}`);

    try {
        const searchedVaule = await searchProductQuery(value, limit, offset);
        const pageCount = Math.ceil(searchedVaule[0].total_count / limit);
        res.status(200).json({ pageCount, searchedVaule });
    } catch (error) {
        console.log(`Error occure in searchProduct :- ${error}`);
        return res.status(500).json("Error in search Product")
    }
}

const getVariants = async (req, res) => {
    try {
        const variants = await getAllVariantsQuery();
        res.status(200).json(variants);
    } catch (error) {
        console.log(`Error occured to get all Variants :- ${error}`);
        res.status(500).json({ error: 'Failed to retrieve variants' });
    }
}

const createVariant = async (req, res) => {
    if (!req.body.variantName) return res.status(400).json({ error: "Please provide variantName" })
    try {
        await createVariant(req.body);
        res.status(201).json({ message: "Variant Created" });
    }catch (error) {
        console.log(`Error occured to insert new Variant :- ${error.code}`);
        res.status(500).json({ error: 'Failed to create variant: ' + error });
    }
}

export {
    getProducts,
    getSpecificProduct,
    getSpecificProductVariant,
    insertNewProduct,
    updateProduct,
    updateProductVariants,
    deleteProduct,
    deleteProductVariant,
    recoverProduct,
    recoverProductVariant,
    parmanentDeleteProduct,
    publishProduct,
    unPublishProduct,
    searchProduct,
    getVariants,
    createVariant
}