const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors")
const path = require("path");

// Configure environment variables
if(process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "./.env"
  });
}

// app.use(cors({
//   origin : "http://localhost:3000",
//   credentials: true, 
// }));

const allowedOrigins = [
  'https://e-commerce-kuxr.onrender.com',  // Production frontend
  'http://localhost:3000'  // Development frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no 'origin' like server-to-server requests
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials (cookies, authorization headers) to be included
}));

// app.use(cors({
//   origin: 'https://e-commerce-kuxr.onrender.com', // Add your frontend URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

const errorMiddleware = require("./middleware/error.js");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
// Route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);


// Enable CORS for all origins


// Default route for the root path
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend server is running successfully."
  });
});

// MiddleWare for handling errors
app.use(errorMiddleware);

// Serve static assets from the "build" folder of the frontend
app.use(express.static(path.join(__dirname, "../frontend/build")));

// Handle client-side routing by always serving index.html for unknown paths
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

// Export app module for use in server
module.exports = app;
