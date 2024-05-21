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

export { createBudget, getBudget, deleteBudget, updateBudget };
