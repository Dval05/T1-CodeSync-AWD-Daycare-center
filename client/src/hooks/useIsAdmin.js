import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Determina si el usuario actual es Admin.
 * Por simplicidad, asume que el rol Admin tiene RoleID = 1.
 */
export const useIsAdmin = () => {
  const { profile } = useAuth();
  return useMemo(() => {
    const roles = profile?.roles || [];
    return roles.some(r => r.RoleID === 1);
  }, [profile]);
};
