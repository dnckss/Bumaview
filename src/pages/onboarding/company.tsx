import { useEffect, useState } from 'react'
import { SignOutButton, SignedIn, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../contexts/OnboardingContext'
import { getCompanyId } from '../../constants/companies'
import { getPositionId } from '../../constants/positions'
import axios from 'axios'

export default function Company() {
  const { onboardingData, updateCompanyName, clearOnboardingData } = useOnboarding()
  const [companyName, setCompanyName] = useState(onboardingData.companyName)
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${URL}/companies`)
        console.log(response.data)
      } catch (error) {
        console.error('회사 데이터를 가져오는데 실패했습니다:', error)
      }
    }

    fetchCompanies()
  }, [])

  const handleBack = () => {
    navigate('/onboarding/position')
  }

  const handleComplete = async () => {
    try {
      // 선택된 직무들을 ID로 변환
      const positionIds = onboardingData.selectedRoles.map(role => getPositionId(role))

      // 회사명을 ID로 변환
      const companyId = getCompanyId(companyName)

      const token = await getToken()

      await axios.patch(`${URL}/users/positions`, {
        position_ids: positionIds,
        company_ids: [companyId]
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // 온보딩 데이터 클리어
      clearOnboardingData()
      // 대시보드로 이동
      navigate('/dashboard')
    } catch (error) {
      console.error('API 호출 오류:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] fixed w-full">
      {/* Header */}
      <div className="bg-[#0F1115] border-b border-[#2A2F36] h-20 flex items-center justify-between px-4">
        <div className="w-20"></div>
        
        <div className="flex items-center space-x-3">
          <span className="text-[#D1D5DB] font-bold text-lg">BUMAVIEW</span>
        </div>
        
        <div className="w-20 flex justify-end text-white mr-4">
          <SignedIn>
            <SignOutButton>
              <button className="text-white">로그아웃</button>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-semibold text-xs">1</span>
              </div>
              <span className="text-blue-500 font-medium text-xs">직무 선택</span>
            </div>
            <div className="w-8 h-px bg-blue-500"></div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-semibold text-xs">2</span>
              </div>
              <span className="text-blue-500 font-medium text-xs">회사 입력</span>
            </div>
          </div>
        </div>

        {/* Content Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#D1D5DB] font-bold text-3xl lg:text-4xl mb-4">
            어떤 회사에 지원하실 예정인가요?
          </h1>
          <p className="text-[#9CA3AF] text-base lg:text-lg">
            관심 있는 회사를 추가하면 해당 회사의 면접 트렌드와 맞춤형 질문을 제공해드립니다.
          </p>
        </div>

        {/* Company Input Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-[#171A1F] border border-[#2A2F36] rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="회사명을 입력하세요 (예: 삼성전자, 네이버, 카카오)"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value)
                  updateCompanyName(e.target.value)
                }}
                className="bg-transparent text-[#6B7280] text-sm flex-1 outline-none"
              />
            </div>
          </div>
        </div>
        

        {/* Action Section */}
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="bg-[#171A1F] border border-[#2A2F36] text-[#D1D5DB] font-medium text-sm px-6 py-3 rounded-xl hover:border-gray-400 transition-colors"
          >
            이전
          </button>
          
          <button
            onClick={handleComplete}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
              companyName.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!companyName.trim()}
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  )
}
