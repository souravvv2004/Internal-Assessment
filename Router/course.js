const express = require("express");
const app = express();

const {teacher,student,admin} = require("../Models/userModel");
const multer = require("multer")
const jwt = require("jsonwebtoken")
const { course, courseAllot } = require("../Models/courseModel");
const { assignment, submission } = require("../Models/assignment")
const crypto = require("crypto");
app.get("/:courseID", async (req, res) => {
    try {
        const courseID = req.params.courseID;

        // Fetch course details
        const courseDetails = await course.findOne({ courseID });

        if (!courseDetails) {
            return res.status(404).send("Course not found");
        }

        // Fetch students associated with the course
        const studentAllotments = await courseAllot.find({ courseID: { $in: courseID }, role: "Student" });
        console.log(studentAllotments);
        const studentIDs = studentAllotments.map((allotment) => allotment.userID);
        console.log(studentIDs)
        const students = await student.find({ studentID: { $in: studentIDs } });

        // Fetch assignments for the course
        const assignments = await assignment.find({ subjectCode: courseID });

        // Fetch faculty associated with the course
        const facultyAllotments = await courseAllot.find({ courseID: { $in: [courseID] }, role: "Instructor" });
        const facultyIDs = facultyAllotments.map((allotment) => allotment.userID);
        const faculty = await teacher.find({ teacherID: { $in: facultyIDs } });

        // Render the data in the course dashboard
        res.render("coursePage", {
            courseName: courseDetails.courseName,
            students,
            assignments,
            faculty,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = app;