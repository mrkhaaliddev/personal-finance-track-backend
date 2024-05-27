import BudgetModal from "../models/budgetModal.js";

const createBudget = async (req, res) => {
  try {
    const { annualIncome, annualExpense, startDate, dueDate } = req.body;

    if (!annualIncome || !annualExpense || !startDate || !dueDate) {
      return res.status(400).send({
        message: "All fields are required",
        success: false,
      });
    }

    // Check for date validity and logical consistency
    if (startDate >= dueDate) {
      return res.status(400).send({
        message: "Start date must be before due date",
        success: false,
      });
    }

    // Looking if the date already exists in the database
    const dateExists = await BudgetModal.findOne({
      $or: [{ startDate: startDate }, { dueDate: dueDate }],
    });

    if (dateExists) {
      return res.status(400).send({
        status: "false",
        message: "A budget with these dates already exists",
      });
    }

    const result = await BudgetModal.create({
      user: req.user._id,
      ...req.body,
    });

    await result.save();

    res.status(201).send({
      status: "true",
      message: "Budget created successfully",
      data: result,
      user: req.user._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
      error: err,
    });
  }
};

const getBudget = async (req, res) => {
  try {
    const { page = 1, per_page } = req.query;
    const Total = await BudgetModal.countDocuments({ user: req.user._id });
    const result = await BudgetModal.find({ user: req.user._id }, null, {
      sort: { createdAt: -1 },
      skip: parseInt(page - 1) * parseInt(per_page),
      limit: parseInt(per_page),
    });
    res.send({
      status: "true",
      length: result.length,
      message: "Budget fetched successfully",
      data: result,
      total: Total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "false",
      message: "Internal Server Error",
      error: err,
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await BudgetModal.findById({ _id: id, user: req.user._id });

    if (!budget) {
      return res.status(404).send({
        status: "false",
        message: "Budget not found",
      });
    }

    // Delete the budget
    const result = await BudgetModal.findByIdAndDelete(id);

    res.status(200).send({
      status: "true",
      message: "Budget deleted successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
      error: err,
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await BudgetModal.findOne({ _id: id, user: req.user._id });

    if (!budget) {
      return res.status(404).send({
        status: "false",
        message: "Budget not found",
      });
    }

    const result = await BudgetModal.findByIdAndUpdate(id, req.body, {
      user: req.user._id,
      new: true,
    });
    res.status(200).send({
      status: "true",
      message: "Budget updated successfully",
      data: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: err,
    });
  }
};

const totalIncomeAggrigate = async (req, res) => {
  try {
    const startDate = `${new Date().getFullYear()}-01-01T00:00:00.000+00:00`;
    const dueDate = `${new Date().getFullYear() + 1}-01-01T00:00:00.000+00:00`;
    console.log(startDate);
    console.log(dueDate);
    const results = await BudgetModal.aggregate([
      {
        $match: {
          user: req.user._id,
          startDate: { $gte: new Date(startDate), $lt: new Date(dueDate) },
          dueDate: { $lte: new Date(dueDate), $gt: new Date(startDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$annualIncome" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalBudget: 1,
          startDate: { $gt: startDate },
          startDate: 1,
          dueDate: { $gt: startDate },
          dueDate: 1,
          count: 1,
        },
      },
    ]);

    console.log(results);
    res.status(200).send({
      status: "true",
      startDate: startDate,
      results: results,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: err,
    });
  }
};

const totalExpenseAggrigate = async (req, res) => {
  try {
    const startDate = `${new Date().getFullYear()}-01-01T00:00:00.000+00:00`;
    const endDate = `${new Date().getFullYear() + 1}-01-01T00:00:00.000+00:00`;
    const result = await BudgetModal.aggregate([
      {
        $match: {
          user: req.user._id,
          startDate: { $gte: new Date(startDate), $lt: new Date(endDate) },
          dueDate: { $lte: new Date(endDate), $gt: new Date(startDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$annualExpense" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalExpense: 1,
          count: 1,
        },
      },
    ]);
    res.status(200).json({
      status: "true",
      startDate: startDate,
      results: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: err,
    });
  }
};

const MonthIncome = async (req, res) => {
  try {
    const startDate = `${new Date().getFullYear()}-01-01T00:00:00.000+00:00`;
    const dueDate = `${new Date().getFullYear() + 1}-01-01T00:00:00.000+00:00`;
    const result = await BudgetModal.aggregate([
      {
        $match: {
          user: req.user._id,
          startDate: { $gte: new Date(startDate), $lt: new Date(dueDate) },
          dueDate: { $lte: new Date(dueDate), $gt: new Date(startDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$annualIncome" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalBudget: 1,
          count: 1,
          monthIncome: {
            $divide: ["$totalBudget", 12],
          },
        },
      },
    ]);

    res.status(200).send({
      status: "success",
      results: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: err,
    });
  }
};

const MonthExpense = async (req, res) => {
  try {
    const startDate = `${new Date().getFullYear()}-01-01T00:00:00.000+00:00`;
    const dueDate = `${new Date().getFullYear() + 1}-01-01T00:00:00.000+00:00`;
    const result = await BudgetModal.aggregate([
      {
        $match: {
          user: req.user._id,
          startDate: { $gte: new Date(startDate), $lt: new Date(dueDate) },
          dueDate: { $lte: new Date(dueDate), $gt: new Date(startDate) },
        },
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: "$annualExpense" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalBudget: 1,
          count: 1,
          monthExpense: {
            $divide: ["$totalBudget", 12],
          },
        },
      },
    ]);

    res.status(200).send({
      status: "success",
      results: result,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Internal Server Error",
      error: err,
    });
  }
};

// this is about the graph
const graphMonthlyData = async (req, res) => {
  const startDate = `${new Date().getFullYear()}-01-01T00:00:00.000+00:00`;
  const dueDate = `${new Date().getFullYear() + 1}-01-01T00:00:00.000+00:00`;

  try {
    console.log("req.user._id", req.user._id);
    const data = await BudgetModal.aggregate([
      {
        $match: {
          user: req.user._id,
          startDate: { $gte: new Date(startDate), $lt: new Date(dueDate) },
          dueDate: { $lte: new Date(dueDate), $gt: new Date(startDate) },
        },
      },
      {
        $project: {
          _id: 0,
          monthlyIncome: { $divide: ["$annualIncome", 12] },
          monthlyExpense: { $divide: ["$annualExpense", 12] },
        },
      },
    ]);

    res.status(200).send({
      status: "success",
      data: data,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      success: false,
      message: "Graph data not found",
      error: err,
    });
  }
};

export {
  createBudget,
  getBudget,
  deleteBudget,
  updateBudget,
  totalIncomeAggrigate,
  totalExpenseAggrigate,
  MonthIncome,
  MonthExpense,
  graphMonthlyData,
};
