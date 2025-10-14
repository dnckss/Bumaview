import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { SAMPLE_QUESTIONS, type Question } from '../../constants/questions';
import { fetchCompanies, type Company } from '../../api/companies';
import Header from '../../components/Header';
import AnswersList from '../../components/AnswersList';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const URL = import.meta.env.VITE_API_URL;
  const [question, setQuestion] = useState<Question | undefined>(undefined);
  const [_companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { getToken } = useAuth()
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (URL && id) {
          // 회사 데이터와 질문 데이터를 병렬로 가져오기
          const [companiesData, questionResponse] = await Promise.all([
            fetchCompanies(),
            axios.get(`${URL}/questions/${id}`)
          ]);
          
          console.log('Companies API Response:', companiesData);
          console.log('Question API Response:', questionResponse.data);
          
          // 회사 데이터 저장
          setCompanies(companiesData);
          
          const questionData = questionResponse.data;
          
          // 회사 ID를 회사명으로 매핑하는 함수
          const getCompanyName = (companyId: number): string => {
            const company = companiesData.find(c => c.company_id === companyId);
            return company ? company.company_name : `회사 ${companyId}`;
          };
          
          const apiQuestion: Question = {
            id: questionData.question_id || questionData.id || parseInt(id),
            companyName: questionData.companyName || questionData.company || getCompanyName(questionData.company_id) || '알 수 없음',
            position: questionData.position || '개발자', // 기본값 설정
            questionType: questionData.category || questionData.questionType || questionData.type || '기술면접',
            question: questionData.question || questionData.content || '질문 내용이 없습니다.',
            companyLogo: questionData.companyLogo || getCompanyName(questionData.company_id)?.charAt(0) || '알'
          };
          setQuestion(apiQuestion);
        } else {
          // URL이 없으면 샘플 데이터에서 찾기
          const foundQuestion = SAMPLE_QUESTIONS.find(q => q.id === parseInt(id || '0'));
          setQuestion(foundQuestion);
        }
      } catch (error) {
        console.error('데이터를 불러오는데 실패했습니다:', error);
        // API 실패 시 샘플 데이터에서 찾기
        const foundQuestion = SAMPLE_QUESTIONS.find(q => q.id === parseInt(id || '0'));
        setQuestion(foundQuestion);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [URL, id]);
  
  // 질문이 없으면 대시보드로 리다이렉트
  if (!isLoading && !question) {
    navigate('/dashboard');
    return null;
  }

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleAnswerClick = (answerId: number) => {
    // 답변 데이터를 state로 전달
    const answerData = {
      id: answerId,
      content: getAnswerContent(answerId),
      author: getAnswerAuthor(answerId),
      createdAt: getAnswerCreatedAt(answerId),
      likes: getAnswerLikes(answerId),
      replies: getAnswerReplies(answerId),
      isLiked: getAnswerIsLiked(answerId)
    };
    
    navigate(`/answer/${answerId}`, { 
      state: { answerData } 
    });
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || !id) return;
    
    setIsSubmittingAnswer(true);
    try {
      const token = await getToken()
      const response = await axios.post(`${URL}/questions/${id}/answers`, {
        answer: answerText.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: false
      });
      
      console.log('답변 등록 성공:', response.data);
      setAnswerText(''); // 입력창 초기화
      setRefreshTrigger(prev => prev + 1); // 답변 목록 새로고침
      
      // 성공 메시지 표시 (선택사항)
      alert('답변이 성공적으로 등록되었습니다.');
      
    } catch (error) {
      console.error('답변 등록 실패:', error);
      alert('답변 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // 답변 데이터를 가져오는 헬퍼 함수들
  const getAnswerContent = (answerId: number): string => {
    const answers = {
      1: "Virtual DOM은 실제 DOM의 가상 표현으로, React에서 성능 최적화를 위해 사용하는 개념입니다. 실제 DOM 조작은 비용이 많이 들기 때문에, Virtual DOM을 통해 변경사항을 먼저 계산하고 최소한의 실제 DOM 업데이트만 수행합니다.\n\n주요 장점으로는 첫째, 배치(Batch) 업데이트를 통한 성능 향상이 있습니다. 여러 상태 변경을 한 번에 처리하죠. 둘째, Diffing 알고리즘을 통해 변경된 부분만 업데이트하여 효율성을 높입니다. 셋째, 예측 가능한 렌더링으로 디버깅이 용이해집니다.",
      2: "Virtual DOM은 메모리 상에 존재하는 JavaScript 객체로 실제 DOM의 복사본이라고 할 수 있습니다. React는 상태가 변경될 때마다 새로운 Virtual DOM 트리를 생성하고, 이전 트리와 비교하여 차이점을 찾아냅니다.\n\n이 과정을 Reconciliation이라고 하는데, 여기서 핵심은 Diffing 알고리즘입니다. 트리의 루트부터 시작해서 변경된 노드만 실제 DOM에 반영하죠. 이렇게 하면 전체 페이지를 다시 렌더링하는 것보다 훨씬 효율적입니다.",
      3: "Virtual DOM을 설명드리기 전에 먼저 실제 DOM의 문제점을 말씀드리겠습니다. 실제 DOM은 무겁고 조작 비용이 크며, 직접 조작할 경우 레이아웃 재계산이나 리페인팅이 자주 발생합니다.\n\nVirtual DOM은 이러한 문제를 해결하기 위한 개념으로, 실제 DOM의 가벼운 JavaScript 표현입니다. 상태 변경 시 새로운 Virtual DOM 트리를 생성하고, Diffing을 통해 이전 트리와 비교한 후 변경된 부분만 실제 DOM에 적용합니다. 결과적으로 불필요한 DOM 조작을 줄여 성능을 크게 향상시킵니다."
    };
    return answers[answerId as keyof typeof answers] || "답변 내용이 없습니다.";
  };

  const getAnswerAuthor = (answerId: number): string => {
    const authors = { 1: "이**님", 2: "박**님", 3: "최**님" };
    return authors[answerId as keyof typeof authors] || "익명";
  };

  const getAnswerCreatedAt = (answerId: number): string => {
    const dates = { 1: "2024.01.15", 2: "2024.01.12", 3: "2024.01.08" };
    return dates[answerId as keyof typeof dates] || "날짜 없음";
  };

  const getAnswerLikes = (answerId: number): number => {
    const likes = { 1: 24, 2: 18, 3: 32 };
    return likes[answerId as keyof typeof likes] || 0;
  };

  const getAnswerReplies = (answerId: number): number => {
    const replies = { 1: 3, 2: 2, 3: 5 };
    return replies[answerId as keyof typeof replies] || 0;
  };

  const getAnswerIsLiked = (answerId: number): boolean => {
    const isLiked = { 1: false, 2: false, 3: true };
    return isLiked[answerId as keyof typeof isLiked] || false;
  };

  // 로딩 중일 때 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">질문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <Header activeTab="dashboard" />

      {/* Main Content */}
      <main className="max-w-[1360px] mx-auto px-10 py-10">
        {/* Back Button */}
        <div className="flex items-center gap-1 mb-12 cursor-pointer" onClick={handleBackClick}>
          <div className="w-5 h-5">
            <ArrowLeft className="w-4 h-4 text-blue-500 m-0.5" />
          </div>
          <span className="text-blue-500 text-sm font-medium">질문 목록</span>
        </div>

        {/* Question Info Section */}
        <div className="bg-[#171a1f] rounded-2xl p-8 pt-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Company Tag */}
            <div className="bg-[#1f2937] rounded-2xl px-6 py-3 flex items-center gap-3">
              <span className="text-blue-500 font-semibold text-sm">{question?.companyName}</span>
              <span className="text-gray-400 text-sm">{question?.position}</span>
            </div>

            {/* Priority Badge */}
            <div className="bg-blue-500 rounded-2xl px-4 py-2">
              <span className="text-white text-sm m-2 font-semibold">{question?.questionType}</span>
            </div>
          </div>

          {/* Question Title */}
          <h1 className="text-white text-lg font-semibold leading-7">
            {question?.question}
          </h1>
        </div>

        {/* Answer Input Section */}
        <div className="bg-[#171a1f] rounded-2xl p-6 mb-8">
          <h2 className="text-white text-lg font-semibold mb-4">내 답변</h2>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="여기에 답변을 작성해주세요..."
            className="w-full bg-[#2a2f36] border border-[#374151] rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            rows={6}
          />
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleSubmitAnswer}
              disabled={!answerText.trim() || isSubmittingAnswer}
              className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                !answerText.trim() || isSubmittingAnswer
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmittingAnswer ? '등록 중...' : '답변 등록'}
            </button>
          </div>
        </div>

        {/* Answers Section */}
        <AnswersList 
          questionId={id || ''} 
          onAnswerClick={handleAnswerClick}
          refreshTrigger={refreshTrigger}
        />
      </main>
    </div>
  );
};

export default QuestionDetailPage;
