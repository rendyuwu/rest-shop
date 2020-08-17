const express = require('express');
const app = express();
const morgan = require('morgan');

const productRouter = require('./api/routes/products');
const orderRouter = require('./api/routes/orders');

app.use(morgan('dev'));

// Routes wich should handle request
app.use('/products', productRouter);
app.use('/orders', orderRouter);

app.use((req, res, next) => {
    const error = new Error('Not found!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500)
        .json({
            error: {
                message: error.message
            }
        });
});

module.exports = app;