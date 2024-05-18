import asyncHandler from "express-async-handler";
import { Transaction } from "../models/transactionModals.js";
import { legacy_createStore } from "@reduxjs/toolkit";

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
  const filter = { user: req.user._id };
  if (req.query.type) {
    filter.type = req.query.type?.toUpperCase();
  }

  if (req.query.search) {
    const searchQuery = req.query.search;
    filter.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { description: { $regex: searchQuery, $options: "i" } },
      { category: { $regex: searchQuery, $options: "i" } },
      { type: { $regex: searchQuery, $options: "i" } },
    ];
  }
  const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
  // const transactions = transactionsDesc.reverse(); you can use this line to reverse the array to at the top the last one also sort
  console.log(req.user.name);

  res.status(200).json({
    status: "true",
    length: transactions.length,
    data: transactions || "there is no transaction",
  });
};

const getLastTransactions = async (req, res) => {
  const filter = { user: req.user._id };
  const transactions = await Transaction.find(filter)
    .sort({ _id: -1 })
    .limit(5);
  res.status(200).json({
    status: "true",
    length: transactions.length,
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

// this is Reading you total income
const totalIncomeAggrigate = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
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

// this is Reading you total expense
const totalExpenseAggrigate = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      [
        {
          $match: {
            user: req.user._id,
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

// Balance

const Balance = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      [
        {
          $match: {
            user: req.user._id,
            type: { $in: ["INCOME", "EXPENSE"] },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
              },
            },
            totalExpense: {
              $sum: {
                $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalIncome: 1,
            totalExpense: 1,
            netAmount: { $subtract: ["$totalIncome", "$totalExpense"] },
          },
        },
      ],
    ]);
    console.log(value);
    res.send({ data: value });
  } catch (err) {
    console.log(err);
    res
      .status(404)
      .send({ status: "false", message: "Something went wrong", error: err });
  }
};

// this is Reading you the current month

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

// this is Reading you This month income
const MonthIncome = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      {
        $match: {
          transactionDate: {
            $gte: new Date(gteDate), // Use the first day of the last month
            $lt: new Date(ltDate), // Use the first day of this month
          },
          user: req.user._id,
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

// this is Reading you This month expense
const MonthExpense = async (req, res) => {
  try {
    const value = await Transaction.aggregate([
      {
        $match: {
          transactionDate: {
            $gte: new Date(gteDate), // Use the first day of the last month
            $lt: new Date(ltDate), // Use the first day of this month
          },
          user: req.user._id,
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

// this is Reading the 12 month and each month income and expense helping for the graph

const MonthPayments = async (req, res) => {
  try {
    const allMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Fetch the aggregated data from MongoDB
    const value = await Transaction.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$transactionDate" },
            year: { $year: "$transactionDate" },
          },
          totalIncome: {
            $sum: {
              $cond: [{ $eq: ["$type", "INCOME"] }, "$amount", 0],
            },
          },
          totalExpense: {
            $sum: {
              $cond: [{ $eq: ["$type", "EXPENSE"] }, "$amount", 0],
            },
          },
        },
      },
      {
        $addFields: {
          monthName: {
            $arrayElemAt: [allMonths, { $subtract: ["$_id.month", 1] }],
          },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Create a map of the aggregated results
    const resultMap = value.reduce(
      (acc, { monthName, totalIncome, totalExpense }) => {
        acc[monthName] = { totalIncome, totalExpense };
        return acc;
      },
      {}
    );

    // Ensure all months are included
    const finalResults = allMonths.map((month) => ({
      month,
      totalIncome: resultMap[month] ? resultMap[month].totalIncome : 0,
      totalExpense: resultMap[month] ? resultMap[month].totalExpense : 0,
    }));

    // Send the response
    res.status(200).send({
      status: "true",
      user: req.user._id,
      message: "Here is the data fetched from the database, use it bro please",
      data: finalResults,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
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
  Balance,
  MonthPayments,
  getLastTransactions,
};
