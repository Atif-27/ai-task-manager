import api from '@/utils/AxiosInstance';
import { useRouter } from 'next/navigation';
import React from 'react'

const DeleteOverloay = ({children,id,redirect=false}:{
    children:React.ReactNode
    redirect?: boolean
    id:string
}) => {
    const router= useRouter()
  return (
    <div onClick={ async ()=>{
        await api.delete("/tasks/"+id)
        if(redirect) router.push("/dashboard")
    }}>
      {children}
    </div>
  )
}

export default DeleteOverloay
