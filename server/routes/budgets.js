import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";
import {
  validatePositiveNumber,
  validateBudgetPeriod,
} from "../utils/validation.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/budgets - Get all budgets
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(budgets);
  } catch (error) {
    console.error("Get budgets error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch budgets", message: error.message });
  }
});

// GET /api/budgets/:id - Get budget by ID
router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid budget ID format" });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.json(budget);
  } catch (error) {
    console.error("Get budget error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch budget", message: error.message });
  }
});

// POST /api/budgets - Create new budget
router.post("/", async (req, res) => {
  try {
    const { name, amount, category, period } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Budget name is required" });
    }

    if (name.trim().length > 100) {
      return res
        .status(400)
        .json({ error: "Budget name must be less than 100 characters" });
    }

    if (amount === undefined || amount === null || amount === "") {
      return res.status(400).json({ error: "Budget amount is required" });
    }

    if (!validatePositiveNumber(amount)) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ error: "Budget category is required" });
    }

    if (!period) {
      return res.status(400).json({ error: "Budget period is required" });
    }

    if (!validateBudgetPeriod(period)) {
      return res.status(400).json({
        error: "Period must be one of: weekly, monthly, yearly",
      });
    }

    const budget = new Budget({
      name: name.trim(),
      amount,
      category: category.trim(),
      period,
      userId: req.user._id,
    });
    await budget.save();

    res.status(201).json(budget);
  } catch (error) {
    console.error("Create budget error:", error);
    res
      .status(500)
      .json({ error: "Failed to create budget", message: error.message });
  }
});

// PUT /api/budgets/:id - Update budget
router.put("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid budget ID format" });
    }

    const { name, amount, category, period } = req.body;

    // Validation
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ error: "Budget name cannot be empty" });
    }

    if (name && name.trim().length > 100) {
      return res
        .status(400)
        .json({ error: "Budget name must be less than 100 characters" });
    }

    if (amount !== undefined && !validatePositiveNumber(amount)) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    if (category && !category.trim()) {
      return res.status(400).json({ error: "Budget category cannot be empty" });
    }

    if (period && !validateBudgetPeriod(period)) {
      return res.status(400).json({
        error: "Period must be one of: weekly, monthly, yearly",
      });
    }

    const updated = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(name && { name: name.trim() }),
        ...(amount !== undefined && { amount }),
        ...(category && { category: category.trim() }),
        ...(period && { period }),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update budget error:", error);
    res
      .status(500)
      .json({ error: "Failed to update budget", message: error.message });
  }
});

// DELETE /api/budgets/:id - Delete budget
router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid budget ID format" });
    }

    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    // Also remove expenses linked to this budget
    await Expense.deleteMany({ budgetId: req.params.id, userId: req.user._id });

    res.status(204).send();
  } catch (error) {
    console.error("Delete budget error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete budget", message: error.message });
  }
});

export default router;
