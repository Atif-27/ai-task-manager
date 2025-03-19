'use client'
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";

const ProtectProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth, hydrated } = useAuthStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // First render: check if we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Second effect: handle authentication check after hydration
  useEffect(() => {
    // Only proceed if we're on the client and the store is hydrated
    if (isClient && hydrated) {
      if (!auth.isLoggedIn) {
        router.replace("/login");
      }
    }
  }, [isClient, hydrated, auth.isLoggedIn, router]);

  // Show nothing during server-side rendering or while waiting for hydration
  if (!isClient || !hydrated) {
    return null;
  }

  // If we're client-side, hydrated, and not logged in, return null (redirect will happen)
  if (!auth.isLoggedIn) {
    return null;
  }

  // If client-side, hydrated, and logged in, show the protected content
  return <>{children}</>;
};

export default ProtectProvider;