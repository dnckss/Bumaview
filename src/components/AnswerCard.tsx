import React, { useState } from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Answer {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  replies: number;
  isLiked?: boolean;
}

interface AnswerCardProps {
  answer: Answer;
  onAnswerClick: (answer: Answer) => void;
  showReplies?: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ 
  answer, 
  onAnswerClick, 
  showReplies = false 
}) => {
  const [isLiked, setIsLiked] = useState(answer.isLiked || false);
  const [likes, setLikes] = useState(answer.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleCardClick = () => {
    onAnswerClick(answer);
  };

  return (
    <div 
      className="bg-[#1F2937] border border-[#374151] rounded-lg p-6 hover:border-[#60A5FA] transition-colors duration-150 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* 답변 내용 */}
      <div className="mb-4">
        <p className="text-[#F9FAFB] text-base leading-relaxed group-hover:text-[#60A5FA] transition-colors duration-150">
          {answer.content}
        </p>
      </div>

      {/* 답변 메타 정보 */}
      <div className="flex items-center justify-between text-sm text-[#9CA3AF] mb-4">
        <div className="flex items-center space-x-4">
          <span className="font-medium">{answer.author}</span>
          <span>•</span>
          <span>{answer.createdAt}</span>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-6">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-md transition-colors duration-150 ${
            isLiked 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#D1D5DB]'
          }`}
        >
          <Heart size={16} className={isLiked ? 'fill-current' : ''} />
          <span>{likes}</span>
        </button>

        <div className="flex items-center space-x-2 text-[#9CA3AF]">
          <MessageCircle size={16} />
          <span>{answer.replies}개 답변</span>
        </div>

        {showReplies && (
          <div className="flex items-center space-x-1 text-[#60A5FA]">
            <span className="text-sm">토론 보기</span>
            <ChevronDown size={16} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerCard;
