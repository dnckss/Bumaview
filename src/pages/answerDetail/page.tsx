import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ArrowLeft, Heart, MessageCircle, ChevronDown } from 'lucide-react';
import Header from '../../components/Header';
import RepliesList from '../../components/RepliesList';
import axios from 'axios';

interface Answer {
  id: number;
  comment: string;
  author: string;
  createdAt: string;
  likes: number;  
  replies: number;
  isLiked?: boolean;
}


const AnswerDetailPage: React.FC = () => {
  const { answerId } = useParams<{ answerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { getToken } = useAuth();
  const URL = import.meta.env.VITE_API_URL;
  
  // 전달받은 답변 데이터 사용
  const answerData = location.state?.answerData;
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(true);

  // API에서 답변 상세 정보 가져오기
  useEffect(() => {
    const fetchAnswerDetail = async () => {
      try {
        setIsLoadingAnswer(true);
        
        if (answerId) {
          // 답변 상세 정보를 가져오는 API 호출
          const response = await axios.get(`${URL}/answers/${answerId}`);
          console.log('Answer Detail API Response:', response.data);
          
          const answerData = response.data;
          const apiAnswer: Answer = {
            id: answerData.answer_id || answerData.id || parseInt(answerId),
            comment: answerData.answer || answerData.comment || '답변 내용이 없습니다.',
            author: answerData.author_name || answerData.author || '익명',
            createdAt: answerData.created_at || answerData.createdAt || '날짜 없음',
            likes: answerData.likes || 0,
            replies: answerData.replies_count || answerData.replies || 0,
            isLiked: answerData.is_liked || answerData.isLiked || false
          };
          
          setAnswer(apiAnswer);
          setIsLiked(apiAnswer.isLiked || false);
          setLikes(apiAnswer.likes || 0);
        } else {
          // answerId가 없으면 전달받은 데이터 사용
          setAnswer(answerData || {
            id: parseInt(answerId || '1'),
            content: "답변 데이터를 불러올 수 없습니다.",
            author: "익명",
            createdAt: "날짜 없음",
            likes: 0,
            replies: 0,
            isLiked: false
          });
        }
      } catch (error) {
        console.error('답변 상세 정보를 불러오는데 실패했습니다:', error);
        // API 실패 시 전달받은 데이터나 기본값 사용
        setAnswer(answerData || {
          id: parseInt(answerId || '1'),
          content: "답변 데이터를 불러올 수 없습니다.",
          author: "익명",
          createdAt: "날짜 없음",
          likes: 0,
          replies: 0,
          isLiked: false
        });
      } finally {
        setIsLoadingAnswer(false);
      }
    };

    fetchAnswerDetail();
  }, [answerId, URL, answerData]);


  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !answerId) return;
    
    setIsSubmittingReply(true);
    try {
      const token = await getToken();
      const response = await axios.post(`${URL}/answers/${answerId}/comments`, {
        comment: replyText.trim()
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: false
      });
      
      console.log('답글 등록 성공:', response.data);
      setReplyText(''); // 입력창 초기화
      setRefreshTrigger(prev => prev + 1); // 답글 목록 새로고침
      
      // 성공 메시지 표시 (선택사항)
      alert('답글이 성공적으로 등록되었습니다.');
      
    } catch (error) {
      console.error('답글 등록 실패:', error);
      alert('답글 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmittingReply(false);
    }
  };


  // 로딩 중일 때 표시
  if (isLoadingAnswer) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">답변을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 답변 데이터가 없으면 에러 페이지
  if (!answer) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg">답변을 불러올 수 없습니다</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-500 hover:text-blue-400"
          >
            이전 페이지로 돌아가기
          </button>
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
          <span className="text-blue-500 text-sm font-medium">답변 목록</span>
        </div>

        {/* Answer Detail Section */}
        <div className="bg-[#171a1f] rounded-2xl p-6 mb-8">
          {/* Answer Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-9 h-9 bg-[#2a2f36] rounded-full flex items-center justify-center">
              <span className="text-blue-500 text-sm font-semibold">{answer.author.charAt(0)}</span>
            </div>
            <div>
              <div className="text-gray-300 text-sm font-medium">{answer.author}님</div>
              <div className="text-blue-500 text-xs">개발자</div>
            </div>
          </div>

          {/* Answer Content */}
          <p className="text-gray-300 text-sm leading-6 mb-4 whitespace-pre-line">
            {answer.comment}
          </p>

          {/* Answer Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${isLiked ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isLiked ? 'text-blue-500' : 'text-gray-400'}`}>{likes}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-xs">{answer.replies}개 토론</span>
              </div>
            </div>
            <span className="text-gray-400 text-xs">{answer.createdAt}</span>
          </div>
        </div>

        {/* Reply Input Section */}
        <div className="bg-[#171a1f] rounded-2xl p-6 mb-8">
          <h2 className="text-white text-lg font-semibold mb-4">답글 작성</h2>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="답글을 작성해주세요..."
            className="w-full bg-[#2a2f36] border border-[#374151] rounded-xl p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            rows={4}
          />
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleSubmitReply}
              disabled={!replyText.trim() || isSubmittingReply}
              className={`px-6 py-2 rounded-xl font-medium transition-colors ${
                !replyText.trim() || isSubmittingReply
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isSubmittingReply ? '등록 중...' : '답글 등록'}
            </button>
          </div>
        </div>

        {/* Discussion Section */}
        <section>
          {/* Discussion Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-xl font-semibold">토론</h2>
          </div>

          {/* Replies List */}
          <RepliesList 
            answerId={answerId || ''} 
            refreshTrigger={refreshTrigger}
          />

          {/* Load More Replies */}
          <div className="flex justify-center mt-12">
            <button className="bg-[#171a1f] border border-blue-500 rounded-xl px-8 py-3 flex items-center gap-2 hover:bg-blue-500/10 transition-colors">
              <span className="text-blue-500 text-sm font-medium">더 많은 답글 보기</span>
              <ChevronDown className="w-4 h-4 text-blue-500" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AnswerDetailPage;
