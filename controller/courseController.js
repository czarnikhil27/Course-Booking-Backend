const { sort } = require("shelljs");
const { Course } = require("../model/courseModel");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { stringify } = require("querystring");
const { User } = require("../model/userModel");
class Api {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObject = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObject[el]);
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); //g will work for multiple variables

    queryStr = JSON.parse(queryStr);
    console.log("line21")
    console.log(queryStr);
    if(queryStr.filter && queryStr.filter.startsWith('subject'))
    {
     let a = queryStr.filter.split('_')[1];
     console.log("line26")
     console.log(a);
     this.query = this.query.find({category:a});
    }
    else{
    this.query = this.query.find(queryStr);}
    return this;
  }
  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort;
      this.query = this.query.sort((a, b) => {
        return a[sortBy] - b[sortBy];
      });
    }
    return this;
  }

  paginate() {
    let page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
async function getCourse(req, res, next) {
  try {
    const f = new Api(Course, req.query).filter().sort();
    const course = await f.query;

    res.status(200).json({
      status: "success",
      length: course.length,
      data: course,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
}
async function getCourseById(req, res, next) {
  try {
    console.log(req.params.courseId);

    const val = await Course.findById({ _id: req.params.courseId });
    console.log(val);
    res.status(200).json({
      status: "success",
      data: { val },
    });
  } catch (err) {
    res.status(404).json({
      status: "Fail",
      message: "no data found",
    });
  }
}
const writeImage = (req, res) => {
  const created = promisify(
    fs.writeFile(
      `./public/images/${req.files.image.name}`,
      req.files.image.data,
      (err) => {
        return res.status(404).json({
          status: "fail",
          message: "unscessful",
        });
      }
    )
  );
  return created;
};
async function createCourse(req, res, next) {
  try {
    // console.log(`${__dirname}/public/images/${req.files.image.name}`);
    console.log("line94");
    console.log(req.files.video);
    fs.writeFile(
      `./public/images/${req.files.image.name}`,
      req.files.image.data,
      (err) => {
        return res.status(404).json({
          status: "fail",
          message: "unscessful",
        });
      }
    );
    // fs.writeFile(
    //   `./public/video/${req.files.video.name}`,
    //   req.files.video.data,
    //   (err) => {
    //     return res.status(404).json({
    //       status: "fail",
    //       message: "unscessful",
    //     });
    //   }
    // )
    const course = await Course.insertMany({
      name: req.body.name,
      photo: `../public/images/${req.files.image.name}`,
      instructor: req.params.instructorId,
      category: req.body.category,
      price: req.body.price,
      summary: req.body.summary,
    });
    res.status(201).json({
      status: "true",
      message: "data inserted",
      course,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: "please enter all the values",
    });
  }
}
async function getCategory(req, res, next) {
  try {
    res.status(200).json({
      data: ["finance", "science", "computer", "health", "business"],
      message: "success",
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: "Please try lataer",
    });
  }
}
async function streamVideo(req, res, next) {
  try {
    const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }
    const videoPath = "./public/video/1.mp4";
    const videoSize = fs.statSync("./public/video/1.mp4").size;
    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "not found",
    });
  }
}
async function getVideo(req, res, next) {
  const videoPath = path.resolve("public/video/1.mp4");
  res.sendFile(videoPath);
}

async function getUserCourse(req, res, next) {
  try {
    console.log("called");
    console.log(req.user.id);
    let course = await User.findById(req.user.id).populate('courses');
    course=course.courses;
    res.status(200).json({
      data:course
    });
  } catch (err) {
    console.log(err)
    res.status(404).json({ message: "not found" });
  }
}
module.exports = {
  getCourse,
  createCourse,
  getCategory,
  streamVideo,
  getCourseById,
  getVideo,
  getUserCourse,
};
