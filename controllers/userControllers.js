import asyncHandler from "express-async-handler";
import User from "../models/userModals.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//this logIn controller
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log("user waa lahelay", user);

  if (user && (await bcrypt.compare(password, user.password))) {
    generateToken(res, user._id);
    res.status(201).json({
      status: "success",
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res
      .status(401)
      .json({ status: false, message: "Invalid email or password" });
  }
});

// this registration controller
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    _id: req.body.id,
    name: name.toLowerCase(),
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  user.save();

  if (user) {
    generateToken(res, user._id);
    res.status(201).send({
      status: "success",
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// this logOut controller
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User Logged out" });
};

// update profile controller
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  console.log("req.body", req.body);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.imageUrl = req.body.imageUrl || user.imageUrl;

  if (req.file) {
    console.log(req.file);
    user.imageUrl = req.file?.filename || "";
  }

  if (req.body.oldPassword && req.body.newPassword) {
    const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isMatch) {
      res.status(404).json({
        status: false,
        message: "Invalid oldPassword",
      });
      return;
    }

    user.password = await bcrypt.hash(req.body.newPassword, 10);
  }

  const updatedUser = await user.save();
  res.status(200).json({
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    imageUrl: updatedUser.imageUrl,
  });
});

//get profile controller

const getUserProfile = asyncHandler(async (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    imageUrl: req.user.imageUrl,
  };
  res.status(200).send({ user });
});

const updateUserImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!req.file) {
    return res.status(400).send({
      message: "File not found",
    });
  }
  user.imageUrl = req.file?.filename || "";

  const result = await user.save();

  res.status(200).json({
    status: "true",
    message: "User updated successfully",
    data: result,
  });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  getUserProfile,
  updateUserImage,
};
