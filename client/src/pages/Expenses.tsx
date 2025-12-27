import { useState } from "react";
import { useExpenses, useBudgets } from "@/hooks";
import {
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "@/hooks/useExpenses";
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
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/lib/toast";
import type { Expense } from "@/lib/api";

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

export default function Expenses() {
  const { data: expenses, isLoading, error } = useExpenses();
  const { data: budgets } = useBudgets();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    budgetId: "",
  });

  const handleOpenForm = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount.toString(),
        category: expense.category,
        date: expense.date.split("T")[0],
        budgetId: expense.budgetId || "",
      });
    } else {
      setEditingExpense(null);
      setFormData({
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
        budgetId: "",
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExpense(null);
    setFormData({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      budgetId: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expenseData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      budgetId: formData.budgetId || undefined,
    };

    if (editingExpense) {
      updateExpenseMutation.mutate(
        { id: editingExpense.id, data: expenseData },
        {
          onSuccess: () => {
            toast.success("Expense updated successfully!");
            handleCloseForm();
          },
          onError: (error: any) => {
            const message = error?.message || "Failed to update expense";
            toast.error(message);
          },
        }
      );
    } else {
      createExpenseMutation.mutate(expenseData, {
        onSuccess: () => {
          toast.success("Expense created successfully!");
          handleCloseForm();
        },
        onError: (error: any) => {
          const message = error?.message || "Failed to create expense";
          toast.error(message);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Expense deleted successfully!");
        },
        onError: (error: any) => {
          const message = error?.message || "Failed to delete expense";
          toast.error(message);
        },
      });
    }
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
                  Failed to load expenses
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error.message ||
                    "An error occurred while loading your expenses"}
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
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your expenses
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingExpense ? "Edit Expense" : "Add New Expense"}
            </CardTitle>
            <CardDescription>
              {editingExpense
                ? "Update expense details"
                : "Enter expense information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Grocery shopping"
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
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
                {budgets && budgets.length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="budgetId">Budget (Optional)</Label>
                    <Select
                      id="budgetId"
                      value={formData.budgetId}
                      onChange={(e) =>
                        setFormData({ ...formData, budgetId: e.target.value })
                      }
                    >
                      <option value="">No budget</option>
                      {budgets.map((budget) => (
                        <option key={budget.id} value={budget.id}>
                          {budget.name} - {budget.category}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingExpense ? "Update" : "Create"}
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

      {/* Expenses List */}
      <div className="grid gap-4">
        {expenses && expenses.length > 0 ? (
          expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-lg">
                      {expense.description}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                        {expense.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-destructive">
                        -${expense.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenForm(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No expenses yet. Add your first expense!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
