import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface Answer {
  answer_id: number;
  answer: string;
  author_name?: string;
  created_at: string;
  likes?: number;
  replies_count?: number;
  is_liked?: boolean;
}

interface AnswersListProps {
  questionId: string;
  onAnswerClick: (answerId: number) => void;
  refreshTrigger?: number; // 답변 등록 후 새로고침을 위한 트리거
}

const AnswersList: React.FC<AnswersListProps> = ({ questionId, onAnswerClick, refreshTrigger }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`${URL}/questions/${questionId}/answers`, {
          params: {
            size: 20
          }
        });
        
        console.log('Answers API Response:', response.data);
        
        // API 응답 구조에 따라 데이터 처리
        const answersData = response.data.values || response.data.answers || response.data || [];
        setAnswers(answersData);
        
      } catch (error) {
        console.error('답변을 불러오는데 실패했습니다:', error);
        setError('답변을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (questionId) {
      fetchAnswers();
    }
  }, [questionId, URL, refreshTrigger]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-xl font-semibold">다른 사람들의 답변 사례</h2>
        </div>
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-xl font-semibold">다른 사람들의 답변 사례</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  if (answers.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-xl font-semibold">다른 사람들의 답변 사례</h2>
          <div className="bg-[#171a1f] border border-[#2a2f36] rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="text-gray-300 text-sm font-medium">최신순</span>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="bg-[#171a1f] rounded-2xl p-8">
            <p className="text-gray-400 text-lg">아직 답변이 없습니다</p>
            <p className="text-gray-500 text-sm mt-2">첫 번째 답변을 작성해보세요!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-white text-xl font-semibold">다른 사람들의 답변 사례</h2>
        <div className="bg-[#171a1f] border border-[#2a2f36] rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="text-gray-300 text-sm font-medium">최신순</span>
        </div>
      </div>

      {/* Answers List */}
      <div className="space-y-6">
        {answers.map((answer) => (
          <div 
            key={answer.answer_id}
            className="bg-[#171a1f] rounded-2xl p-6 cursor-pointer hover:bg-[#1a1d23] transition-colors duration-150"
            onClick={() => onAnswerClick(answer.answer_id)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-9 h-9 bg-[#2a2f36] rounded-full flex items-center justify-center">
                <span className="text-blue-500 text-sm font-semibold">
                  {answer.author_name?.charAt(0) || '익'}
                </span>
              </div>
              <div>
                <div className="text-gray-300 text-sm font-medium">
                  {answer.author_name || '익명'}님
                </div>
                <div className="text-blue-500 text-xs">개발자</div>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-6 mb-4">
              {answer.answer}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${answer.is_liked ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-xs ${answer.is_liked ? 'text-blue-500' : 'text-gray-400'}`}>
                    {answer.likes || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-xs">{answer.replies_count || 0}개 토론</span>
                </div>
              </div>
              <span className="text-gray-400 text-xs">
                {formatDate(answer.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="flex justify-center mt-12">
        <button className="bg-[#171a1f] border border-blue-500 rounded-xl px-8 py-3 flex items-center gap-2 hover:bg-blue-500/10 transition-colors">
          <span className="text-blue-500 text-sm font-medium">더 많은 답변 보기</span>
        </button>
      </div>
    </section>
  );
};

export default AnswersList;
