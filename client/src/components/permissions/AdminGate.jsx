import React from 'react';
import { useIsAdmin } from '../../hooks/useIsAdmin';

/**
 * Muestra children solo si el usuario es Admin.
 */
export const AdminGate = ({ children, fallback = null }) => {
  const isAdmin = useIsAdmin();
  return isAdmin ? children : fallback;
};
