require("dotenv").config();
const express = require ("express");
const multer = require("multer");
const { config } = require("./config");
const app = express();
const cors = require("cors");
const { errorHandler } = require("./middlewares/error.middleware");

app.use(express.json());
app.use(express.urlencoded({extended: true}))
// Configure CORS to allow frontend requests
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:5500',
        'http://127.0.0.1:5500',
        'http://localhost:8001',
        'http://127.0.0.1:8001',
        'https://defirstcallpremium.vercel.app',
        'https://carshowroombygideon.vercel.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
app.use("/api/v1/status", (req, res) =>{
    // console.log(req)
    res.send(`yes! welcome to ${config.APPNAME}API`);
})
app.use(errorHandler)

module.exports = app;