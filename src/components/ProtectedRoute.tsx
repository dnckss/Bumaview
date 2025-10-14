import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isSignedIn, isLoaded } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    // Clerk가 로드되고 사용자가 로그인되지 않았으면 홈페이지로 리다이렉트
    if (isLoaded && !isSignedIn) {
      navigate('/')
    }
  }, [isLoaded, isSignedIn, navigate])

  // 로딩 중이거나 로그인되지 않은 경우 로딩 표시
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center">
        <div className="text-white text-lg">로딩 중...</div>
      </div>
    )
  }

  return <>{children}</>
}
