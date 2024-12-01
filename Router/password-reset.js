const express = require("express");
const app = express();
const nodemailer = require('nodemailer');
const {teacher,student} = require('../Models/userModel');
const crypto = require("crypto");
const email=process.env.Email;
const PASSKEY=process.env.PASSKEY;
// Email Details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: email,
        pass: PASSKEY, 
    },
});

// Function to generate a token
function generateHashToken1() {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes = 64 hex characters
}

// Function to hash the password
function generateHashToken(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Rendering Forgot Password Page
//--------------------------------------------------------------------------------------------------------------------------------------

app.get("/", (req, res) => {
    res.render("forgot-password");
});

//--------------------------------------------------------------------------------------------------------------------------------------
//                                              Handling Forgot Password Route
//--------------------------------------------------------------------------------------------------------------------------------------



app.post("/", async (req, res) => {
    const id = req.body.userID;
   
    var user=await teacher.findOne({ teacherID: id }); 
    if(!user){user=await student.findOne({ studentID: id }); }

    if (!user) {return res.status(404).send("<h1>User not found</h1>");}

    const hashtoken = generateHashToken1();
    console.log("Email id is ", user.Email);

    // Construct email options
    const mailOptions = {
        from: "sourabhmadaan31@gmail.com",
        to: user.Email,
        subject: 'Password Reset Email',
        html: `Hello ${user.Name}, <br>Click <a href="http://${req.get('host')}/forgot/reset/${hashtoken}">here</a> to reset your password.` 
    };

    // Expiration Time 
    const expirationTime = Date.now() + 5 * 60 * 1000;
    console.log("Expiration time is ",expirationTime);

    // Update in database
    user.token=hashtoken;
    user.expiretime=expirationTime;
    await user.save();
    console.log("user token and hashtime is updated successfully");
   

    // Sending Mail 
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
            return res.status(500).send("Error sending email");
        } else {
            console.log('Email sent: ' + info.response);
            return res.send("Password reset email sent successfully.");
        }
    });
});

// GET route to handle the token and render password reset page
app.get("/reset/:token", async (req, res) => {
     const tokenhash = req.params.token;

    let user = await teacher.findOne({ token: tokenhash });
    if (!user) {user=await student.findOne({ token: tokenhash });}
    if (!user) {
        return res.redirect("/login?alert=Invalid%20Link");
    }

    const expirationTime = user.expireTime; // Fixed variable name
    if (Date.now() > new Date(expirationTime)) {
        return res.redirect("/login?alert=Link%20Expired");
    }

    res.render("set-new-password.ejs", { token: tokenhash });
});

// POST route to set the password 
app.post("/reset", async (req, res) => {
    const tokenhash = req.body.token;

    let user = await teacher.findOne({ token: tokenhash });
    if (!user) {user=await student.findOne({ token: tokenhash });}
    if (!user) {
        return res.redirect("/login?alert=Invalid%20Link");
    }

    const expirationTime = user.expireTime; // Fixed variable name
    if (Date.now() > new Date(expirationTime)) {
        return res.redirect("/login?alert=Link%20Expired");
    }

    const password1 = req.body.password;
    const password2 = req.body['confirm-password'];

    // Check if passwords match
    if (password1 !== password2) {
        return res.status(400).send("Passwords do not match"); // You can customize this for better UX
    }

    // Additional password validation checks (e.g., length, symbols)
    if (password1.length < 8) {
        return res.status(400).send("Password must be at least 8 characters long");
    }

    // Hash the new password and save it to the user
    
    user.Password = await generateHashToken(password1);
    user.token = null;
    user.expiretime = 0;
    await user.save();


    res.send("Password Changed Successfully");
});

module.exports = app;
