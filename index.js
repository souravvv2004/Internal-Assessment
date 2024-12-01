const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const univRouter = require("./Router/univ.js");
const forgotPasswordRoute = require("./Router/password-reset.js");
const loginRoute = require("./Router/login.js");
const assingmentRoute = require("./Router/assingment.js")
const submissionRoute = require("./Router/submission.js")
const courseRoute = require("./Router/course.js")
const reminder=require("./Router/send-reminder.js")
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const mongoose = require("mongoose");
const path = require("path");
const url = process.env.MONGODB_URI;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//
//--------------------------------------------------------------------------------------------------------------------------------------
//                                          Connected with MongoDB (Name Of DB should be include in the URL)
//--------------------------------------------------------------------------------------------------------------------------------------

mongoose.connect(url,)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

console.log("Connected With Mongo DB");




//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Serving Static Files
//--------------------------------------------------------------------------------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Route for Handling operation
//--------------------------------------------------------------------------------------------------------------------------------------
app.get("/", (req, res) => { res.render("index") });
app.use("/login", loginRoute);
app.use("/univ", univRouter);
app.use("/forgot", forgotPasswordRoute);
app.use("/assignment", assingmentRoute);
app.use("/submission", submissionRoute);
app.use("/courses", courseRoute);
app.use("/send-reminder",reminder)
//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Listening on PORT
//--------------------------------------------------------------------------------------------------------------------------------------


app.listen(PORT, () => {
  console.log("Url is ", url, "\n"),
    console.log("Server running on localhost and Port", PORT);
});


//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Listening on PORT
//--------------------------------------------------------------------------------------------------------------------------------------
// app.listen("::",PORT, () => {
//   console.log("Url is ", url, "\n"),
//     console.log("Server running on IPv6 and Port", PORT);
// });


