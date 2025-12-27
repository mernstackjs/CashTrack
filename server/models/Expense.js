import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Convert _id to id and remove __v
expenseSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.userId) {
      ret.userId = ret.userId.toString();
    }
    if (ret.budgetId) {
      ret.budgetId = ret.budgetId.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
