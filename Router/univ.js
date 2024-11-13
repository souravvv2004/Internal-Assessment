const express = require("express");
const PORT = 8080;
const router = express.Router();

const {student,teacher}= require("../Models/userModel.js");
const nodemailer = require('nodemailer');
const {course,courseAllot}=require("../Models/courseModel.js")
const email=process.env.Email;
const PASSKEY=process.env.PASSKEY;

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: PASSKEY
  }});
async function generateuserID(role) {
    console.log("Inside The Function");
    if(role == "Teacher"){
        // Find the length of documents for generating ID
        let record = await teacher.countDocuments(); // Use countDocuments for MongoDB
        record += 1; // Increment record count
        return "TCH" + String(record).padStart(3, "0"); // Convert to string and pad
    } else {
        let record = await student.countDocuments(); // Use countDocuments for MongoDB
        record += 1; // Increment record count
        return "SUD" + String(record).padStart(3, "0");
    }
}

router.get("/", (req, res) => {
    res.render("univ");
});
router.get("/createUser",(req,res)=>{
    res.render("createUser.ejs")
})

router.post("/createUser", async (req, res) => {
    try {
        console.log("Received Input: ", req.body);
        const role = req.body.role;
        delete req.body.role;
        
        console.log("\nProcessed Input: ", req.body);
        
        const userID = await generateuserID(role); // Await the generated user ID
        const body = req.body;
        
        console.log("Generated ID: ", userID);

        if(role == "Teacher"){
            var teacherID=userID;
            const newTeacher = new teacher({
                teacherID,
                ...body
            });
            
            await newTeacher.save(); // Save the teacher record
            console.log("Teacher created successfully");

            var mailOptions = {
                from: "sourabhmadaan31@gmail.com",
                to: newTeacher.Email,
                subject: '<h2>Registering Email</h2>',
                text: `Welcome to the Organization! Your unique Teacher ID is: ${teacherID}`
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log("Error sending email:", error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.status(201).send({ message: "Teacher Created Successfully" });

        } else if(role == "Student"){
            var studentID=userID;
            const newStudent = new student({
                studentID,
                ...body
            });
            await newStudent.save(); // Save the student record
            console.log("Student created successfully");

            var mailOptions = {
                from: "sourabhmadaan31@gmail.com",
                to: newStudent.Email,
                subject: '<h2>Registering Email</h2>',
                text: `Welcome to the Organization! Your unique Student ID is: ${studentID}`
            };

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log("Error sending email:", error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.status(201).send({ message: "Student Created Successfully" });
        }
    } catch (error) {
        console.error("Error occurred during user creation:", error);
        const errorMessage = `Error adding ${req.body.role || 'user'}`;
        res.status(500).send({ message: errorMessage, error: error.message || error });
    }
});


//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                                  Making an API For Fetching Course Base on entered USer ID

router.get("/courseAlloted/:userID", async (req, res) => {
  
    const { userID } = req.params;

    try {
        console.log("user id is ", userID);
        let userCourses;
        
        if (userID[0] === 'T') {
            userCourses = await courseAllot.find({ userID: userID, role: "Instructor" });
           
            
            if (userCourses && userCourses.length > 0) {
                const courseIDs = userCourses.map(course => course.courseID).flat();
              
                
                // Query for courses with courseID in the array
                const coursesarr = await course.find({ courseID: { $in: courseIDs } });
              console.log(coursesarr)
                if (coursesarr.length > 0) {
                    res.json({ courses: coursesarr, role: "Instructor" });
                } else {
                    res.json({ message: "No courses found for this instructor." });
                }
            } else {
                res.json({ message: "No courses found for this ID." });
            }
        }
        else if(userID[0] === 'S'){
            userCourses = await courseAllot.find({ userID: userID, role: "Student" });
          
            
            if (userCourses && userCourses.length > 0) {
                const courseIDs = userCourses.map(course => course.courseID).flat();
               
                
                
                const coursesarr = await course.find({ courseID: { $in: courseIDs } });
                
                if (coursesarr.length > 0) {
                    res.json({ courses: coursesarr, role: "Student" });
                } else {
                    res.json({ message: "No courses found for this Student." });
                }
            } else {
                res.json({ message: "No courses found for this ID." });
            }

        }
        
        
    } catch (error) {
        console.log("Error is ", error);
        res.status(500).json({ message: "Error fetching courses", error });
    }
});




///////////////////////////////////////////////////////////////////////////////////////////////////////////
//For Creating Courses

router.route("/courses")

.get((req,res)=>{
    res.render("courses.ejs");
})
.post(async(req,res)=>{



    try {
        const { courseID, courseName } = req.body;

        // Check if course already exists
        const existingCourse = await course.findOne({ courseID });
        if (existingCourse) {
            return res.status(400).send({ message: "Course ID already exists!" });
        }

        // Create a new course document
        const newCourse = new course({
            courseID,
            courseName
        });

        await newCourse.save();
        res.status(201).send({ message: "Course added successfully!" });

    } catch (error) {
        console.error("Error adding course:", error);
        res.status(500).send({ message: "Error adding course", error: error.message });
    }



})

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//                                              For Selecting and Updating Course

router.route("/courseAllot")
.get(async(req,res)=>{
    
    let coursearr=await course.find({});
    
    res.render("courseAllot.ejs",{array:coursearr});})
.post(async(req,res)=>{
    let subjectarr=req.body;
    console.log(subjectarr);
    
    try{
        await courseAllot.insertMany(subjectarr);
    }
    catch (error){

        if (error.code === 11000) {
           console.log(subjectarr["userID"],subjectarr["courseID"]);
             
                 const updateResult = await courseAllot.updateMany(
                    {userID:subjectarr["userID"]},{$set:{courseID:subjectarr["courseID"]}}
                 );
                 res.status(200).json({ message: "Courses updated successfully", updateResult });
                 }
        else{

            console.error('Error:', error);
            alert("Error submitting courses.");}

        }







})

module.exports = router;
