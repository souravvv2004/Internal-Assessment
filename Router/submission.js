const express = require("express");
const { signToken, verifyToken } = require("../utils/jwt");
const app = express();
const cookieParser = require("cookie-parser");

const { course, courseAllot } = require("../Models/courseModel");
const { assignment, submission } = require("../Models/assignment");
const { student } = require("../Models/userModel");

// Middleware: confirms the logged-in user (teacher or student) is allotted to the
// course this submission belongs to, before allowing access to view/grade it.
// The course code is extracted from the submissionID itself via string slicing.
async function validateUser(req, res, next) {
    try {
        if (!req.cookies || !req.cookies.session) {
            return res.redirect("/");
        }

        var { submissionID } = req.params;
        submissionID = submissionID.slice(2, 9); // extract embedded course code from the ID
        console.log("Course is ", submissionID);

        const user = await verifyToken(req.cookies.session);

        if (user.role === "Student") {
            const courseAlloted = await courseAllot.find({ userID: user.id, role: "Student" }, { courseID: 1, _id: 0 });
            if (courseAlloted[0]["courseID"].includes(submissionID)) {
                next();
            } else {
                res.status(403).send("Access denied");
            }
        } else {
            const courseAlloted = await courseAllot.find({ userID: user.id, role: "Instructor" }, { courseID: 1, _id: 0 });
            if (courseAlloted[0]["courseID"].includes(submissionID)) {
                next();
            } else {
                res.status(403).send("Access denied");
            }
        }
    } catch (error) {
        console.log("Error in Validating Courses ", error);
        res.status(500).redirect("/");
    }
}

app.use(cookieParser());

app.route("/:submissionID")
    // View a single submission's details — assignment info, submitter's name,
    // course name, and grading status. Used by teachers to review/grade work.
    .get(validateUser, async (req, res) => {
        const submissionInstance = await submission.findOne({ submissionID: req.params.submissionID });
        const assignmentID = req.params.submissionID.slice(1, 13);
        console.log(assignmentID);

        const assignmentInstance = await assignment.findOne({ assignmentID: assignmentID });
        const studentName = await student.findOne({ studentID: submissionInstance["submissonerID"] }, { Name: 1, _id: 0 });

        let courseName = await course.findOne({ courseID: assignmentInstance["subjectCode"] }, { courseName: 1, _id: 0 });
        courseName = courseName["courseName"];
        console.log(courseName);

        const subjectName = `${assignmentInstance["subjectCode"]}:${courseName}`;
        console.log("Assignment is ", assignmentInstance, "\nSubmission is", submissionInstance, "Student Name", studentName);

        res.render("submissionpage", {
            assignment: assignmentInstance,
            submission: submissionInstance,
            subjectName: subjectName,
            studentName: studentName["Name"]
        });
    })
    // Grade a submission — validates the entered marks against the assignment's
    // maxMarks before saving, rejecting anything out of range.
    .post(async (req, res) => {
        const marks = req.body.marks;
        console.log("Marks is ", req.body);

        const submissionID = req.params.submissionID;
        console.log("submission is ", submissionID);

        const assignmentID = submissionID.slice(1, 13);
        const assignmentInstance = await assignment.findOne({ assignmentID: assignmentID });
        const submissionInstance = await submission.findOne({ submissionID: req.params.submissionID });

        // Guard against a missing/stale assignment or submission record before
        // reading fields off them below
        if (!assignmentInstance || !submissionInstance) {
            return res.status(404).send("Assignment or submission not found");
        }

        // Marks must fall within 0 and the assignment's maxMarks
        if (marks >= 0 && marks <= assignmentInstance["maxMarks"]) {
            submissionInstance["graded"] = marks.toString();
        } else {
            return res.status(403).send("Marks is Out of Range");
        }

        await submissionInstance.save();
        res.end("Graded Successfully");
    });

module.exports = app;