/** @format */

import express from "express";
import {
  addToPlaylist,
  changePassword,
  deleteMyProfile,
  deleteUser,
  forgetPassword,
  getAllUser,
  getMyProfile,
  login,
  logout,
  register,
  removeFromPlaylist,
  resetPassword,
  updateProfile,
  updateProfilePicture,
  updateUserRole,
} from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";
const router = express.Router();
// To register a new user

router.route("/register").post(singleUpload, register);
// Login

router.route("/login").post(login);

// Logout
router.route("/logout").get(logout);

// Get My Profile
router.route("/me").get(isAuthenticated, getMyProfile);

// Delete My Profile
router.route("/me").delete(isAuthenticated, deleteMyProfile);

// Change Password

router.route("/changepassword").put(isAuthenticated, changePassword);
// update profile

router.route("/updateprofile").put(isAuthenticated, updateProfile);
// UpdateProfilePiture

router
  .route("/updateprofilepicture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);
// Forget Password

router.route("/forgetpassword").post(forgetPassword);
// reset Password
router.route("/resetpassword/:token").put(resetPassword);

// AddtoPlalist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);
// Remove from plalist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);

// Admin Routes
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUser);

router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeAdmin, updateUserRole)
  .delete(isAuthenticated, authorizeAdmin, deleteUser);

export default router;
