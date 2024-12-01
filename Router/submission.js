const express=require("express");
const jwt=require("jsonwebtoken")
const app=express();
const cookieParser = require("cookie-parser");

const {course,courseAllot}=require("../Models/courseModel");
const {assignment,submission}=require("../Models/assignment");
const {student}=require("../Models/userModel")


async function  validateUser(req,res,next){

try{

    if (!req.cookies || !req.cookies.session) {
        return res.redirect("/"); // Redirect to homepage
      }
    var {submissionID} = req.params;
    
    submissionID = submissionID.slice(2, 9);
    console.log("Course is ",submissionID)
    
    const user = jwt.verify(req.cookies.session,"SECRET");
    if(user.studentID){
        const courseAlloted=await courseAllot.find({userID:user.studentID,role:"Student"},{courseID:1,_id:0});

    if(courseAlloted[0]["courseID"].includes( submissionID )) {
        next();
    } 
    else {
        res.status(403).send("Access denied");
    }


    }
    else {
    const courseAlloted = await courseAllot.find( {userID:user.teacherID,role:"Instructor"} , {courseID:1,_id:0} );
   

    if(courseAlloted[0]["courseID"].includes( submissionID )) {
        next();
    }

    else {
        
        res.status(403).send("Access denied");
    }
}
}
catch(error){


    console.log("Error in Validating Courses ",error);
    res.status(500).redirect("/");
}
}
app.use(cookieParser());

app.route("/:submissionID")
    
.get(validateUser,async(req,res)=>{

    const submissionInstance=await submission.findOne({submissionID:req.params.submissionID});
    const assignmentID=req.params.submissionID.slice(1,13);
    console.log(assignmentID);
    const assignmentInstance=await assignment.findOne({assignmentID:assignmentID});
    const studentName=await student.findOne( { studentID:submissionInstance[ "submissonerID" ] },{Name:1,_id:0} );

    let courseName=await course.findOne({courseID:assignmentInstance["subjectCode"]},{courseName:1,_id:0});
    courseName=courseName["courseName"];
    console.log(courseName)
    const subjectName=`${assignmentInstance["subjectCode"]}:${courseName}`;
    console.log("Assignment is ",assignmentInstance,"\nSubmission is",submissionInstance,"Student Name",studentName);

    res.render("submissionpage",{assignment:assignmentInstance,submission:submissionInstance,subjectName:subjectName,studentName:studentName["Name"]});




})



. post(async (req, res) => {
    const marks = req.body.marks; // Ensure marks is parsed correctly
    console.log("Marks is ", req.body);
    const submissionID = req.params.submissionID;
    console.log("submission is ", submissionID);
    const assignmentID =submissionID.slice(1,13);
    const assignmentInstance = await assignment.findOne({
      assignmentID: assignmentID,
    });
    const submissionInstance = await submission.findOne({
      submissionID: req.params.submissionID,
    });

    // Validate marks
    if (marks >= 0 && marks <= assignmentInstance["maxMarks"]) {
      submissionInstance["graded"] = marks.toString();
    } else {
      return res.status(403).send("Marks is Out of Range");
    }

    await submissionInstance.save();
    res.end("Graded Successfully");
  });


module.exports=app;