import express from "express";
import { protect } from "../middleware/loginMiddleware.js";
import {
  createBudget,
  getBudget,
  deleteBudget,
  updateBudget,
  totalIncomeAggrigate,
  totalExpenseAggrigate,
  MonthIncome,
  MonthExpense,
  graphMonthlyData,
} from "../controllers/budgetControllers.js";

const router = express.Router();

// Budget

router.post("/create_budget", protect, createBudget);
router.get("/get_budget", protect, getBudget);
router.delete("/delete_budget/:id", protect, deleteBudget);
router.patch("/update_budget/:id", protect, updateBudget);

// Aggrigation router
router.get("/totalIncome_aggrigation", protect, totalIncomeAggrigate);
router.get("/totalExpense_aggrigation", protect, totalExpenseAggrigate);
router.get("/monthIncome_aggrigation", protect, MonthIncome);
router.get("/monthExpense_aggrigation", protect, MonthExpense);
router.get("/graph_monthly_data", protect, graphMonthlyData);
export default router;
