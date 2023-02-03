/** @format */

import express from "express";
import { config } from "dotenv";
import ErrorMidlerware from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

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
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
// importing and using Routes
import course from "./Routes/courseRoutes.js";
import user from "./Routes/userRoutes.js";
import payment from "./Routes/paymentRoutes.js";
import other from "./Routes/otherRoutes.js";
app.use("/api/v1", course);
app.use("/api/v1", user);
app.use("/api/v1", payment);
app.use("/api/v1", other);

app.get("/", (req, res) =>
  res.send(
    `<h1>Heloo Stockology <a href="${process.env.FRONTEND_URL}">Go Front end</a></h1>`
  )
);
app.use(ErrorMidlerware);
export default app;
