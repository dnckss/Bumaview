import { useState, useEffect } from 'react'
import { SignOutButton, SignedIn } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../contexts/OnboardingContext'
import axios from 'axios'

interface Position {
  position_id: number
  position_name: string
}

interface PositionsResponse {
  values: Position[]
  has_next: boolean
}

export default function Position() {
  const { onboardingData, updateSelectedRoles } = useOnboarding()
  const [selectedRoles, setSelectedRoles] = useState<string[]>(onboardingData.selectedRoles)
  const [positions, setPositions] = useState<Position[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const URL = import.meta.env.VITE_API_URL

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await axios.get<PositionsResponse>(`${URL}/users/positions`)
        setPositions(response.data.values)
        setLoading(false)
      } catch (error) {
        console.error('직무 데이터를 가져오는데 실패했습니다:', error)
        setLoading(false)
      }
    }

    fetchPositions()
  }, [URL])

  // 검색어에 따라 필터링된 직무 목록
  const filteredPositions = positions.filter(position =>
    position.position_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleRole = (roleName: string) => {
    const newRoles = selectedRoles.includes(roleName)
      ? selectedRoles.filter(role => role !== roleName)
      : selectedRoles.length < 3
        ? [...selectedRoles, roleName]
        : selectedRoles
    
    setSelectedRoles(newRoles)
    updateSelectedRoles(newRoles)
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C] fixed w-full">

      {/* Header */}
      <div className="bg-[#0F1115] border-b border-[#2A2F36] h-20 flex items-center justify-between px-4">
        <div className="w-20"></div>
        
        
        <div className="flex items-center space-x-3">
          <span className="text-[#D1D5DB] font-bold text-lg ml-6">BUMAVIEW</span>
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
            <div className="w-8 h-px bg-[#2A2F36]"></div>
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 bg-[#2A2F36] rounded-xl flex items-center justify-center mb-2">
                <span className="text-gray-500 font-semibold text-xs">2</span>
              </div>
              <span className="text-gray-500 font-medium text-xs">회사 입력</span>
            </div>
          </div>
        </div>

        {/* Content Header */}
        <div className="text-center mb-8">
          <h1 className="text-[#D1D5DB] font-bold text-3xl lg:text-4xl mb-4">
            어떤 직무로 면접을 준비하고 계신가요?
          </h1>
          <p className="text-[#9CA3AF] text-base lg:text-lg">
            최대 3개까지 선택하실 수 있습니다. 더 정확한 질문 분석을 위해 구체적으로 선택해주세요.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto">
          {/* Search Bar */}
          <div className="bg-[#171A1F] border border-[#2A2F36] rounded-xl p-4 mb-8">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="직무명을 검색해보세요 (예: 프론트엔드 개발자)"
                className="bg-transparent text-[#D1D5DB] text-sm flex-1 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Positions List */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-[#9CA3AF]">직무 목록을 불러오는 중...</div>
              </div>
            ) : (
              <div>
                <h3 className="text-[#D1D5DB] font-semibold text-base mb-4">
                  직무 선택
                </h3>
                <div className="flex flex-wrap gap-3">
                  {filteredPositions.map((position) => (
                    <button
                      key={position.position_id}
                      onClick={() => toggleRole(position.position_name)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        selectedRoles.includes(position.position_name)
                          ? 'bg-[#171A1F] border-blue-500 text-blue-500'
                          : 'bg-[#171A1F] border-[#2A2F36] text-[#D1D5DB] hover:border-gray-400'
                      }`}
                    >
                      {position.position_name}
                    </button>
                  ))}
                </div>
                {filteredPositions.length === 0 && searchTerm && (
                  <div className="text-center py-8">
                    <div className="text-[#9CA3AF]">검색 결과가 없습니다.</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Roles & Continue Button */}
        <div className="max-w-2xl mx-auto mt-8 flex items-center justify-between">
          <div>
            <p className="text-[#9CA3AF] font-medium text-sm">선택된 직무</p>
            <p className="text-blue-500 font-semibold text-sm">
              {selectedRoles.length}/3개 선택
            </p>
          </div>
          <button
            onClick={() => navigate('/onboarding/company')}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
              selectedRoles.length > 0
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
            disabled={selectedRoles.length === 0}
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  )
}
