const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Student = require("/home/sourabh/CSC-503/Project/Models/userModel"); // Adjust path to your student model

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/project", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

// Read the JSON file
const filePath = "/home/sourabh/Downloads/MOCK_DATA(1).json";
fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    try {
        const students = JSON.parse(data); // Parse JSON data

        // Insert data into the student collection
        Student.insertMany(students)
            .then(() => {
                console.log("Student data successfully populated!");
                mongoose.connection.close(); // Close connection after insertion
            })
            .catch((error) => {
                console.error("Error inserting student data:", error);
            });
    } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
    }
});
