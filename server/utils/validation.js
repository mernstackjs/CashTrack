// Validation utilities for common checks

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 6 characters
  return password && password.length >= 6;
};

export const validatePositiveNumber = (num) => {
  return typeof num === "number" && num >= 0 && isFinite(num);
};

export const validateDateFormat = (dateStr) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
};

export const validateBudgetPeriod = (period) => {
  return ["weekly", "monthly", "yearly"].includes(period);
};

export const validateExpenseCategory = (category) => {
  const validCategories = [
    "Food",
    "Transportation",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other",
  ];
  return validCategories.includes(category);
};
