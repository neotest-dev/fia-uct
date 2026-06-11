import { useQuery } from '@tanstack/react-query';
import { getCourseByCode } from '../services/courseService';

/**
 * Generic hook for async data fetching with loading and error states.
 * Uses TanStack Query under the hood to manage query caching and prevent duplicate requests.
 *
 * @param {function} fetchFn - Async function that returns data
 * @param {Array} deps - Dependency array for re-fetching
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetchData(fetchFn, deps = []) {
  // Use function string representation and dependencies as the query key to uniquely identify the query
  const normalizedFnString = fetchFn.toString().replace(/\s+/g, '');
  const queryKey = ['coursesData', normalizedFnString, ...deps];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: fetchFn,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? (error.message || 'Error al cargar datos') : null,
    refetch,
  };
}

/**
 * Hook to retrieve a single course. Modified to be non-realtime for public pages
 * to avoid real-time listeners and save reads, utilizing our cache-backed retrieval.
 *
 * @param {string} courseId - The course code
 * @returns {{ data, loading, error }}
 */
export function useRealtimeCourse(courseId) {
  return useFetchData(() => getCourseByCode(courseId), [courseId]);
}
