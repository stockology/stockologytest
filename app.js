/** @format */

import express from "express";
import { config } from "dotenv";
import ErrorMidlerware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";

config({
  path: "./config/config.env",
});
const app = express();
// Using middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());
// importing and using Routes
import course from "./Routes/courseRoutes.js";
import user from "./Routes/userRoutes.js";
import payment from "./Routes/paymentRoutes.js";
import other from "./Routes/otherRoutes.js";
app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

app.use(ErrorMidlerware);
export default app;
