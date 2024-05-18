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
  Balance,
  MonthPayments,
  getLastTransactions,
} from "../controllers/transactionControllers.js";
import { protect } from "../middleware/loginMiddleware.js";

const router = express.Router();

router.post("/create-Transaction", protect, createTransaction);
router.get("/get-Transaction", protect, getTransaction);
router.get("/last-transactions", protect, getLastTransactions);
router.delete("/delete-Transaction/:id", protect, deleteTransaction);
router.patch("/update-Transaction/:id", protect, updateTransaction);

// agrigatin transection
router.get("/Totalincome-aggrigation", protect, totalIncomeAggrigate);
router.get("/Totalexpense-aggrigation", protect, totalExpenseAggrigate);
router.get("/Balance", protect, Balance);
router.get("/MonthIncome", protect, MonthIncome);
router.get("/MonthExpense", protect, MonthExpense);
router.get("/month-payments", protect, MonthPayments);

export default router;
