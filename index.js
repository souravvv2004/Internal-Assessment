const express = require("express");
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 8080;
const univRouter = require("./Router/univ.js");
const forgotPasswordRoute = require("./Router/password-reset.js");
const loginRoute = require("./Router/login.js");
const assignmentRoute = require("./Router/assignment.js")
const submissionRoute = require("./Router/submission.js")
const courseRoute = require("./Router/course.js")
const reminder=require("./Router/send-reminder.js")
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
if (!fs.existsSync(path.join(__dirname, "uploads"))) {
    fs.mkdirSync(path.join(__dirname, "uploads"));
}
const url = process.env.MONGODB_URI;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Serving Static Files
//--------------------------------------------------------------------------------------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.get('/uploads/:filename', (req, res) => {
    res.download(path.join(__dirname, 'uploads', req.params.filename), (err) => {
        if (err) {
            res.status(404).send('File not found');
        }
    });
});



//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Route for Handling operation
//--------------------------------------------------------------------------------------------------------------------------------------
app.get("/", (req, res) => { res.render("index") });
app.use("/login", loginRoute);
app.use("/univ", univRouter);
app.use("/forgot", forgotPasswordRoute);
app.use("/assignment", assignmentRoute);
app.use("/submission", submissionRoute);
app.use("/courses", courseRoute);
app.use("/send-reminder",reminder)


//
//--------------------------------------------------------------------------------------------------------------------------------------
//                                          Connected with MongoDB (Name Of DB should be include in the URL)
//--------------------------------------------------------------------------------------------------------------------------------------

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log("Server running on localhost and Port", PORT);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Listening on PORT
//--------------------------------------------------------------------------------------------------------------------------------------
// app.listen("::",PORT, () => {
//   console.log("Url is ", url ? "Connected" : "Not Connected", "\n"),
//     console.log("Server running on IPv6 and Port", PORT);
// });


