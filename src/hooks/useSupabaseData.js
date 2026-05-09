// Hook for fetching data from Supabase via api.js (with demo fallback built-in)
// Usage: const { data, loading, error, refetch } = useSupabaseData(fetchFn, deps)

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic async data fetcher with loading/error states.
 * The fetchFn should be from api.js — it already handles demo vs live mode.
 * 
 * @param {Function} fetchFn - async function that returns data
 * @param {Array} deps - dependency array (refetch when these change)
 * @param {*} fallback - fallback value if fetchFn fails
 */
export function useSupabaseData(fetchFn, deps = [], fallback = null) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result ?? fallback);
    } catch (e) {
      console.error('[useSupabaseData]', e);
      setError(e.message || 'Failed to load data');
      setData(fallback);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
