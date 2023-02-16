const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide your name"],
  },
  email: {
    type: String,
    required: [true, "please provide email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide valid email"],
  },
  courses: [{ type: mongoose.Schema.ObjectId, ref: "Course" }],
  role: {
    type: String,
    enum: ["user", "instructor", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: ["true", "please confirm your password"],
    validate: {
      //only works on create and save
      validator: function (element) {
        return element == this.password;
      },
      message: "password not same",
    },
  },
  passwordChangedAt: {
    type: Date,
    default: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  courses: [{ type: mongoose.Schema.ObjectId, ref: "Courses" }],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date;
});

userSchema.pre("/^find/", function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const timeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimeStamp < timeStamp;
  }
  return false;
};

userSchema.methods.forgotPaswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("Users", userSchema);
module.exports = { User };
