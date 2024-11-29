const express = require("express");
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 8080;

const univRouter = require("./Router/univ.js");
const password = require("./Router/password-reset.js");
const loginRoute=require("./Router/login.js");
const assingment=require("./Router/assingment.js")
const submission=require("./Router/submission.js")
const cookieParser = require('cookie-parser'); 
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cookieParser());
const multer  = require('multer')

const mongoose = require("mongoose");
const path = require("path");

const url=process.env.MONGODB_URI;
// University Side
// Create Student ID with Name
// Login the Student

app.use(express.static(path.join(__dirname, 'public')));
mongoose.connect(url,)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

console.log("Connected With Mongo DB");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/Views/:file', (req, res) => {
    const file = req.params.file;
    res.render(file); // This will look for views/forgot-password.ejs
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));









app.set('views', path.join(__dirname, 'views'));
app.get("/",(req,res)=>{res.render("index")});
app.set('view engine', 'ejs');
app.use("/login",loginRoute);
app.use("/univ", univRouter);
app.use("/forgot", password);
app.use("/assignment", assingment);
app.use("/submission",submission);

// Make the server listen on IPv6 only
app.listen(3000,  () => {
    console.log("Url is ",url,"",typeof(url)),
    console.log("Server running on localhost and Port", PORT);
});
