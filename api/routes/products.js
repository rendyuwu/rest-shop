const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const dotenv = require('dotenv');

// import einvorement
dotenv.config();

const Product = require("../models/product");

router.get("/", (req, res, next) => {
	Product.find()
		.select("name price _id")
		.exec()
		.then((docs) => {
			res.status(200).json({
				count: docs.length,
				products: docs.map((doc) => {
					return {
						name: doc.name,
						price: doc.price,
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
});

router.post("/", (req, res, next) => {
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price
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
});

router.get("/:productId", (req, res, next) => {
	id = req.params.productId;
	Product.findById(id)
		.select('name price _id')
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
});

router.patch("/:productId", (req, res, next) => {
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
});

router.delete("/:productId", (req, res, next) => {
	Product.deleteOne({ _id: req.params.productId })
		.exec()
		.then((result) => {
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
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

module.exports = router;
