const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Course must have a name"],
    unique: true,
  },
  photo: String,
  video:{
    type:String,
    select:false
  },
  instructor: { type: mongoose.Schema.ObjectId, ref: "Users" },
  category: {
    type: String,
    enum: ["finance", "science", "computer", "health", "business"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
  },
  priceDiscount: {
    type: Number,
    validator: {
      validate: function (value) {
        return value <= this.price;
      },
      message: "discount price ({VALUE}) should be below",
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, "Course must have a summary"],
  },
});

const Course = mongoose.model("Courses", courseSchema);
module.exports = { Course };
