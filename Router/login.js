const express = require("express");
const app = express();

const {teacher,student,admin} = require("../Models/userModel");
const multer = require("multer")
const jwt = require("jsonwebtoken")
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
        if (user.Password == "Not Set") {return res.redirect("/forgot");}
        
        
    
    
        //Validating Password
        if (user.Password == generateHashToken(req.body.password)) {
            const cokkieVal = jwt.sign(JSON.stringify(user), "SECRET");
            res.cookie("session", cokkieVal);
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
        console.log("Password is ",generateHashToken(req.body.password));
        if (user.Password == generateHashToken(req.body.password)) {
            const cokkieVal = jwt.sign(JSON.stringify(user), "SECRET");
            res.cookie("session", cokkieVal);
            return res.redirect("login/student");
        } else {
            return res.status(404).json({ error: "Incorrect Password" });
        }
    }
    else if(id=="ADMIN"){

        const user = await admin.findOne({ adminID: id });

        if(user.Password==generateHashToken(req.body.password)){
            const cokkieVal = jwt.sign(JSON.stringify(user), "SECRET");
            res.cookie("session", cokkieVal);

            return res.redirect("/univ");

        }
        else{return res.status(404).json({ error: "Incorrect Password" });}
        
    } 
    else {
        return res.status(404).json({ error: "Incorrect User ID Format" });
    }
});

//--------------------------------------------------------------------------------------------------------------------------------


//                                              Teacher Route



//----------------------------------------------------------------------------------------------------------------------------------

app.get("/teachers", async (req, res) => {
   
    var user = jwt.verify(req.cookies.session, "SECRET");
  



   
   
    
    let coursescode=[],coursesname,assignmentarr;
    
        
     coursescode = await courseAllot.find({ userID: user.teacherID, role: "Instructor" }) ;


     coursesname = coursescode.length > 0 ? await course.find({
         courseID: { $in: coursescode[0]["courseID"] }
     }) : [];


     assignmentarr = coursescode.length > 0 ? await assignment.find({
         subjectCode: { $in: coursescode[0]["courseID"] }
     }) : [];
     

    res.render("teacherpage", { courses: coursesname, teacher: user, assignments: assignmentarr });





})

app.get("/course/:courseid",async(req,res)=>{
    const courseID=req.params.id;


    const studentAllotments = await courseAllot.find({ courseID:{ $in: [courseID] }, role: "Student" });
    const studentIDs = studentAllotments.map((allotment) => allotment.userID);
    const students = await student.find({ studentID: { $in: studentIDs } });

    // Fetch assignments for the course
    const assignments = await assignmentModel.find({ subjectCode: courseID });

    // Fetch faculty for the course
    const facultyAllotments = await courseAllot.find({ courseID:{ $in: [courseID] }, role: "Instructor" });
    res.render("courseDashboard", {
        courseName: courseDetails.courseName,
        students,
        assignments,
        faculty,
    });



})

app.post("/course/create", upload.single("formFileSm"), async (req, res) => {
    const numofprevassignment = await assignment.countDocuments({ subjectCode: req.body.subjectCode }) + 1;
    console.log("Prev Assignment is ", numofprevassignment)


    const assignmentID = "A" + req.body.subjectCode + ":" + `${numofprevassignment.toString().padStart(3, '0')}`;
    console.log("Assignment ID is ", assignmentID);

    const filePath = req.file ? req.file.path : null;
    delete req.body.formFileSm;

    const Assignment = new assignment({

        assignmentID,
        ...req.body,
        assignmentPath: filePath

    });

    await Assignment.save();
    res.end("Assignment Created Successfully");

})

//--------------------------------------------------------------------------------------------------------------------------------


//                                              Student Route



//----------------------------------------------------------------------------------------------------------------------------------



app.get("/student",async (req,res)=>{

    var user = jwt.verify(req.cookies.session, "SECRET");
    let coursescode=[],coursesname,assignmentarr,submissionarr=[];
    

     coursescode = await courseAllot.find({ userID: user.studentID, role: "Student" }) || [];

     coursesname = coursescode.length > 0 ? await course.find({
         courseID: { $in: coursescode[0]["courseID"] }
     }) : [];


     assignmentarr = coursescode.length > 0 ? await assignment.find({
         subjectCode: { $in: coursescode[0]["courseID"] }
     }) : [];
     

     


    res.render("studentpage", { courses: coursesname, student: user, pendingAssignments: assignmentarr,submittedAssignments:submissionarr });






})







module.exports = app;
