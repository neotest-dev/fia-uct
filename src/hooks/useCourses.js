import { useState, useEffect, useCallback } from 'react';
import { subscribeToCourse } from '../services/courseService';

/**
 * Generic hook for async data fetching with loading and error states.
 * Re-fetches when the fetchFn reference changes.
 *
 * @param {function} fetchFn - Async function that returns data
 * @param {Array} deps - Dependency array for re-fetching
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetchData(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Custom hook to subscribe to a single course in real-time.
 * Cleanly handles unsubscribe on component unmount to prevent leaks.
 *
 * @param {string} courseId - The course code
 * @returns {{ data, loading, error }}
 */
export function useRealtimeCourse(courseId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCourse(courseId, (course, err) => {
      if (err) {
        setError(err);
      } else {
        setData(course);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [courseId]);

  return { data, loading, error };
}
