'use client'
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const Layout = ({children}:{children:React.ReactNode}) => {
    const {auth}= useAuthStore((state)=>state)
    const router= useRouter()
    const [hasAccess, setHasAccess] = useState(false);
        useEffect(() => {
            const checkAuth = async () => {
                if (auth.isLoggedIn) {
                    router.push('/dashboard');
                } else {
                    setHasAccess(true);
                }
            };
            checkAuth();
        }, [auth.isLoggedIn, router])
        if (!hasAccess) {
            return ;
        }
  return (
    <div>
      {children}
    </div>
  )
}

export default Layout
