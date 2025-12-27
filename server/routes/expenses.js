import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";
import {
  validatePositiveNumber,
  validateDateFormat,
  validateExpenseCategory,
} from "../utils/validation.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/expenses - Get all expenses (with optional filters)
router.get("/", async (req, res) => {
  try {
    const query = { userId: req.user._id };

    if (req.query.budgetId) {
      if (!req.query.budgetId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: "Invalid budget ID format" });
      }
      query.budgetId = req.query.budgetId;
    }

    if (req.query.startDate) {
      if (!validateDateFormat(req.query.startDate)) {
        return res
          .status(400)
          .json({ error: "Start date must be in YYYY-MM-DD format" });
      }
      query.date = { ...query.date, $gte: req.query.startDate };
    }

    if (req.query.endDate) {
      if (!validateDateFormat(req.query.endDate)) {
        return res
          .status(400)
          .json({ error: "End date must be in YYYY-MM-DD format" });
      }
      query.date = { ...query.date, $lte: req.query.endDate };
    }

    const expenses = await Expense.find(query).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch expenses", message: error.message });
  }
});

// GET /api/expenses/:id - Get expense by ID
router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid expense ID format" });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    console.error("Get expense error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch expense", message: error.message });
  }
});

// POST /api/expenses - Create new expense
router.post("/", async (req, res) => {
  try {
    const { description, amount, category, date, budgetId } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Expense description is required" });
    }

    if (description.trim().length > 200) {
      return res
        .status(400)
        .json({ error: "Description must be less than 200 characters" });
    }

    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({ error: "Expense amount is required" });
    }

    if (!validatePositiveNumber(amount)) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Expense category is required" });
    }

    if (!validateExpenseCategory(category)) {
      return res.status(400).json({
        error:
          "Invalid category. Valid categories are: Food, Transportation, Shopping, Bills, Entertainment, Healthcare, Education, Other",
      });
    }

    if (!date) {
      return res.status(400).json({ error: "Expense date is required" });
    }

    if (!validateDateFormat(date)) {
      return res
        .status(400)
        .json({ error: "Date must be in YYYY-MM-DD format" });
    }

    if (budgetId && !budgetId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid budget ID format" });
    }

    const expense = new Expense({
      description: description.trim(),
      amount,
      category: category.trim(),
      date,
      budgetId: budgetId || undefined,
      userId: req.user._id,
    });
    await expense.save();

    res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res
      .status(500)
      .json({ error: "Failed to create expense", message: error.message });
  }
});

// PUT /api/expenses/:id - Update expense
router.put("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid expense ID format" });
    }

    const { description, amount, category, date, budgetId } = req.body;

    if (description !== undefined && !description.trim()) {
      return res
        .status(400)
        .json({ error: "Expense description cannot be empty" });
    }

    if (description && description.trim().length > 200) {
      return res
        .status(400)
        .json({ error: "Description must be less than 200 characters" });
    }

    if (amount !== undefined && !validatePositiveNumber(amount)) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    if (category && !validateExpenseCategory(category)) {
      return res.status(400).json({
        error:
          "Invalid category. Valid categories are: Food, Transportation, Shopping, Bills, Entertainment, Healthcare, Education, Other",
      });
    }

    if (date && !validateDateFormat(date)) {
      return res
        .status(400)
        .json({ error: "Date must be in YYYY-MM-DD format" });
    }

    if (budgetId && !budgetId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid budget ID format" });
    }

    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(description && { description: description.trim() }),
        ...(amount !== undefined && { amount }),
        ...(category && { category: category.trim() }),
        ...(date && { date }),
        ...(budgetId !== undefined && { budgetId: budgetId || undefined }),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update expense error:", error);
    res
      .status(500)
      .json({ error: "Failed to update expense", message: error.message });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid expense ID format" });
    }

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Delete expense error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete expense", message: error.message });
  }
});

export default router;
