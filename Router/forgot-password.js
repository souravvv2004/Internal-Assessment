const express = require("express");
const router=express.Router();
const nodemailer = require('nodemailer');
const teacherdb = require('../Models/teacherModel');
const crypto=require("crypto")
function generateHashToken() {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes = 64 hex characters
}
const email=process.env.Email;
const PASSKEY=process.env.PASSKEY;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: PASSCODE
}});

router.post("/",async (req,res)=>{

    const id=req.userID;
    //Uppercase the user id make a search in teachers database with user id extract the email from record using MONGODB
    const teacher=await teacherdb.find({teacherID:id});
    if (!teacher) {
        return res.status(404).end( "<h1>User not found</h1>" );
      }
    const hashtoken=generateHashToken();

    var mailOptions = {
    from: "sourabhmadaan31@gmail.com",
    to: teacher.Email,
    subject: '  Password Reset Email',
    text: `Hello ${teacher.Name} <br>Click <a href="${req.get('host')}/forgot/${hashtoken}>here</a> for reset the password.`
    };

  //Expiration Time 
  const expirationTime=Date.now()+5*60*1000;

  //Updating in database

  teacherdb.updateOne({teacherID:id},{token:hashtoken,expireTime:expirationTime});

    //Sending Mail 


    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
        console.log(error);
        } else {
        console.log('Email sent: ' + info.response);
        }
    }); 
  })
  module.exports=router;
