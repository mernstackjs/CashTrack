import express from "express";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";
import { validateDateFormat } from "../utils/validation.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/stats - Get budget statistics
router.get("/", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters if provided
    if (startDate && !validateDateFormat(startDate)) {
      return res
        .status(400)
        .json({ error: "Start date must be in YYYY-MM-DD format" });
    }

    if (endDate && !validateDateFormat(endDate)) {
      return res
        .status(400)
        .json({ error: "End date must be in YYYY-MM-DD format" });
    }

    // Build query for expenses
    const expenseQuery = { userId: req.user._id };
    if (startDate || endDate) {
      expenseQuery.date = {};
      if (startDate) expenseQuery.date.$gte = startDate;
      if (endDate) expenseQuery.date.$lte = endDate;
    }

    // Get all budgets and expenses for the user
    const budgets = await Budget.find({ userId: req.user._id });
    const expenses = await Expense.find(expenseQuery);

    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const remaining = totalBudget - totalSpent;
    const percentageUsed =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate expenses by category
    const expensesByCategory = {};
    expenses.forEach((expense) => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    });

    // Convert to array and calculate percentages
    const expensesByCategoryArray = Object.entries(expensesByCategory)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const stats = {
      totalBudget,
      totalSpent,
      remaining,
      percentageUsed,
      expensesByCategory: expensesByCategoryArray,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch statistics", message: error.message });
  }
});

export default router;
