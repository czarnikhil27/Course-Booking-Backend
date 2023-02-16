const jwt = require("jsonwebtoken");
const { User } = require("../model/userModel.js");
const { sendEmail } = require("../utils/email.js");

const cookieOptions = {
  expires: new Date(Date.now() + 90 * 24 * 50 * 60 * 1000),
  secure: true, //cookie sent on encryption connection - https
  httpOnly: true, // browser can't change the cookie - only send while requesting
};
async function signup(req, res, next) {
  try {
    console.log("called")
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role:req.body.role
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
    });
    newUser.password = undefined;
    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
        role:newUser.role,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "sdsdd",
      message: err,
    });
  }
}

async function login(req, res, next) {
  try{
  const { email, password } = req.body;

  //check if email and password exists
  if (!email || !password) {
    return res.status(400).json({
      message: "please provide email and password",
    });
  }
  // const user = User.findOne({email:email}).select('+password');
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      message: "incorrect email or password",
    });
  }
  //check if user exists and password exists
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
  cookieOptions.secure = false;
  res.cookie("jwt", token, cookieOptions);
  res.status(200).json({
    role:user.role,
    token,
  });
}
catch(err){
  console.log(err)
}
}

async function protect(req, res, next) {
  try {
    //1) get token and check if it exists
    console.log("77called")
    let token = "";
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "please login",
      });
    }
    //2) verify token
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    //3) check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(404).json({
        status: "fail",
        message: "user doesn't exist",
      });
    }
    //4) check if user changed password after jwt was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "please login again",
      });
    }
    req.user = currentUser;
    next();
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: err,
    });
  }
}

async function forgotPassword(req, res, next) {
  try {
    //1 get user based on posted email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "no user found",
      });
    }
    //2 generate random token
    const resetToken = user.forgotPaswordResetToken();

    await user.save({ validateBeforeSave: false }); // removes password that was not sent by the user

    //3 send the token in email
    const resetURL = `${req.protocol}://{req.get('host')}/api/v1/users/reset-password/${resetToken}`;
    const message = `forgot password ${resetURL}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "your password reset token (vaid for 10 minutes)",
        message,
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({
        status: "fail",
        message: err,
      });
    }
    return res.status(200).json({
      status: "success",
      message: "token to email",
    });
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: err,
    });
  }
}
async function updatePassword(req, res, next) {
  try {
    //1 get user from collection
    const user = await User.findById(req.user.id).select("+password");
    // check if posted password is correct
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return res.status(401).json({
        status: "fail",
        message: "incorrect password",
      });
    }
    // if password correct update
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    return res.status(200).json({
      status: "success",
      message: "password updated succesfully",
    });
    //login with new password
  } catch (err) {
    return res.status(500).json({
      status: "fail",
      message: err,
    });
  }
}
module.exports = { signup, login, protect, forgotPassword, updatePassword };
