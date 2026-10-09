const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Student = require("./models/Student");


require ("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
.connect(process.env.MONGO_URI)
.then(() => {
  console.log("Connected to MongoDB");
})
.catch((error) => {
  console.log("MongoDB connection error:", error);
})

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch {
    res.status(500).json({message: "Unable to retrieve students."});
  }
});

function validStudent(body) {
  return body && typeof body.name === "string" && body.name.trim() &&
    typeof body.course === "string" && body.course.trim() &&
    typeof body.age === "number" && Number.isInteger(body.age) && body.age > 0;
}

app.post("/students", async (req, res) => {
  if (!validStudent(req.body)) {
    return res.status(400).json({message: "Enter a name, course, and age."});
  }
  try {
    const student = new Student({
      name: req.body.name.trim(),
      course: req.body.course.trim(),
      age: req.body.age
    });
    await student.save();
    res.status(201).json(student);
  } catch {
    res.status(500).json({message: "Unable to add student."});
  }
});

app.put("/students/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({message: "Invalid student ID."});
  }
  if (!validStudent(req.body)) {
    return res.status(400).json({message: "Enter a name, course, and age."});
  }
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, {
      name: req.body.name.trim(),
      course: req.body.course.trim(),
      age: req.body.age
    }, {new: true, runValidators: true});
    if (!student) {
      return res.status(404).json({message: "Student not found."});
    }
    res.json(student);
  } catch {
    res.status(500).json({message: "Unable to update student."});
  }
});

app.delete("/students/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({message: "Invalid student ID."});
  }
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({message: "Student not found."});
    }
    res.json({message: "Student deleted successfully."});
  } catch {
    res.status(500).json({message: "Unable to delete student."});
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
