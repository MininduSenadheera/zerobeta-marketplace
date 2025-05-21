'use client';

import { useEffect, useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import { setLogoutHandler } from '@/lib/apiClient';

export default function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    setLogoutHandler(() => logout);
  }, [logout]);

  return <>{children}</>;
}