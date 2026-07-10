import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 12 * 60 * 60 * 1000, // 12 hours
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
});
