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
const { courseAllot,course } = require("../Models/courseModel");
const {assignment,submission}= require("../Models/assignment");
const {student,teacher}=require("../Models/userModel");
const multer=require("multer");

const app = express();
app.use(cookieParser()); // Ensure cookie-parser is used
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



//Function For calculating Remaining Time---------------------------------------------------------------------------
function calculateRemainingTime(targetDate) {
    const now = new Date(); // Current time
    const target = new Date(targetDate); // Convert input to Date object
    console.log(targetDate);

    // Calculate the absolute time difference in milliseconds
    const timeDifference = target - now;

    if (timeDifference === 0) {
        return "The time is now!";
    }

    const isPast = timeDifference < 0; // Check if the target date is in the past
    const absDifference = Math.abs(timeDifference); // Get the absolute difference

    // Calculate time components
    const days = Math.floor(absDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((absDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((absDifference % (1000 * 60)) / 1000);

    const timeString = `${days} days, ${hours} hours, ${minutes} minutes` ;

    // Return whether the target is in the past or future
    return isPast ? [true,timeString] : [false,timeString];
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
            
            coursearr=coursearr["courseID"];
            
        } else if (user.studentID && user.studentID[0] === 'S') {
            coursearr = await courseAllot.findOne(
                { userID: user.studentID },
                { courseID: 1 }
            );
            
            coursearr=coursearr["courseID"];
          
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
        res.status(401).end("Unauthorized",error);
    }
}

//---------------------------------------------------------------------------------------------------------------------------------------
//        
//                            To View The assignment Teacher Route
//---------------------------------------------------------------------------------------------------------------------------------------
app.route("/:assignmentID")
.get(userValidate, async (req, res) => {


    let user = jwt.verify(req.cookies.session, "SECRET");
    const assignmentInstance = await assignment.findOne({ assignmentID: req.params.assignmentID }) || {};
    const subject=await course.findOne({courseID:assignmentInstance.subjectCode}); 
    const subjectName=subject?`${assignmentInstance.subjectCode}:${subject["courseName"]}`:NULL;
   
    const [isPast,timeRemaining]=calculateRemainingTime(assignmentInstance.endDate);
       
        if(user.teacherID)
       {


    try {
        // Get list of students who submitted the assignment
        // const submittedStudentIDs = await submission.find({ assignmentID: req.params.assignmentID },{submissonerID:1,graded:1,_id:0});
         // Fetch data of submitted students
         const submittedStudentsData = await submission.aggregate([
            {
              $match: { assignmentID: req.params.assignmentID }
            },
            {
              $lookup: {
                from: "students", // Collection name for students
                localField: "submissonerID",
                foreignField: "studentID",
                as: "studentDetails"
              }
            }, {
              $unwind: "$studentDetails"
            },
            {
              $project: {
                "studentDetails.Name": 1,
                submissionID:1,
                submissonerID:1,
                graded: 1,
                _id: 0
              }
            }
           
          ]);
          
         console.log("Submitted Student ID is ",submittedStudentsData)
         

const enrolledStudentIDs = await courseAllot.find(
    { courseID: { $in: [assignmentInstance.subjectCode] }, role: "Student" },
    { userID: 1, _id: 0 }
  );
  console.log("Enrolled Students:", enrolledStudentIDs);
  
  
  const enrolledUserIDs = enrolledStudentIDs.map(item => item.userID);
  console.log("Enrolled User IDs:", enrolledUserIDs);
  
 
  const submittedStudentIDs = submittedStudentsData.map(student => student.submissonerID);
  console.log("Submitted Student IDs:", submittedStudentIDs);
  
  
  const notSubmittedStudentIDs = enrolledUserIDs.filter(
    userID => !submittedStudentIDs.includes(userID)
  );
  console.log("Not Submitted Student IDs:", notSubmittedStudentIDs);
  
  // Fetch data of not submitted students
  const notSubmittedStudentsData = await student.find(
    { studentID: { $in: notSubmittedStudentIDs } }
  );
  console.log("Not Submitted Students:", notSubmittedStudentsData);
  
        // Pass the data to the EJS template
        res.render("assignment", {
            role:"Instructor",
            subjectName:subjectName,
            timeRemaining:timeRemaining,
            assignment:assignmentInstance,
            submittedStudents: submittedStudentsData,
            notSubmittedStudents: notSubmittedStudentsData
        });
    } catch (error) {
        console.error("Error fetching assignment details: ", error);
        res.status(500).send("Internal Server Error");
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------For Student-----------------------------------------------------
//-------------------------------------------------------------------------------------------------------------------------------
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
else if(user.studentID){

    
        let assignmentInstance, submittedStudentsData, notSubmittedStudentsData;

        // Fetch assignment details and calculate remaining time
        assignmentInstance = await assignment.findOne({ assignmentID: req.params.assignmentID }) || null;

        //Check any submission made by that user for this assignment
       
        const submissioninstance=await submission.findOne({assignmentID:req.params.assignmentID,submissonerID:user.studentID})||null;
        console.log(submissioninstance);
       

//-----------------------------------------IF SUBMISSION MADE--------------------------------------------------------------------


        if(!submissioninstance){

            res.render ("assignment",{
                role:"Student",
                isPast:isPast,
                subjectName:subjectName,
                assignment:assignmentInstance,
                submissionStatus:false,
                gradingStatus:"Yet To Submit",
                timeRemaining:(isPast)?`${timeRemaining} Lated`:`${timeRemaining} is remaining`,
                lastModified:"Not Submitted",
                fileSubmission:"Yet To Submit"})}


//--------------------------------------------OTHERWISE------------------------------------------------------------------------

        else{

            res.render("assignment",{
                role:"Student",
                isPast:isPast,
                subjectName:subjectName,
                assignment:assignmentInstance,
                submissionStatus:true,
                gradingStatus:submissioninstance.graded,
                timeRemaining:` Assignment was submitted ${calculateRemainingTime(submissioninstance.submittedTime)} early`,
                lastModified:submissioninstance.submittedTime,
                fileSubmission:submissioninstance.content
            })}
}
        
      });

app.get("/uploads/:filename",async(req,res)=>{

    res.redirect(`/uploads/${req.params.filename}`)

  

})


app.post("/:assignmentID",upload.single("files"),async(req,res)=>{
    
    const assignmentInstance = await assignment.findOne({ assignmentID: req.params.assignmentID }) || {};

    const numofprevsubmission = await submission.countDocuments({ assignmentID: assignmentInstance.assignmentID }) + 1;

    let submissionID=`S${assignmentInstance.assignmentID}:${numofprevsubmission.toString().padStart(3, '0')}`;
    let assignmentID=req.params.assignmentID;
   
    let user = jwt.verify(req.cookies.session, "SECRET");
    let submissonerID=user.studentID;
    let submittedTime=new Date();
    let content=req.file ? req.file.path : null;
    const submissioninstance=new submission({

        submissionID,
        assignmentID,
        submissonerID,
        submittedTime,
        content


    })
    await submissioninstance.save();
    

    res.end("Assignment Submitted Successfully");



})

module.exports = app;
