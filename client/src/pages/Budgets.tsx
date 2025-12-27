import { useState } from "react";
import { useBudgets, useExpenses } from "@/hooks";
import {
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from "@/hooks/useBudgets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/lib/toast";
import type { Budget } from "@/lib/api";

const categories = [
  "Food",
  "Transportation",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Other",
];

const periods = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function Budgets() {
  const { data: budgets, isLoading, error } = useBudgets();
  const { data: expenses } = useExpenses();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "",
    period: "monthly" as "weekly" | "monthly" | "yearly",
  });

  const handleOpenForm = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        name: budget.name,
        amount: budget.amount.toString(),
        category: budget.category,
        period: budget.period,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: "",
        amount: "",
        category: "",
        period: "monthly",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBudget(null);
    setFormData({
      name: "",
      amount: "",
      category: "",
      period: "monthly",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetData = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      category: formData.category,
      period: formData.period,
    };

    if (editingBudget) {
      updateBudgetMutation.mutate(
        { id: editingBudget.id, data: budgetData },
        {
          onSuccess: () => {
            toast.success("Budget updated successfully!");
            handleCloseForm();
          },
          onError: (error: any) => {
            const message = error?.message || "Failed to update budget";
            toast.error(message);
          },
        }
      );
    } else {
      createBudgetMutation.mutate(budgetData, {
        onSuccess: () => {
          toast.success("Budget created successfully!");
          handleCloseForm();
        },
        onError: (error: any) => {
          const message = error?.message || "Failed to create budget";
          toast.error(message);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteBudgetMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Budget deleted successfully!");
        },
        onError: (error: any) => {
          const message = error?.message || "Failed to delete budget";
          toast.error(message);
        },
      });
    }
  };

  const getBudgetSpent = (budgetId: string) => {
    return (
      expenses
        ?.filter((e) => e.budgetId === budgetId)
        .reduce((sum, e) => sum + e.amount, 0) || 0
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">
                  Failed to load budgets
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message ||
                    "An error occurred while loading your budgets"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Create and manage your budgets
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingBudget ? "Edit Budget" : "Create New Budget"}
            </CardTitle>
            <CardDescription>
              {editingBudget
                ? "Update budget details"
                : "Set up a new budget category"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Budget Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Monthly Groceries"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select
                    id="period"
                    value={formData.period}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        period: e.target.value as
                          | "weekly"
                          | "monthly"
                          | "yearly",
                      })
                    }
                    required
                  >
                    {periods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingBudget ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseForm}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Budgets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget) => {
            const spent = getBudgetSpent(budget.id);
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = spent > budget.amount;

            return (
              <Card key={budget.id} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Target className="h-3 w-3" />
                        {budget.category} • {budget.period}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenForm(budget)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-semibold">
                        ${budget.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span
                        className={`font-semibold ${
                          isOverBudget ? "text-destructive" : ""
                        }`}
                      >
                        ${spent.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Remaining</span>
                      <span
                        className={`font-semibold ${
                          remaining < 0 ? "text-destructive" : "text-green-600"
                        }`}
                      >
                        ${remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isOverBudget ? "bg-destructive" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  {isOverBudget && (
                    <div className="flex items-center gap-2 text-xs text-destructive">
                      <TrendingUp className="h-3 w-3" />
                      <span>
                        Over budget by ${Math.abs(remaining).toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No budgets yet. Create your first budget!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
