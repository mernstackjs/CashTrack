import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetApi, type Budget } from "@/lib/api";

export const useBudgets = () => {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await budgetApi.getAll();
      return response.data;
    },
    retry: 1,
  });
};

export const useBudget = (id: string) => {
  return useQuery({
    queryKey: ["budgets", id],
    queryFn: async () => {
      const response = await budgetApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    retry: 1,
  });
};

export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Budget, "id" | "createdAt" | "updatedAt">) =>
      budgetApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) =>
      budgetApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};

export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => budgetApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
};
