import { useEffect, useState, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import QuestionCard from '../../components/QuestionCard'
import Header from '../../components/Header'
import { SAMPLE_QUESTIONS, type Question } from '../../constants/questions'
import { fetchQuestions, type Question as ApiQuestion } from '../../api/questions'
import { ArrowUp } from 'lucide-react'
import { useCompanies } from '../../contexts/CompaniesContext'

export default function Dashboard() {
  const URL = import.meta.env.VITE_API_URL
  const { user } = useUser()
  const { getToken } = useAuth()
  const { companies, getCompanyName, loadCompanies } = useCompanies()
  const [questions, setQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState(false)
  const [cursorId, setCursorId] = useState<number | undefined>(undefined)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const loadQuestions = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // 토큰 가져오기
      const token = await getToken();
      
      console.log('Loading questions...', { cursorId, isInitial });
      const response = await fetchQuestions({ 
        cursor_id: cursorId, 
        size: 20,
        token: token || undefined
      });
      
      console.log('Loaded questions:', response);
      

      // API 응답 데이터를 Question 타입에 맞게 변환
      const apiQuestions: Question[] = response.values.map((item: ApiQuestion, index: number) => {
        // category를 간단하게 표시 (예: "프론트엔드 개발자" -> "프론트")
        const getShortCategory = (category: string): string => {
          if (category.includes('프론트엔드')) return '프론트'
          if (category.includes('백엔드')) return '백'
          if (category.includes('풀스택')) return '풀스택'
          if (category.includes('모바일')) return '모바일'
          if (category.includes('데이터')) return '데이터'
          if (category.includes('AI')) return 'AI'
          if (category.includes('DevOps')) return 'DevOps'
          if (category.includes('QA')) return 'QA'
          return category.length > 4 ? category.substring(0, 4) : category
        }

        return {
          id: item.question_id || index + 1,
          companyName: getCompanyName(item.company_id) || '알 수 없음',
          category: getShortCategory(item.category || '개발자'),
          questionType: item.tag === 'technology' ? '기술면접' : '인성면접',
          question: item.question || '질문 내용이 없습니다.',
          companyLogo: getCompanyName(item.company_id)?.charAt(0) || '알'
        }
      });
      
      if (isInitial) {
        setQuestions(apiQuestions);
      } else {
        // 중복 제거를 위해 기존 질문 내용과 비교
        setQuestions(prev => {
          const existingQuestions = new Set(prev.map(question => question.question));
          const newQuestions = apiQuestions.filter(question => !existingQuestions.has(question.question));
          return [...prev, ...newQuestions];
        });
      }
      
      setHasNext(response.has_next);
      setCursorId(response.values[response.values.length - 1]?.question_id);
      
    } catch (error) {
      console.error('Error loading questions:', error);
      setError('질문을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [cursorId, getCompanyName, getToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsInitialLoading(true)
        setError(null)
        
        // 회사 데이터가 없으면 새로 로드
        if (companies.length === 0) {
          await loadCompanies();
        }
        
        // 첫 번째 질문 데이터 로드
        await loadQuestions(true)
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
  }, [companies.length, loadCompanies])

  const handleScroll = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop;
    
    // 스크롤 위치에 따라 맨 위로 가기 버튼 표시/숨김
    setShowScrollTop(scrollTop > 300);
    
    // 무한 스크롤 처리
    if (window.innerHeight + scrollTop >= document.documentElement.offsetHeight - 1000) {
      if (hasNext && !loadingMore && !isLoading) {
        console.log('Loading more questions...');
        loadQuestions(false);
      }
    }
  }, [hasNext, loadingMore, isLoading, loadQuestions]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // 현재 보여줄 질문들 (모든 질문 표시)
  const currentQuestions = questions

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
                  position={question.category}
                  questionType={question.questionType}
                  question={question.question}
                  companyLogo={question.companyLogo}
                />
              ))}
            </div>
          )}
        </div>

        {/* Load More Section */}
        {/* 로딩 인디케이터 */}
        {loadingMore && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#D1D5DB] text-sm">더 많은 질문을 불러오는 중...</span>
            </div>
          </div>
        )}

        {/* 더 이상 데이터가 없을 때 */}
        {!hasNext && questions.length > 0 && (
          <div className="flex justify-center py-8">
            <span className="text-[#6B7280] text-sm">모든 질문을 불러왔습니다.</span>
          </div>
        )}
      </div>

      {/* 맨 위로 가기 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="맨 위로 가기"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
