const express = require("express");
const app = express();
const cron = require("node-cron");
const shell = require("node-cron");
const router = require("./route/userRoute");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const moongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("./cors");
const userRoute = require("./route/userRoute");
const courseRoute = require("./route/courseRoute");
const checkoutRoute = require("./route/checkoutRoute");
const fs = require("fs");
const fileupload = require("express-fileupload");
const compression = require('compression')
app.use(helmet());
//body parser
app.use(express.json({ limit: "10kb" }));
//data sanitize for NOSql injection
app.use(moongoSanitize());

//data sanitize for HTML XSS
app.use(xss());
app.use(compression())
//parameter pollution prevention
app.use(
  hpp({
    whitelist: ["duration"], // will allow multiple durations in query parameter
  })
);

// const limit = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "please try again in an hour",
// });

app.use(cors);
//rate limiter
//app.use("/", limit);
app.use(express.static("public"));
app.use(fileupload());
app.use("/practice-course/v1/user", userRoute);
app.use("/practice-course/v1", checkoutRoute);
app.use("/practice-course/v1/course", courseRoute);

//test
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

module.exports = app;
