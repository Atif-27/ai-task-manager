import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import React from 'react'

const Logout = ({children}:{children:React.ReactNode}) => {
    const router=useRouter()
    const {logout}= useAuthStore()
    function handleLogout(){
        router.push("/")
         logout()
    }
  return (
    <div onClick={handleLogout}>
      {children}
    </div>
  )
}

export default Logout
