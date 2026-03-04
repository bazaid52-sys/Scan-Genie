import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Create a robust parser that logs errors for easy debugging
function parseWithLogging<T>(schema: z.ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw new Error(`Data validation failed for ${label}`);
  }
  return result.data;
}

export function useScans() {
  return useQuery({
    queryKey: [api.scans.list.path],
    queryFn: async () => {
      const res = await fetch(api.scans.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch scans");
      
      const data = await res.json();
      return parseWithLogging(api.scans.list.responses[200], data, "scans.list");
    },
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: { content: string; format: string }) => {
      const validated = api.scans.create.input.parse(input);
      
      const res = await fetch(api.scans.create.path, {
        method: api.scans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (res.status === 401) throw new Error("Unauthorized");
      if (res.status === 400) {
        const error = await res.json();
        throw new Error(error.message || "Invalid input");
      }
      if (!res.ok) throw new Error("Failed to create scan");
      
      const data = await res.json();
      return parseWithLogging(api.scans.create.responses[201], data, "scans.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
    },
  });
}

export function useDeleteScan() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.scans.delete.path, { id });
      const res = await fetch(url, {
        method: api.scans.delete.method,
        credentials: "include",
      });
      
      if (res.status === 401) throw new Error("Unauthorized");
      if (res.status === 404) throw new Error("Scan not found");
      if (!res.ok) throw new Error("Failed to delete scan");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
    },
  });
}
