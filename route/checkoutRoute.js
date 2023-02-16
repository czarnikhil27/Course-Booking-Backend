const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const checkoutSession = require("../controller/checkoutController");

router.get(
  "/checkout-session/:courseId",
  authController.protect,
  checkoutSession.createBookingCheckout,
  checkoutSession.checkoutSessions
);
module.exports = router;
