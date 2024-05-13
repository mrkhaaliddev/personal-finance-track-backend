import express from "express";
import multer from "multer";

const router = express.Router();
import {
  loginUser,
  registerUser,
  logoutUser,
  // forgetPassword,
  // resetPassword,
  getUserProfile,
  updateUserProfile,
} from "../controllers/userControllers.js";
import userValidator from "../validators/userValidator.js";
import { protect } from "../middleware/loginMiddleware.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "backend/uploads");
  },

  filename: function (req, file, cb) {
    const [filename, extension] = file.originalname.split(".");
    // console.log(file);
    cb(null, filename + "-" + Date.now() + "." + extension);
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
// router.post("/forget-Password", forgetPassword);
// router.get("/forget-Password/:id/:token", resetPassword);

export default router;
