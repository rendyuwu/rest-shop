const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/order');
const Product = require("../models/product");

// import einvorement
dotenv.config();

exports.get_all_order = (req, res, next) => {
    Order.find()
        .select('product quantity _id')
        .populate('product', 'name')
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                orders: docs.map(doc => {
                    return {
                        _id: doc._id,
                        product: doc.product,
                        quantity: doc.quantity,
                        request: {
                            type: 'GET',
                            url: `${process.env.HOSTNAME}/orders/${doc._id}`
                        }
                    }
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

exports.create_order = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }
            const order = new Order({
                _id: new mongoose.Types.ObjectId(),
                product: req.body.productId,
                quantity: req.body.quantity
            });
            return order.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'Order stored!',
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity
                },
                request: {
                    type: 'GET',
                    url: `${process.env.HOSTNAME}/orders/${result._id}`
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.get_order = (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('_id product quantity')
        .populate('product', 'name price')
        .then(order => {
            if (!order) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }
            res.status(200).json({
                order: {
                    _id: order._id,
                    product: order.product,
                    quantity: order.quantity
                },
                request: {
                    type: 'GET',
                    url: `${process.env.HOSTNAME}/orders`
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        })
}

exports.delete_order = (req, res, next) => {
    Order.deleteOne({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order deleted!",
                request: {
                    type: "POST",
                    url: `${process.env.HOSTNAME}/orders`,
                    body: {
                        productId: 'ID',
                        quantity: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        }
        )
}