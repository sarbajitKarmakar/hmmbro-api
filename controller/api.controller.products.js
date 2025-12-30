import {
    getAllProductsQuery,
    getProductQuery,
    insertNewProductQuery,
    updateProductQuery,
    deleteProductQuery,
    parmanentDeletedProductQuery,
    publishProductQuery,
    unPublishProductQuery,
    searchProductQuery,
} from "../model/db.js";

const getProducts = async (req, res) => {
    if (req.query.id) {
        const id = req.query.id;
        console.log(id);

        try {
            const product = await getProductQuery(id);
            if (!product) return res.status(404).json({ error: 'Product not found' });

            return res.status(200).json(product);

        } catch (error) {
            console.log(`Error occured to get specific Product :- ${error}`);

            return res.status(500).json({ error: 'Failed to retrieve product' });
        }
    }

    const limit = req.query.limit || 30;
    const page = req.query.page || 1;
    const offset = (page - 1) * limit;

    try {
        const products = await getAllProductsQuery(limit, offset)
        const pageCount = Math.ceil(products[0].total_count / limit)
        res.status(200).json({
            page,
            pageCount,
            data: products,
        });
        // res.send('Get all products - to be implemented');
    } catch (error) {
        console.log(`Error occured to get all Products :- ${error}`);
        res.status(500).json({ error: 'Failed to retrieve products' });
    }

};

const insertNewProduct = async (req, res) => {
    // res.json({status:"ok"});
    try {
        const { name, price, prod_img, status, isdelete, stock, variant_id } = req.body;
        const data = await insertNewProductQuery({ name, price, prod_img, status, isdelete, stock, variant_id });
        res.status(201).json({ message: "Product Created", data });
    } catch (error) {
        console.log(`Error occured to insert new Product :- ${error}`);
        res.status(500).json({ error: 'Failed to create product: ' + error });
    }
};

const updateProduct = async (req, res) => {
    let feild = [];
    let value = [];
    let index = 1;
    const id = req.params.id;
    for (const key in req.body) {
        if (key === 'id') continue;
        feild.push(`${key}=$${index}`)
        value.push(req.body[key]);
        index++
    }
    try {
        const updatedProduct = await updateProductQuery(id, feild, value);
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
        return res.status(200).json({ message: "Product Updated Successfully", updatedProduct });
    } catch (error) {
        console.log(`Error occured in update product section : ${error}`);
        return res.status(500).json({ message: "Failed to update product" })
    }

}

const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedProduct = await deleteProductQuery(id)
        if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "deleted Succefully", deletedProduct })
    } catch (error) {
        console.log(`Error occured in delete product section : ${error}`);
        return res.status(500).json({ message: "Failed to delete product" })
    }
}

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
        res.status(200).json({pageCount,searchedVaule});
    } catch (error) {
        console.log(`Error occure in searchProduct :- ${error}`);
        return res.status(500).json("Error in search Product")
    }
}

export {
    getProducts,
    insertNewProduct,
    updateProduct,
    deleteProduct,
    parmanentDeleteProduct,
    publishProduct,
    unPublishProduct,
    searchProduct
}