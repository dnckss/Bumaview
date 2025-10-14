import React, { useState } from 'react';
import { Heart, Reply } from 'lucide-react';

interface Reply {
  id: number;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
}

interface ReplyCardProps {
  reply: Reply;
  onReply?: (replyId: number) => void;
}

const ReplyCard: React.FC<ReplyCardProps> = ({ reply, onReply }) => {
  const [isLiked, setIsLiked] = useState(reply.isLiked || false);
  const [likes, setLikes] = useState(reply.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReply) {
      onReply(reply.id);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#374151] rounded-lg p-4 ml-6">
      {/* 답글 내용 */}
      <div className="mb-3">
        <p className="text-[#D1D5DB] text-sm leading-relaxed">
          {reply.content}
        </p>
      </div>

      {/* 답글 메타 정보 */}
      <div className="flex items-center justify-between text-xs text-[#9CA3AF] mb-3">
        <div className="flex items-center space-x-3">
          <span className="font-medium">{reply.author}</span>
          <span>•</span>
          <span>{reply.createdAt}</span>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors duration-150 ${
            isLiked 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
              : 'text-[#9CA3AF] hover:bg-[#374151] hover:text-[#D1D5DB]'
          }`}
        >
          <Heart size={14} className={isLiked ? 'fill-current' : ''} />
          <span>{likes}</span>
        </button>

        <button
          onClick={handleReply}
          className="flex items-center space-x-1 text-[#9CA3AF] hover:text-[#60A5FA] transition-colors duration-150"
        >
          <Reply size={14} />
          <span>답글</span>
        </button>
      </div>
    </div>
  );
};

export default ReplyCard;
