const mongo=require("mongoose");

//assignment Schema
const assignmentSchema=new mongo.Schema({

    assignmentID:{type:String,required:true,unique:true},
    assignmentName:{type:String,required:true},
    
    subjectCode:{type:String},
    createdBy:{type:String,required:true ,required:true},
    endDate:{type:Date},
    maxMarks:{type:Number},
    content:{type:String},
    assignmentPath:{type:String}
    //submitted:{type:String,enum:["Submitted","Not Submitted"],required:true,default:"Not Submitted"}
});
//Submission Schema
const submissionSchema=new mongo.Schema({

    submissionID:{type:String,required:true,unique:true},
    assignmentID:{type:String,required:true},
    submissonerID:{type:String,required:true},
    submittedTime:{type:Date,required:true},
    content:{type:String,required:true}



});




const assignment=mongo.model("assignment",assignmentSchema);
const submission=mongo.model("submission",submissionSchema);
module.exports={assignment,submission}; 