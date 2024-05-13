import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRouter from "./routes/transactionRouter.js";
import categoryRouter from "./routes/categoryRouter.js";
import { errorHandler, notfound } from "./middleware/errorMiddleware.js";
import chalk from "chalk";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// this middle ware will make sure you can upload images in express.
app.use("/uploads", express.static("backend/uploads"));

const PORT = process.env.PORT;

connectDB();
app.use("/api/transactions", transactionRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/users", userRoutes);
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Hello World",
  });
});

app.use(notfound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(chalk.yellow.bold(`Server Started on port ${PORT}`));
});
