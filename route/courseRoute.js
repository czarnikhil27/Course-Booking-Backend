const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const courseController = require("../controller/courseController");
const bookingController  = require('../controller/checkoutController')
router.get("/", courseController.getCourse);
router.post(
  "/create-course",
  authController.protect,
  bookingController.createBookingCheckout,
  courseController.createCourse
);
router.get("/get-category", courseController.getCategory);
router.get("/get-video/:courseId",courseController.boughtCourse, courseController.getVideo);
router.get(
  "/user-courses",
  authController.protect,
  courseController.getUserCourse
);
router.get("/:courseId",courseController.boughtCourse, courseController.getCourseById);

module.exports = router;
