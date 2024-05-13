import asyncHandler from "express-async-handler";
import { Transaction } from "../models/transactionModals.js";

const createTransaction = asyncHandler(async (req, res) => {
  const { type, transactionDate, name, amount, category, description } =
    req.body;

  if (!req.body) {
    return res.status(400).send({
      status: "false",
      message: "Everything is required",
    });
  }

  try {
    const newTransaction = await Transaction.create({
      type: type.toUpperCase(),
      transactionDate,
      name,
      amount,
      category,
      description,
      user: req.user._id,
    });

    await newTransaction.save();

    res.send({
      status: "success",
      message: "Transaction created successfully",
      data: newTransaction,
      user: req.user._id,
    });
  } catch (error) {
    res.status(500).send({
      status: "error",
      message: "Server error",
      details: error.message,
    });
  }
});

const getTransaction = async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id });
  console.log(req.user.name);

  res.status(200).json({
    status: "true",
    data: transactions || "there is no transaction",
  });
};

const deleteTransaction = async (req, res) => {
  //   console.log(req.params);
  const { id } = req.params;
  console.log(id);

  try {
    const result = await Transaction.findOneAndDelete({
      user: req.user._id,
      _id: id,
    });

    if (!result) {
      res.status(400).json({
        status: "false",
        message: "Transaction does not exist",
      });
      return;
    }
    res.status(200).json({
      status: "true",
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.log(err.message);
  }
};

const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { type, transactionDate, name, amount, category, description } =
    req.body;

  const updatedTransaction = {
    type: type,
    transactionDate,
    name,
    amount,
    category,
    description,
  };

  const result = await Transaction.findByIdAndUpdate(id, updatedTransaction, {
    user: req.user._id,
    new: true,
  });
  if (!result) {
    res.status(400).send({
      status: "false",
      message: "Transaction does not exist",
    });
    return (satisfies = false);
  }
  res.status(201).json({
    status: "true",
    message: "Transaction updated successfully",
    data: result,
  });
};

// agrigation controll

// this is giving you total income
const totalIncomeAggrigate = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      {
        $match: {
          type: "INCOME",
        },
      },

      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
        },
      },
    ]);
    res.send({
      status: "true",
      data: value,
      totalIncome: value.totalIncome,
    });
    // res.status(200).send({ status: "true", message: "aggrigated data" });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ status: "false", message: "Something went wrong", error: err });
  }
};

// this is giving you total expense
const totalExpenseAggrigate = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      [
        {
          $match: {
            type: "EXPENSE",
          },
        },

        {
          $group: {
            _id: null,
            totalExpense: {
              $sum: "$amount",
            },
          },
        },
      ],
    ]);

    res.status(200).send({
      status: "true",
      data: value,
      totalExpense: value.totalExpense,
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ status: "false", message: "Something went wrong", error: err });
  }
};

// this is giving you the current month

const now = new Date(); // Current date
const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of this month
const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of this month

// Format dates to MongoDB's ISODate
const gteDate = firstDayThisMonth.toISOString(); // MongoDB uses ISO format
const ltDate = new Date(
  lastDayThisMonth.getFullYear(),
  lastDayThisMonth.getMonth(),
  lastDayThisMonth.getDate() + 1
).toISOString(); // Increment to get the first day of the next month at 00:00:00

// this is giving you This month income
const MonthIncome = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      {
        $match: {
          transactionDate: {
            $gte: new Date(gteDate), // Use the first day of the last month
            $lt: new Date(ltDate), // Use the first day of this month
          },
          type: "INCOME",
        },
      },
      {
        $group: {
          _id: null,
          MonthIncome: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          MonthIncome: 1,
        },
      },
    ]);

    res.status(200).send({
      status: "true",
      data: value,
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ status: "false", message: "Something went wrong", error: err });
  }
};

// this is giving you This month expense
const MonthExpense = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      {
        $match: {
          transactionDate: {
            $gte: new Date(gteDate), // Use the first day of the last month
            $lt: new Date(ltDate), // Use the first day of this month
          },
          type: "EXPENSE",
        },
      },
      {
        $group: {
          _id: null,
          MonthExpense: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,
          MonthExpense: 1,
        },
      },
    ]);

    res.status(200).send({
      status: "true",
      data: value,
    });
  } catch (err) {
    console.log(err);
    res.status(200).send({
      status: "false",
      message: "Something went wrong",
      error: err,
    });
  }
};

export {
  createTransaction,
  getTransaction,
  deleteTransaction,
  updateTransaction,
  totalIncomeAggrigate,
  totalExpenseAggrigate,
  MonthIncome,
  MonthExpense,
};