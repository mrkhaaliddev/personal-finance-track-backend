import express from "express";
import {
  create_Categories,
  delete_Categories,
  get_Categories,
  update_Categories,
} from "../controllers/categoryControllers.js";
import { protect } from "../middleware/loginMiddleware.js";

const router = express.Router();

//category routes

router.post("/create_category", protect, create_Categories);
router.get("/get_category", protect, get_Categories);
router.delete("/delete_category/:id", protect, delete_Categories);
router.patch("/update_category/:id", protect, update_Categories);

export default router;
