import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,

      toUpperCase: true,
    },
    description: {
      type: String,
      toLowerCase: true,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: Boolean,
      default: true,
      enum: [true, false],
    },
  },
  {
    timestamps: true,
  }
);

const transactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["INCOME", "EXPENSE"],
    },
    transactionDate: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      default: "",
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

const Transaction = mongoose.model("Transaction", transactionSchema);
const Category = mongoose.model("category", categorySchema);
export { Category, Transaction };
