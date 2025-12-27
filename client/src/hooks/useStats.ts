import { useQuery } from "@tanstack/react-query";
import { statsApi } from "@/lib/api";

interface StatsFilters {
  startDate?: string;
  endDate?: string;
}

export const useStats = (filters?: StatsFilters) => {
  return useQuery({
    queryKey: ["stats", filters],
    queryFn: async () => {
      const response = await statsApi.getStats(filters);
      return response.data;
    },
    retry: 1,
  });
};
