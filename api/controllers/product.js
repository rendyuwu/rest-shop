const mongoose = require("mongoose");
const dotenv = require('dotenv');
const fs = require('fs');
const Product = require("../models/product");

// import einvorement
dotenv.config();

exports.get_all_product = (req, res, next) => {
    Product.find()
        .select("name price _id productImage")
        .exec()
        .then((docs) => {
            res.status(200).json({
                count: docs.length,
                products: docs.map((doc) => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        productImage: doc.productImage,
                        _id: doc._id,
                        request: {
                            type: "GET",
                            url: `${process.env.HOSTNAME}/products/${doc._id}`
                        }
                    };
                })
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: err });
        });
}

exports.create_product = (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then((result) => {
            console.log(result);
            res.status(201).json({
                message: "Created product successfully",
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    productImage: result.productImage,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: `${process.env.HOSTNAME}/products/${result._id}`
                    }
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.get_product = (req, res, next) => {
    id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then((doc) => {
            console.log(doc);
            if (doc) {
                res.status(200).json({
                    product: doc,
                    request: {
                        type: 'GET',
                        url: `${process.env.HOSTNAME}/products/`
                    }
                });
            } else {
                res
                    .status(404)
                    .json({ message: "No valid entry found for provided ID" });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.update_product = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then((result) => {
            console.log(result);
            res.status(200).json({
                message: "Product updated!",
                request: {
                    type: 'GET',
                    url: `${process.env.HOSTNAME}/products/${id}`
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
}

exports.delete_product = (req, res, next) => {
    Product.findOneAndDelete({ _id: req.params.productId })
        .exec()
        .then(result => {
            fs.unlink(result.productImage, err => {
                if (err) throw err;
            })
            res.status(200).json({
                message: "Product deleted!",
                request: {
                    type: "POST",
                    url: `${process.env.HOSTNAME}/products`,
                    body: {
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json(err);
        })
}