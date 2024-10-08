const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncError");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

// Register a User

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  // console.log(req.body.avatar)
  try {

    const myCloud = await cloudinary.uploader.upload(req.body.avatar,{
      folder: "avatars",
      width: 150,
      crop: "scale",
      timeout: 60000
    });

    //  console.log("MY Cloud" , myCloud)
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    sendToken(user, 201, res);
  } catch (error) {
    console.log(error);
  }

  // const token = user.getJWTToken();
  // // console.log(token)

  // res.status(201).json({
  //     success : true,
  //     token
  // })
});

// Login User

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  // console.log("Req body" , req.body)

  // Checking if user has given password and email both

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email and Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  // console.log(user)

  if (!user) {
    // console.log("skipped")
    return next(new ErrorHandler("Invalid Email or Password"), 401);
  }

  const isPasswordMatched = await user.comparePassword(password);
  console.log(isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password"), 401);
  }

  // const token = user.getJWTToken();
  // // console.log(token)

  // res.status(200).json({
  //     success : true,
  //     token
  // })

  sendToken(user, 200, res);
});

// Logout User

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

// Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found"), 404);
  }

  // Get resetPassword Token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`;

  const message = `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it .`;

  try {
    await sendEmail({
      email: user.email,
      subject: `E-Store Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Creating token Hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

// Get User Details

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    sucess: true,
    user,
  });
});

// Update User Password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

// Update User profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }

  try {
    if (req.body.avatar && req.body.avatar !== "") {
      const user = await User.findById(req.user.id);
      const imageId = user.avatar.public_id;
  
      // Check if imageId exists before destroying
      if (imageId) {
        await cloudinary.uploader.destroy(imageId);
      }
  
      const myCloud = await cloudinary.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
        timeout: 60000
      });
  
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
  
    // Update user with new data
    const user = await User.findByIdAndUpdate(req.user.id, newUserData);
    if (!user) {
      return next(new ErrorHandler("User doesn't exist to update", 400));
    }
  
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    // Handle Cloudinary or other errors
    console.error("Profile Update Error:", error);
    return next(new ErrorHandler("Profile update failed", 500));
  }
  
});

// Get all users(admin)

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get Single User (admin)

exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not exist with id : ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Role -- ADMIN
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // We will add cloudinary later

  const user = await User.findByIdAndUpdate(req.params.id, newUserData);

  if (!user) {
    return next(
      new ErrorHandler(`User doesn't exist with id : ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
  });
});

// Delete User
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  // We will remove cloudinary later

  if (!user) {
    return next(
      new ErrorHandler(`User doesn't exist with id : ${req.params.id}`, 400)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
