import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowLeft, Heart, MessageCircle, Reply, ChevronDown } from 'lucide-react';
import Header from '../../components/Header';

interface Answer {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  replies: number;
  isLiked?: boolean;
}

interface Reply {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

const AnswerDetailPage: React.FC = () => {
  const { answerId } = useParams<{ answerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  
  // 전달받은 답변 데이터 사용
  const answerData = location.state?.answerData;
  const [isLiked, setIsLiked] = useState(answerData?.isLiked || false);
  const [likes, setLikes] = useState(answerData?.likes || 0);

  // 전달받은 데이터가 없으면 기본값 사용
  const answer: Answer = answerData || {
    id: parseInt(answerId || '1'),
    content: "답변 데이터를 불러올 수 없습니다.",
    author: "익명",
    createdAt: "날짜 없음",
    likes: 0,
    replies: 0,
    isLiked: false
  };

  // 더미 토론 데이터
  const [replies] = useState<Reply[]>([
    {
      id: 1,
      content: "좋은 답변 감사합니다! 추가로 궁금한 점이 있는데, 이 방법의 시간 복잡도는 어떻게 되나요?",
      author: "질문자",
      createdAt: "1시간 전",
      likes: 2,
      isLiked: false
    },
    {
      id: 2,
      content: "시간 복잡도는 O(n log n)입니다. 더 자세한 설명이 필요하시면 말씀해주세요!",
      author: "김개발",
      createdAt: "30분 전",
      likes: 5,
      isLiked: true
    },
    {
      id: 3,
      content: "실제로 구현해보니 생각보다 복잡하네요. 다른 방법도 있을까요?",
      author: "초보개발자",
      createdAt: "15분 전",
      likes: 1,
      isLiked: false
    }
  ]);

  const handleBackClick = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev: number) => isLiked ? prev - 1 : prev + 1);
  };

  const handleReply = (replyId: number) => {
    console.log('Reply to:', replyId);
    // 답글 작성 로직
  };

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
              <div className="text-blue-500 text-xs">프론트엔드 개발자</div>
            </div>
          </div>

          {/* Answer Content */}
          <p className="text-gray-300 text-sm leading-6 mb-4 whitespace-pre-line">
            {answer.content}
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

        {/* Discussion Section */}
        <section>
          {/* Discussion Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-white text-xl font-semibold">토론</h2>
            <div className="bg-[#171a1f] border border-[#2a2f36] rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-gray-300 text-sm font-medium">최신순</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>

          {/* Replies List */}
          <div className="space-y-6">
            {replies.map((reply) => (
              <div key={reply.id} className="bg-[#171a1f] rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-9 h-9 bg-[#2a2f36] rounded-full flex items-center justify-center">
                    <span className="text-blue-500 text-sm font-semibold">{reply.author.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-gray-300 text-sm font-medium">{reply.author}님</div>
                    <div className="text-blue-500 text-xs">개발자</div>
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-6 mb-4">
                  {reply.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Heart className={`w-4 h-4 ${reply.isLiked ? 'text-blue-500' : 'text-gray-400'}`} />
                      <span className={`text-xs ${reply.isLiked ? 'text-blue-500' : 'text-gray-400'}`}>{reply.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-xs">답글</span>
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs">{reply.createdAt}</span>
                </div>
              </div>
            ))}
          </div>

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
