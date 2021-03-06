const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require('dotenv');

// import einvorement
dotenv.config();

const productRouters = require("./api/routes/products");
const orderRouters = require("./api/routes/orders");
const userRouters = require("./api/routes/user");

mongoose.connect(
  `mongodb+srv://node-shop:${process.env.MONGO_ATLAS_PW}@node-rest-shop.gkcna.mongodb.net/${process.env.MONGO_ATLAS_DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

app.use(morgan("dev"));
app.use('/uploads', express.static('uploads/'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// allow CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Method", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Routes wich should handle request
app.use("/products", productRouters);
app.use("/orders", orderRouters);
app.use("/user", userRouters);

app.use((req, res, next) => {
  const error = new Error("Not found!");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
