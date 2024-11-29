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


//--------------------------------------------------------------------------------------------------------------------------------------
//                                                      For Rendering Univ Page
//
//---------------------------------------------------------------------------------------------------------------------------------------
router.get("/", (req, res) => {
    res.render("univ");
});
//--------------------------------------------------------------------------------------------------------------------------------------
//                                                      For Handling Teacher and Student Creation
//
//---------------------------------------------------------------------------------------------------------------------------------------




router.route("/createUser")
.get((req,res)=>{
    res.render("createUser.ejs");
})




.post(async (req, res) => {
    try {
       
        const role = req.body.role;
        delete req.body.role;
        
       
        
        const userID = await generateuserID(role); 
        const body = req.body;
        
       

        if(role == "Teacher"){
            var teacherID=userID;
            const newTeacher = new teacher({
                teacherID,
                ...body
            });
            
            await newTeacher.save(); // Save the teacher record
          
            console.log("Teacher ID is ",studentID);
            var mailOptions = {
                from: "sourabhmadaan31@gmail.com",
                to: newTeacher.Email,
                subject: 'Registering Email',
                text: `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><h2 style="color: #4CAF50; ">Welcome to Our Organization!</h2>
                <p>Dear <strong>${req.body.Name}</strong>,</p>
                <p>Welcome to the organization! We are thrilled to have you on board as part of our team.</p>
                <p><strong>Your unique Teacher ID is:</strong> <span style="color: #007BFF;">${teacherID}</span></p>
                <p>To set up your password and access the Teacher Module, please follow these steps:</p>
                <ol>
                    <li>Go to the <strong>Teacher Module</strong>.</li>
                    <li>Click on <strong>"Forgot Password"</strong> to initiate the password setup process.</li>
                </ol>
                <p>If you have any questions or require assistance, please don’t hesitate to reach out to our support team.</p>
                <p>We’re excited to work with you and wish you great success ahead!</p>
                <br>
                
                <p><strong>All the best for your upcoming journey</strong></p></body>`
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
            console.log("Student ID is ",studentID);

            var mailOptions = {
                from: "sourabhmadaan31@gmail.com",
                to: newStudent.Email,
                subject: '<h2>Registering Email</h2>',
                text: `<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><h2 >Welcome to Our Organization!</h2>
                <p>Dear <strong>${req.body.Name}</strong>,</p>
                <p>Welcome to the organization! We are thrilled to have you on board as part of our team.</p>
                <p><strong>Your unique Teacher ID is:</strong> <span style="color: #007BFF;">${studentID}</span></p>
                <p>To set up your password and access the Teacher Module, please follow these steps:</p>
                <ol>
                    <li>Go to the <strong>Teacher Module</strong>.</li>
                    <li>Click on <strong>"Forgot Password"</strong> to initiate the password setup process.</li>
                </ol>
                <p>If you have any questions or require assistance, please don’t hesitate to reach out to our support team.</p>
                <p>We’re excited to work with you and wish you great success ahead!</p>
                <br>
                
                <p><strong>All the best for your upcoming journey</strong></p></body>`
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


//---------------------------------------------------------------------------------------------------------------------------------------
//                                
//                                    Making an API For Fetching Course Base on entered USer ID
//
//---------------------------------------------------------------------------------------------------------------------------------------



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




//--------------------------------------------------------------------------------------------------------------------------------------
//                                                        
//                                                        For Creating Courses
//
//--------------------------------------------------------------------------------------------------------------------------------------
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

//--------------------------------------------------------------------------------------------------------------------------------------
//                                                        
//                                                        For Allotting Courses
//
//--------------------------------------------------------------------------------------------------------------------------------------


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
