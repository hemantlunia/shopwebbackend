import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";



// add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, subCategory, sizes, bestseller } = req.body;
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        // console.log(name, description, price, category, subCategory, sizes, bestseller);
        if (!name || !description || !price || !category || !subCategory || !sizes || !bestseller) {
            return res.json({ success: false, message: "All Details Required" });
        }

        const images = [image1, image2, image3, image4].filter((item) => (item !== undefined));

        let imageUrl = await Promise.all(
            images.map(async (item) => {
                let result = await cloudinary.uploader.upload(item.path, { resource_type: "auto", folder: "shopweb" });
                return result.secure_url
            })
        );

        const productData = {
            name,
            description,
            price: Number(price),
            category,
            subCategory,
            sizes: sizes.split(","),
            bestseller: bestseller === "true" ? true : false,
            image: imageUrl,
            date: Date.now()
        }

        // console.log(productData);
        const product = new productModel(productData);
        await product.save()
        return res.json({ success: true, message: "Product Added Successfully" });

    } catch (error) {
        console.log(error);
        return res.json({ message: error.message })
    }
}


// all-product product
const listProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        if (!products) {
            return res.json({ success: false, message: "Product Not Found" })
        };

        return res.json({ success: true, products });
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Products Fetching Error" })

    }

}
// remove product
const removeProduct = async (req, res) => {
    try {
        // const {id} = req.body;
        // console.log(id);
        // console.log("ok");
        // return res.json({success: true, message: "Product Deleted successfully"});

        await productModel.findOneAndDelete({_id:id});
        // console.log(deleted);

        return res.json({ success: true, message: "Product Deleted successfully" })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Product Id not found" })
    }
}
// single product
const singleProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await productModel.findById(productId)
        return res.json({ success: true, product })
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Product Id not found" })
    }
}

export {
    addProduct,
    listProducts,
    removeProduct,
    singleProduct
}