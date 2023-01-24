/** @format */

import express, { Router } from "express";
import {
  contact,
  courserequest,
  getDashboardStats,
} from "../controllers/othercontroller.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// contact Form
router.route("/contact").post(contact);

// Request form
router.route("/courserequest").post(courserequest);

// Get Admin Dashboard stats
router
  .route("/admin/stats")
  .get(isAuthenticated, authorizeAdmin, getDashboardStats);

export default router;
