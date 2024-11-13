const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    teacherID: { type: String, required: true },
    Name: { type: String, required: true },
    Email: { type: String, required: true },
    Password:{type:String,required:true,default:"NOT SET"},
    DOB: { type: Date, required: true }, // Added type and made required
    gender: { type: String, enum: ['Male', 'Female'], required: true }, 
    token:{type:String,default:null,minlength:64,maxlength:64},
    expiretime:{type:String,default:null}

});



const studentSchema=new mongoose.Schema({


    studentID:{type:String,required:true},
    Name: { type: String, required: true },
    Email: { type: String, required: true,unique:true },
    Password:{type:String,required:true,default:"NOT SET"},
    DOB: { type: Date, required: true }, // Added type and made required
    gender: { type: String, enum: ['Male', 'Female'], required: true } ,
    token:{type:String,default:null,minlength:64,maxlength:64},
    expiretime:{type:String,default:null}

});



const adminSchema=new mongoose.Schema({


    adminID:{type:String,required:true},
    Password:{type:String,required:true}
});

const admin=mongoose.model("Admin",adminSchema);
const student=mongoose.model("Student",studentSchema);
const teacher = mongoose.model("Teacher", teacherSchema);

module.exports = {student,teacher,admin};
