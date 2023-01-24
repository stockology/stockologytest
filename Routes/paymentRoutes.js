/** @format */

import express, { Router } from "express";
import {
  cancleSubscription,
  getRazorPayKey,
  paymentverification,
} from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
router.route("/subscribe").get(isAuthenticated);

// verify Payment and save reference in database
router.route("/paymentverification").post(isAuthenticated, paymentverification);

// Get Razorpay key
router.route("/razorpaykey").post(getRazorPayKey);

// cancel Subscription

router.route("/subscribe/cancel").delete(isAuthenticated, cancleSubscription);

export default router;
