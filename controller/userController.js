const { User } = require("../model/userModel.js");

async function filteredObj(obj, ...allowedFields) {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
}
async function updateMe(req, res, next) {
  try {
    // create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "route not for password update",
      });
    }
    //filter forbidden parameters like admin, etc
    const filteredBody = await filteredObj(req.body, "name", "email");
    //update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true, // returns updated object
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        updatedUser,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
}

async function deleteMe(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    return res.status(204).json({
      status: "success",
      message: "user deleted succesfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "fail",
      message: err,
    });
  }
}
module.exports = { updateMe, deleteMe };


