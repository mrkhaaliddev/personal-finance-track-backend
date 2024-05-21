import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    annualIncome: {
      type: Number,
      required: true,
    },
    annualExpense: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      // unique: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BudgetModal = mongoose.model("Budget", budgetSchema);
export default BudgetModal;
