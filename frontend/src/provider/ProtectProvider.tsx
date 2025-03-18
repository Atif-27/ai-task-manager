'use client'
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const ProtectProvider = ({children}:{children:React.ReactNode}) => {
    const {auth}= useAuthStore()
    const router = useRouter();

    const [hasAccess, setHasAccess] = useState(false);
    useEffect(() => {
        const checkAuth = async () => {
          if (!auth.isLoggedIn) {
            router.push("/login");
          } else {
            setHasAccess(true);
          }
        };
        checkAuth();
    }, [auth, router])

    if (!hasAccess) {
        return ;
    }
  return (
    <div>
      {children}
    </div>
  )
}

export default ProtectProvider
