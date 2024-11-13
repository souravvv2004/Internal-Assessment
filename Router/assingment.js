//////////////////////////////////////////////////////////////////////////////////////////////////////////
//                      Function For handling Assignment
//                        @  Submission Status (For Teachers)
//                        @  Checking and Grading Submission (For Teacher)
//                        @  Submission Option (For Student)
//
//
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////

const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { courseAllot } = require("../Models/courseModel");
const {assignment,submission}= require("../Models/assignment");
const {student,teacher}=require("../Models/userModel");

const app = express();
app.use(cookieParser()); // Ensure cookie-parser is used


//Function For calculating Remaining Time---------------------------------------------------------------------------
function calculateRemainingTime(targetDate) {
    const now = new Date(); // Current time
    const target = new Date(targetDate); // Target date

    const timeDifference = target - now; // Difference in milliseconds

    if (timeDifference <= 0) {
        return "Time's up!";
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

//-----------------------------------------------------------------------------------------------------------------------

// Middleware for validating user to access only their assignments
async function userValidate(req, res, next) {
    console.log("...........User Reached..........\n");
    try {
        const { assignmentID } = req.params;
        const user = jwt.verify(req.cookies.session, "SECRET");
      
        let coursearr;
        if (user.teacherID && user.teacherID[0] === 'T') {
            coursearr = await courseAllot.findOne(
                { userID: user.teacherID },
                { courseID: 1 }
            );
            console.log(coursearr);
            coursearr=coursearr["courseID"];
            console.log(coursearr);
        } else if (user.studentID && user.teacherID[0] === 'S') {
            coursearr = await courseAllot.findOne(
                { instructorID: user.studentID },
                { courseID: 1 }
            );
            console.log(coursearr);
            coursearr=coursearr["courseID"];
            console.log(coursearr);
        }
         else {
            return res.status(403).send("Access denied");
        }

        if (coursearr && coursearr.includes(assignmentID.slice(1, 8))) {
            next();
        } else {
            res.status(403).send("Access denied");
        }
    } catch (error) {
        res.status(401).end("Unauthorized");
    }
}

//---------------------------------------------------------------------------------------------------------------------

//        
//                            To View The assignment
//
app.route("/:assignmentID").get(userValidate, async (req, res) => {
    try {
        let assignmentInstance, submittedStudentsData, notSubmittedStudentsData;

        // Fetch assignment details and calculate remaining time
        assignmentInstance = await assignment.findOne({ assignmentID: req.params.assignmentID }) || {};
        assignmentInstance.timeRemaining = calculateRemainingTime(assignmentInstance.dueDate);

        // Get list of students who submitted the assignment
        const submittedStudents = await submission
            .find({ assignmentID: req.params.assignmentID.slice(1, 7) })
            .select("submissonerID");

        const submittedStudentIDs = submittedStudents.map(submission => submission.submissonerID);

        // Fetch data of submitted students
        submittedStudentsData = await student.find({ studentID: { $in: submittedStudentIDs } });

        // Get list of students who are enrolled but have not submitted
        const enrolledStudents = await courseAllot
            .find({ courseID: { $in: [assignmentInstance.subjectCode] }, role: "Student" })
            .select("userID");

        const enrolledStudentIDs = enrolledStudents.map(courseAllot => courseAllot.userID);
        const notSubmittedStudentIDs = enrolledStudentIDs.filter(studentID => !submittedStudentIDs.includes(studentID));

        // Fetch data of not submitted students
        notSubmittedStudentsData = await student.find({ studentID: { $in: notSubmittedStudentIDs } });
        console.log("student is ",notSubmittedStudentsData);

        // Pass the data to the EJS template
        res.render("assignment", {
            assignment: assignmentInstance,
            submittedStudents: submittedStudentsData,
            notSubmittedStudents: notSubmittedStudentsData
        });
    } catch (error) {
        console.error("Error fetching assignment details: ", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = app;
