const { sort } = require("shelljs");
const { Course } = require("../model/courseModel");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const util = require("util");
const { stringify } = require("querystring");
const { User } = require("../model/userModel");
const jwt = require("jsonwebtoken");
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
    if (queryStr.filter && queryStr.filter.startsWith("subject")) {
      let a = queryStr.filter.split("_")[1];
      this.query = this.query.find({ category: a });
    } else {
      this.query = this.query.find(queryStr);
    }
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
    const f = new Api(Course, req.query).filter().sort().paginate();
    const course = await f.query.populate("instructor");
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
    let val;
    if (req.authorized === true)
      val = await Course.findById({ _id: req.params.courseId })
        .populate({ path: "instructor", select: "+video" })
        .select("+video");
    else
      val = await Course.findById({ _id: req.params.courseId }).populate(
        "instructor"
      );
    res.status(200).json({
      status: "success",
      data: { val },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "Fail",
      message: "no data found",
      data: err,
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
    const course = await Course.insertMany({
      name: req.body.name,
      photo: `images/${req.files.image.name}`,
      video: `video/${req.files.video.name}`,
      instructor: req.user.id,
      category: req.body.category,
      price: req.body.price,
      summary: req.body.summary,
    });
    await fs.promises.writeFile(
      `./public/images/${req.files.image.name}`,
      req.files.image.data
    );
    await fs.promises.writeFile(
      `./public/video/${req.files.video.name}`,
      req.files.video.data
    );

    res.status(200).json({
      status: "true",
      message: "data inserted",
      course,
    });
  } catch (err) {
    console.log(err);
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
 console.log(req.params.courseId);
 const course = await Course.findById(req.params.courseId).select('+video')
  const videoPath = path.resolve(`public/video/${course.video}`);
  res.sendFile(videoPath);
}

async function getUserCourse(req, res, next) {
  try {
    let course = await User.findById(req.user.id)
      .populate({ path: "courses", select: "+video" })
      .select("+video");
    course = course.courses;
    res.status(200).json({
      data: course,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "not found" });
  }
}
async function boughtCourse(req, res, next) {
  try {
    //1) get token and check if it exists
    let course = req.params.courseId;
    let token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next();
    }
    //2) verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    //3) check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
  
    if (currentUser.courses.find(obj=>obj._id==course)) {
      req.authorized = true;
    }

    return next();
  } catch (err) {
    return res.status(500).json({ message: err });
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
  boughtCourse,
};
