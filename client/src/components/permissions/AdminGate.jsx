import React from 'react';
import { useIsAdmin } from '../../hooks/useIsAdmin';




export const AdminGate = ({ children, fallback = null }) => {
  const isAdmin = useIsAdmin();
  return isAdmin ? children : fallback;
};
