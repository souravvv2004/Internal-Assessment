const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
const email=process.env.Email;
const PASSKEY=process.env.PASSKEY;
const {student}=require("../Models/userModel");
const {assignment}=require("../Models/assignment")

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: email,
        pass: PASSKEY
    }
});

app.post("/", async(req, res) => {
    console.log("HERE IS ")
    const { studentID, assignmentID} = req.body;
    console.log(req.body)
    if (!studentID || !assignmentID ) {
        return res.status(400).json({ message: 'Invalid data provided' });
    }
    const studentInstance=await student.findOne({studentID:studentID});
    const assignmentInstance=await assignment.findOne({assignmentID:assignmentID});
    console.log("Student is ",studentInstance);

    const mailOptions = {
        from: email,
        to: studentInstance["Email"],
        subject: `Reminder: Assignment Submission Pending`,
        text: `Dear Student, this is a reminder that your assignment ${assignmentInstance["assignmentName"]} is still pending. Please submit it as soon as possible.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to send reminder email' });
        }
        res.status(200).json({ message: 'Reminder email sent successfully' });
    });
});


module.exports = app;