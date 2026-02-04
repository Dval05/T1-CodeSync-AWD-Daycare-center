import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';





export const useIsAdmin = () => {
  const { profile } = useAuth();
  return useMemo(() => {
    const roles = profile?.roles || [];
    return roles.some(r => r.RoleID === 1);
  }, [profile]);
};
