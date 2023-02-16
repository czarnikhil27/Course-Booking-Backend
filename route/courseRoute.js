const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const courseController = require("../controller/courseController");

router.get("/",  courseController.getCourse);
router.post(
  "/create-course/:instructorId",
  authController.protect,
  courseController.createCourse
);
router.get(
  "/get-category",
  authController.protect,
  courseController.getCategory
);
router.get("/get-video", courseController.getVideo);
router.get(
  "/user-courses",
  authController.protect,
  courseController.getUserCourse
);
router.get("/:courseId", courseController.getCourseById);

module.exports = router;
