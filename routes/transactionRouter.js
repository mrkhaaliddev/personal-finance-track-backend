import express from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransaction,
  updateTransaction,
  totalIncomeAggrigate,
  totalExpenseAggrigate,
  MonthIncome,
  MonthExpense,
} from "../controllers/transactionControllers.js";
import { protect } from "../middleware/loginMiddleware.js";

const router = express.Router();

router.post("/create-Transaction", protect, createTransaction);
router.get("/get-Transaction", protect, getTransaction);
router.delete("/delete-Transaction/:id", protect, deleteTransaction);
router.patch("/update-Transaction/:id", protect, updateTransaction);

// agrigatin transection
router.get("/Totalincome-aggrigation", protect, totalIncomeAggrigate);
router.get("/Totalexpense-aggrigation", protect, totalExpenseAggrigate);
router.get("/MonthIncome", protect, MonthIncome);
router.get("/MonthExpense", protect, MonthExpense);

export default router;
