import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
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
    period: {
      type: String,
      required: true,
      enum: ["weekly", "monthly", "yearly"],
    },
  },
  {
    timestamps: true,
  }
);

// Convert _id to id and remove __v
budgetSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    if (ret.userId) {
      ret.userId = ret.userId.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
