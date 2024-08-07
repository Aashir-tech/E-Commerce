const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const fileUpload = require("express-fileupload")
// const cors = require('cors')

// app.use(cors())

const errorMiddleware = require("./middleware/error");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended : true}))
app.use(fileUpload())

// Route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute")
const order = require("./routes/orderRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

// Handling Unhandled Routes
app.all("*", (req, res, next) => {
    res.status(404).json({
        status : 'fail',
        message : `Can't find ${req.originalUrl} on this server !`
    })
});

// MiddleWare for errors

app.use(errorMiddleware);

module.exports = app;
