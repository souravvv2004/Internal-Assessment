const mongo=require("mongoose");
const courseAllotSchema=new mongo.Schema({



    userID:{type:String,minlength:6,maxlength:6,require:true,unique:true},
    role:{ type: String, enum: ['Instructor', 'Student'], required: true } ,
    courseID:[{type:String,minlength:3,maxlength:7,require:true}],

});
const courseSchema=new mongo.Schema({
    courseID:{type:String,minlength:7,maxlength:7,require:true},
    courseName:{type:String}
})
const courseAllot=mongo.model("courseAllot",courseAllotSchema);
const course=mongo.model("course",courseSchema);
module.exports={course,courseAllot}