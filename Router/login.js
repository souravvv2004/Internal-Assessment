const express = require("express");
const app = express();

const { teacher, student, admin } = require("../Models/userModel");
const multer = require("multer")
const { signToken, verifyToken } = require("../utils/jwt")
const { course, courseAllot } = require("../Models/courseModel");
const { assignment, submission } = require("../Models/assignment")
const crypto = require("crypto");

//For Gernating Hash of entered Value
function generateHashToken(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}


//Function For Handling For storing items
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder where files will be saved
    },
    filename: function (req, file, cb) {

        cb(null, Date.now() + file.originalname); // Rename the file with timestamp
    }
});
const upload = multer({ storage: storage });


//Get Request on login...
app.route("/")
    .get((req, res) => {

        res.render("login")


    })

    .post(async (req, res) => {
        // Check The User ID
        const id = req.body.userID.toUpperCase();
        console.log(id);

        // Teacher ID
        if (id[0] == 'T') {
            const user = await teacher.findOne({ teacherID: id });
            console.log(user);
            if (!user) {
                return res.status(404).json({ error: "Incorrect User ID" }); // Send JSON error response
            }
            if (user.Password == "Not Set") { return res.redirect("/forgot"); }




            //Validating Password
            if (user.Password == generateHashToken(req.body.password)) {
                const cookkieVal = await signToken({ id: user.teacherID || user.studentID || user.adminID, role: user.teacherID ? "Teacher" : user.studentID ? "Student" : "Admin" });
                res.cookie("session", cookkieVal, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.redirect("login/teachers");
            }
            else {
                return res.status(404).json({ error: "Incorrect Password" });
            }
        }

        else if (id[0] == 'S') {
            const user = await student.findOne({ studentID: id });
            if (!user) {
                return res.status(404).json({ error: "Incorrect User ID" });
            }
            if (user.Password == "Not Set") {
                return res.redirect("/forgot");
            }
            console.log("Password is ", generateHashToken(req.body.password));
            if (user.Password == generateHashToken(req.body.password)) {
                const cookkieVal = await signToken({ id: user.teacherID || user.studentID || user.adminID, role: user.teacherID ? "Teacher" : user.studentID ? "Student" : "Admin" });
                                res.cookie("session", cookkieVal, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });
                return res.redirect("login/student");
            } else {
                return res.status(404).json({ error: "Incorrect Password" });
            }
        }
        else if (id == "ADMIN") {

            const user = await admin.findOne({ adminID: id });
            console.log(user)
            console.log("Password enter :", req.body.password);

            console.log("Hashed Password is ", generateHashToken(req.body.password))

            if (user.Password == generateHashToken(req.body.password)) {
                const cookkieVal = await signToken({ id: user.teacherID || user.studentID || user.adminID, role: user.teacherID ? "Teacher" : user.studentID ? "Student" : "Admin" });
                res.cookie("session", cookkieVal, {
                    httpOnly: true,
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000 // 1 day
                });

                return res.redirect("/univ");

            }
            else { return res.status(404).json({ error: "Incorrect Password" }); }

        }
        else {
            return res.status(404).json({ error: "Incorrect User ID Format" });
        }
    });

//--------------------------------------------------------------------------------------------------------------------------------


//                                              Teacher Route



//----------------------------------------------------------------------------------------------------------------------------------

app.get("/teachers", async (req, res) => {

    var tokenUser = await verifyToken(req.cookies.session);
    var user = await teacher.findOne({ teacherID: tokenUser.id });







    let coursescode = [], coursesname, assignmentarr;


    coursescode = await courseAllot.find({ userID: user.teacherID, role: "Instructor" });



    coursesname = coursescode.length > 0 ? await course.find({
        courseID: { $in: coursescode[0]["courseID"] }
    }) : [];


    assignmentarr = coursescode.length > 0 ? await assignment.find({
        subjectCode: { $in: coursescode[0]["courseID"] }
    }) : [];
    console.log("Courses Alloted are ", coursesname);
    console.log("Assignments are ", assignmentarr);

    res.render("teacherpage", { courses: coursesname, teacher: user, assignments: assignmentarr });





})


app.get("/course/:courseid", async (req, res) => {
    const courseID = req.params.courseid;
    
    const courseDetails = await course.findOne({ courseID });
    
    const studentAllotments = await courseAllot.find({ courseID: { $in: [courseID] }, role: "Student" });
    const studentIDs = studentAllotments.map((allotment) => allotment.userID);
    const students = await student.find({ studentID: { $in: studentIDs } });

    const assignments = await assignment.find({ subjectCode: courseID });

    const facultyAllotments = await courseAllot.find({ courseID: { $in: [courseID] }, role: "Instructor" });
    const facultyIDs = facultyAllotments.map((allotment) => allotment.userID);
    const faculty = await teacher.find({ teacherID: { $in: facultyIDs } });

    res.render("courseDashboard", {
        courseName: courseDetails.courseName,
        students,
        assignments,
        faculty,
    });
});

app.post("/course/create", upload.single("formFileSm"), async (req, res) => {
    var user = await verifyToken(req.cookies.session);
    const numofprevassignment = await assignment.countDocuments({ subjectCode: req.body.subjectCode }) + 1;
    console.log("Prev Assignment is ", numofprevassignment)
    

    const assignmentID = "A" + req.body.subjectCode + ":" + `${numofprevassignment.toString().padStart(3, '0')}`;
    console.log("Assignment ID is ", assignmentID);

    const filePath = req.file ? req.file.path : null;
    delete req.body.formFileSm;

    const Assignment = new assignment({
        assignmentID,
        ...req.body,
        createdBy: user.id,        
        assignmentPath: filePath
    });

    await Assignment.save();
    res.end("Assignment Created Successfully");

})

//--------------------------------------------------------------------------------------------------------------------------------


//                                              Student Route



//----------------------------------------------------------------------------------------------------------------------------------



app.get("/student", async (req, res) => {

    var tokenUser = await verifyToken(req.cookies.session);
    var user = await student.findOne({ studentID: tokenUser.id });
    let coursescode = [], coursesname, assignmentarr = [], submissionarr = [];

    // Fetch courses for the student
    coursescode = await courseAllot.find({ userID: user.studentID, role: "Student" }) || [];

    coursesname = coursescode.length > 0 ? await course.find({
        courseID: { $in: coursescode[0]["courseID"] }
    }) : [];

    // Fetch all assignments related to the student's courses
    assignmentarr = coursescode.length > 0 ? await assignment.find({
        subjectCode: { $in: coursescode[0]["courseID"] }
    }) : [];

    // Fetch all submissions for the student
    submissionarr = await submission.aggregate([
        {
            $match: { submissonerID: user["studentID"] } // Match submissions for a specific student (submissonerID)
        },
        {
            $lookup: {
                from: "assignments", // The collection to join (assignment collection)
                localField: "assignmentID", // Field in the submission collection
                foreignField: "assignmentID", // Field in the assignment collection
                as: "assignmentDetails" // Output field with assignment details
            }
        },
        {
            $unwind: {
                path: "$assignmentDetails",  // Unwind to flatten the array
                preserveNullAndEmptyArrays: true  // If no matching assignment, keep the submission
            }
        },
        {
            $project: {

                assignmentID: 1,
                submissionID: 1, // Include the submission ID
                graded: 1, // Include the grading status
                submittedTime: 1, // Include the time when it was submitted
                content: 1, // Include the content of the submission (path or content itself)
                _id: 0,// Exclude the MongoDB _id field
                assignmentName: "$assignmentDetails.assignmentName"

            }
        }
    ]);

    // Extract assignmentIDs from the submission array
    const submittedAssignmentIDs = submissionarr.map(sub => sub.assignmentID);

    // Filter the assignments array to exclude the submitted assignments (show only pending assignments)
    const pendingAssignments = assignmentarr.filter(assign =>
        !submittedAssignmentIDs.includes(assign.assignmentID)
    );

    // Log the arrays for debugging (can be removed after testing)
    console.log('All Assignments:', assignmentarr);
    console.log('Submitted Assignments:', submissionarr);
    console.log('Pending Assignments:', pendingAssignments);

    // Render the student page with all necessary data
    res.render("studentpage", {
        courses: coursesname,
        student: user,
        pendingAssignments: pendingAssignments,
        submittedAssignments: submissionarr
    });


})






module.exports = app;
