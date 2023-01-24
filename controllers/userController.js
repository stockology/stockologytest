/** @format */
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHnadler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { sendToken } from "../utils/send Token.js";
import { sendEmail } from "../utils/SendEmail.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { Stats } from "../models/Stats.js";
export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password || !file)
    return next(new ErrorHnadler("Please Enter All Field", 400));
  let user = await User.findOne({ email });
  if (user) return next(new ErrorHnadler("User Already Exist", 409));
  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  // Upload file on cloudinary;
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });
  sendToken(res, user, "Registered Successfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  // console.log("email", email, "password", password);
  if (!email || !password)
    return next(new ErrorHnadler("Please Enter All Field", 400));
  const user = await User.findOne({ email }).select("+password");
  if (!user)
    return next(new ErrorHnadler("Incorrect Email or Password  ", 401));

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHnadler("Inccorect Email or Password", 401));

  sendToken(res, user, `Welcome Back ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      success: true,
      message: "Logged Out Successfuly",
    });
});
export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new ErrorHnadler("Please enter all field", 400));
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHnadler("Incorrect old password"));
  user.password = newPassword;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Change Successfully",
  });
});
export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (name) user.email = email;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Updated  Successfully",
  });
});

export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  // coloudnery :Todo
  const file = req.file;

  const user = await User.findById(req.user._id);

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Picture Updated Successfully",
  });
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHnadler("User not Found", 400));
  const resetToken = await user.getResetToken();
  await user.save();

  // http://localhost:3000/resetpassword/fafaacacacaccadaadada

  // Send Token via
  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `Click on the link to reset password. ${url}.If you have not requested then please ignore`;
  await sendEmail(user.email, "Stockology Reset Password", message);
  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to${user.email} `,
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(new ErrorHnadler("Token is invalid or has been expired"));
  user.password = req.body.password;
  user.resetPasswordEpire = undefined;
  user.resetPasswordEpire = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password Change  Successfully",
  });
});

export const addToPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body, id);
  if (!course) return next(new ErrorHnadler("Invalid Coruse Id", 404));
  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });
  if (itemExist) return next(new ErrorHnadler("Item Alredy Exist", 409));
  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });
  await user.save();
  res.status(200).json({
    success: true,
    message: "Added To Playlist",
  });
});

export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHnadler("Invalid Coruse Id", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });
  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({
    success: true,
    message: "Remove from  Playlist",
  });
});

// Admin Controllers

export const getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    message: "Remove from  Playlist",
  });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHnadler("User Not Found", 404));
  if (user.role === "user") user.role = "admin";
  else user.role = "user";
  await user.save();
  res.status(200).json({
    success: true,
    message: "Role Updated",
  });
});

export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHnadler("User Not Found", 404));
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  // cancel Subscription

  await user.remove();
  res.status(200).json({
    success: true,
    message: "User deleted Successfully",
  });
});

export const deleteMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  // cancel Subscription

  await user.remove();
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "User deleted Successfully",
    });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);
  const subscription = await User.find({ "subscription.status": "active" });
  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now());
  await stats[0].save();
});
