import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi, type Expense } from "@/lib/api";

interface ExpenseFilters {
  budgetId?: string;
  startDate?: string;
  endDate?: string;
}

export const useExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: ["expenses", filters],
    queryFn: async () => {
      const response = await expenseApi.getAll(filters);
      return response.data;
    },
    retry: 1,
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ["expenses", id],
    queryFn: async () => {
      const response = await expenseApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) =>
      expenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) =>
      expenseApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};
