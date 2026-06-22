//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                      Function For handling sending reminder emails for pending assignments
//                        @  Send Reminder (For Students)   
// 
//
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
const email=process.env.Email;
const PASSKEY=process.env.PASSKEY;
const {student}=require("../Models/userModel");
const {assignment}=require("../Models/assignment")
// Nodemailer transporter configured for Gmail SMTP, using credentials from env vars
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: PASSKEY
    }
});

app.post("/", async(req, res) => {
    
    const { studentID, assignmentID} = req.body;

    console.log(req.body)
    // Check if studentID and assignmentID are provided
    if (!studentID || !assignmentID ) {
        return res.status(400).json({ message: 'Invalid data provided' });
    }

    const studentInstance=await student.findOne({studentID:studentID});

    const assignmentInstance=await assignment.findOne({assignmentID:assignmentID});
    // Check if student and assignment exist
    if (!studentInstance || !assignmentInstance) {
    return res.status(404).json({ message: 'Student or assignment not found' });
}

    console.log("Student is ",studentInstance);
    // Setting up email options
    const mailOptions = {
        from: email,
        to: studentInstance["Email"],
        subject: `Reminder: Assignment Submission Pending`,
        text: `Dear Student, this is a reminder that your assignment ${assignmentInstance["assignmentName"]} is still pending. Please submit it as soon as possible.`
    };
    // Sending the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to send reminder email' });
        }
        res.status(200).json({ message: 'Reminder email sent successfully' });
    });
});


module.exports = app;