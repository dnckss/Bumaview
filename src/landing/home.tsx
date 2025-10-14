import { useNavigate } from 'react-router-dom'
import { SignedOut, SignInButton, useUser, useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const navigate = useNavigate()
  const { isSignedIn, isLoaded, user } = useUser()
  const { getToken } = useAuth()
  const URL = import.meta.env.VITE_API_URL
  
  useEffect(() => {
    // Clerk가 로드되고 사용자가 로그인되어 있으면 position 페이지로 리다이렉트
    if (isLoaded && isSignedIn) {
      navigate('/onboarding/position')
    }
  }, [isLoaded, isSignedIn, navigate])  

  useEffect(() => {
    // Clerk 로드 & 로그인 완료 & user 정보 있을 때만 API 호출
    if (isLoaded && isSignedIn && user) {
      const saveUser = async () => {
        try {
          // Clerk에서 Bearer 토큰 가져오기
          const token = await getToken()
          
          // Bearer 토큰을 헤더에 포함해서 API 호출
          const response = await axios.post(`${URL}/users`, {
            nickname: user.fullName,
            email: user.emailAddresses[0].emailAddress,
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          console.log('User saved:', response.data)
        } catch (err) {
          console.error('User save error:', err)
        }
      }
      
      saveUser()
    }
  }, [isLoaded, isSignedIn, user, URL, getToken])

  return (
    <div className="h-screen w-full bg-[#0B0B0C] flex items-center justify-center overflow-hidden fixed">
      <div className="w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full">
          <div className="mb-8 sm:mb-12">
            <h1 className="text-[#D1D5DB] font-bold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-4 sm:mb-6 animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              직무·회사 맞춤형 AI 면접 트레이너
            </h1>
            <h2 className="text-[#3B82F6] font-normal text-3xl sm:text-4xl lg:text-5xl xl:text-6xl mb-6 sm:mb-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              BUMAVIEW
            </h2>
            <p className="text-[#9CA3AF] text-base sm:text-lg lg:text-xl leading-6 sm:leading-8 lg:leading-9 max-w-3xl mx-auto animate-fade-in-up opacity-0" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              희망하는 회사와 직무를 입력하면, AI가 맞춤형 면접 질문을 생성하고<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>실전처럼 연습할 수 있는 피드백을 제공합니다
            </p>
          </div>
          <div className="flex justify-center animate-fade-in-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm sm:text-base lg:text-lg px-8 sm:px-10 lg:px-12 py-3 sm:py-4 lg:py-5 rounded-xl transition-colors duration-200 w-full sm:w-auto max-w-xs sm:max-w-none">
                  무료로 시작하기
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </div>
  )
}