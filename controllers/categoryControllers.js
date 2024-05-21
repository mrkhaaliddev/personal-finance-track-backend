import { Category } from "../models/transactionModals.js";
import asyncHandler from "express-async-handler";

// create new category
const create_Categories = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { type, description, status } = req.body;

  if (!req.body || !req.body.type) {
    res.status(400).send({
      status: "false",
      message: "Type is required",
    });
    return;
  }

  const categoryExists = await Category.findOne({
    user: req.user._id,
    type: type.toUpperCase(),
  });

  if (categoryExists) {
    res.status(400).send({
      status: "false",
      message: "category already exists",
    });
    return;
  } else {
    const newCategory = await Category.create({
      type: type.toUpperCase(),
      description: description || "",
      status,
      user: req.user._id,
    });
    newCategory.save();
  }

  res.status(201).json({
    message: "category created",
    data: req.body || "we don't have any data",
  });
});

// get all categories
const get_Categories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ user: req.user._id }, null, {
    sort: { createdAt: -1 },
  });
  console.log("categories", categories);
  console.log(req.user.name);

  res.status(201).json({
    message: "categories founded",
    data: categories || "we don't have any categories",
  });
});

// delete category
const delete_Categories = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await Category.findOneAndDelete({
    user: req.user._id,
    _id: id,
  });

  if (!result) {
    res.status(400).send({
      status: "false",
      message: "category does not exist",
    });
    return;
  }

  res.status(201).json({
    status: "success",
    message: "category deleted",
  });
});

// update category
const update_Categories = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const { type, description, status } = req.body;

  const updatedCategory = {
    type: type.toUpperCase(),
    description,
    status,
  };

  const categoryExists = await Category.findOne({
    type: type.toUpperCase(),
    user: req.user._id,
  });

  if (categoryExists && categoryExists._id.toString() !== categoryId) {
    res.status(400).send({
      status: "false",
      message: "category already exists",
    });
    return;
  }

  const result = await Category.findByIdAndUpdate(categoryId, updatedCategory, {
    user: req.user._id,
    new: true,
  });

  if (!result) {
    res.status(400).send({
      status: "false",
      message: "category does not exist",
    });
    return;
  }

  res.status(201).json({
    status: "success",
    message: "category updated",
    data: req.body,
  });
});

export {
  create_Categories,
  get_Categories,
  delete_Categories,
  update_Categories,
};
