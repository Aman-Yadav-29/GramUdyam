import { useState, useEffect, useCallback } from 'react';
import { SystemHealthStatus } from '../types/api.ts';
import { apiClient } from '../services/apiClient.ts';

export function useSystemHealth() {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const data = await apiClient.getHealth();
      setHealth(data);
      setError(null);
    } catch (err: any) {
      console.warn('[useSystemHealth] Health check error:', err);
      setError(err.message || 'Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // periodically ping every 30s
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { health, loading, error, refetch: checkHealth };
}
