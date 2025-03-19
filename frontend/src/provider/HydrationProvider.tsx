'use client'
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const { hydrated, setHydrated } = useAuthStore();

  useEffect(() => {
    // This runs on client-side only
    setIsHydrating(false);
    
    // If not yet hydrated, mark as hydrated
    if (!hydrated) {
      setHydrated(true);
    }
  }, [hydrated, setHydrated]);

  // During SSR or hydration, return a minimal shell or loading indicator
  if (isHydrating) {
    return null; // Or a loading spinner
  }

  // Once hydrated on the client, render the actual content
  return <>{children}</>;
}