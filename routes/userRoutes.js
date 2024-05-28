import express from "express";
import fs from "fs";
import multer, { diskStorage } from "multer";

const router = express.Router();
import {
  loginUser,
  registerUser,
  logoutUser,
  // forgetPassword,
  // resetPassword,
  getUserProfile,
  updateUserProfile,
  updateUserImage,
} from "../controllers/userControllers.js";
import userValidator from "../validators/userValidator.js";
import { protect } from "../middleware/loginMiddleware.js";

const storage = diskStorage({
  destination: function (req, file, cb) {
    const uploadFile = "backend/uploads";
    fs.mkdirSync(uploadFile, { recursive: true });
    cb(null, uploadFile);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/", userValidator, registerUser);
router.post("/login-user", loginUser);
router.post("/logout-user", protect, logoutUser);
router.post(
  "/update-profile",
  protect,
  upload.single("image"),
  updateUserProfile
);
router.get("/Get-Profile", protect, getUserProfile);
router.put(
  "/update-image",
  upload.single("imageUrl"),
  protect,
  updateUserImage
);
// router.post("/forget-Password", forgetPassword);
// router.get("/forget-Password/:id/:token", resetPassword);

export default router;
