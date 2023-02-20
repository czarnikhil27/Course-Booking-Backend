const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Course } = require("../model/courseModel");
const {User} = require('../model/userModel')
const db =
  "mongodb+srv://czarnikhil:Babajirocks12@cluster0.s2o7utp.mongodb.net/?retryWrites=true&w=majority";
console.log(db);
const connect = async () => {
  try {
    mongoose.connect(db).then(console.log("connected"));
  } catch (error) {
    console.log(error);
  }
};
connect();
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/MOCK_DATA.json`, "utf-8")
);

const importCourseData = async () => {
  try {
    await Course.insertMany(tours);
    console.log("data loaded");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
const deleteAllCourseData = async () => {
  try {
    await Course.deleteMany();
    console.log("data deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteAllUserData = async () => {
  try {
    await User.deleteMany();
    console.log("data deleted");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === "--import") {
  importCourseData();
} else if (process.argv[2] === "--delete") {
  deleteAllCourseData();
}

else if (process.argv[2] === "--deleteUser") {
  deleteAllUserData();
}
