import express from "express";
import { protect } from "../middleware/loginMiddleware.js";
import {
  createBudget,
  getBudget,
  deleteBudget,
  updateBudget,
} from "../controllers/budgetControllers.js";

const router = express.Router();

// Budget

router.post("/create_budget", protect, createBudget);
router.get("/get_budget", protect, getBudget);
router.delete("/delete_budget/:id", protect, deleteBudget);
router.patch("/update_budget/:id", protect, updateBudget);

export default router;
