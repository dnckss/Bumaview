import { useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import QuestionCard from '../../components/QuestionCard'
import Header from '../../components/Header'
import { SAMPLE_QUESTIONS, type Question } from '../../constants/questions'
import { fetchCompanies, type Company } from '../../api/companies'
import axios from 'axios'

export default function Dashboard() {
  const URL = import.meta.env.VITE_API_URL
  const { user } = useUser()
  const [questions, setQuestions] = useState<Question[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [visibleQuestions, setVisibleQuestions] = useState(9) // 처음에 9개만 보여줌
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoading(true)
        setError(null)
        
        // 회사 데이터와 질문 데이터를 병렬로 가져오기
        const [companiesData, questionsResponse] = await Promise.all([
          fetchCompanies(),
          axios.get(`${URL}/questions`)
        ])
        
        console.log('Companies API Response:', companiesData)
        console.log('Questions API Response:', questionsResponse.data)
        
        // 회사 데이터 저장
        setCompanies(companiesData)
        
        // API 응답 구조: { values: [], has_next: boolean }
        const questionsData = questionsResponse.data.values || questionsResponse.data || []
        
        // 회사 ID를 회사명으로 매핑하는 함수
        const getCompanyName = (companyId: number): string => {
          const company = companiesData.find(c => c.company_id === companyId)
          return company ? company.company_name : `회사 ${companyId}`
        }

        // API 응답 데이터를 Question 타입에 맞게 변환
        const apiQuestions: Question[] = questionsData.map((item: any, index: number) => ({
          id: item.question_id || item.id || index + 1,
          companyName: item.companyName || item.company || getCompanyName(item.company_id) || '알 수 없음',
          position: item.position || '개발자', // 기본값 설정
          questionType: item.category || item.questionType || item.type || '기술면접',
          question: item.question || item.content || '질문 내용이 없습니다.',
          companyLogo: item.companyLogo || getCompanyName(item.company_id)?.charAt(0) || '알'
        }))
        
        setQuestions(apiQuestions)
      } catch (err) {
        console.error('API 호출 에러:', err)
        setError('데이터를 불러오는데 실패했습니다.')
        // API 실패 시 샘플 데이터 사용
        setQuestions(SAMPLE_QUESTIONS)
      } finally {
        setIsInitialLoading(false)
      }
    }

    if (URL) {
      fetchData()
    } else {
      // URL이 없으면 샘플 데이터 사용
      setQuestions(SAMPLE_QUESTIONS)
      setIsInitialLoading(false)
    }
  }, [URL])


  // 현재 보여줄 질문들 (최대 9개씩)
  const currentQuestions = questions.slice(0, visibleQuestions)
  const hasMoreQuestions = visibleQuestions < questions.length

  const handleLoadMore = () => {
    setIsLoading(true)
    // 로딩 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      setVisibleQuestions(prev => Math.min(prev + 9, questions.length))
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      {/* Header */}
      <Header activeTab="dashboard" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-20 py-6">
        {/* Welcome Section */} 
        <div className="mb-6">
          <h1 className="text-[#D1D5DB] font-bold text-2xl mb-2">
            안녕하세요, {user?.fullName || '사용자'}님
          </h1>
          <p className="text-[#9CA3AF] text-base">
            선택한 직무와 회사의 실제 면접 질문들을 우선순위별로 준비했어요
          </p>
        </div>

        {/* Questions Section */}
        <div className=" mt-12">
          <h2 className="text-[#D1D5DB] font-bold text-xl mb-6">
            맞춤 면접 질문
          </h2>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          {/* Loading State */}
          {isInitialLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-sm">질문을 불러오는 중...</p>
              </div>
            </div>
          ) : (
            /* Questions Grid */
            <div className="grid grid-cols-3 gap-6 mb-8">
              {currentQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  id={question.id}
                  companyName={question.companyName}
                  position={question.position}
                  questionType={question.questionType}
                  question={question.question}
                  companyLogo={question.companyLogo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More Section */}
        {hasMoreQuestions && (
          <div className="flex justify-center">
            <button 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="bg-[#171A1F] border border-blue-500 text-blue-500 font-medium text-sm px-8 py-3 rounded-xl hover:bg-blue-500 hover:text-white transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>로딩 중...</span>
                </>
              ) : (
                <>
                  <span>더 많은 질문 보기</span>
                  <div className="w-4 h-4 border border-current rounded"></div>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
