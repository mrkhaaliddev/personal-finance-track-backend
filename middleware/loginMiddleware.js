import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import cookieParser from "cookie-parser";
import User from "../models/userModals.js";
// router kan waxoo awood kusiina inuu user uu access gareeyo router walbo aad uga dhigto middleware important router
const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;
  console.log("This is the Token", token);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("decoded", decoded);
      req.user = await User.findById(decoded.userId).select("-password"); // select waxa ay kareebe in password lasoo aqriyo becouse hashed wye
      console.log("req.user", req.user);

      next();
    } catch {
      res.status(401);
      throw new Error("Not authorized, invalid token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };

//more simplified version of the code above

// const protect = asyncHandler(async (req, res, next) => {
//   const token = req.cookies.jwt;
//   console.log("This is the Token from protect middleware:", token); // Ensure this logs correctly

//   if (!token) {
//     return res.status(401).json({ message: "Not authorized, no token" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.userId).select("-password");
//     next();
//   } catch (error) {
//     console.error("Token verification error:", error);
//     return res.status(401).json({ message: "Not authorized, invalid token" });
//   }
// });
