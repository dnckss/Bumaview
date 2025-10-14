import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';

interface Reply {
  answer_comment_id: number;
  answer_id: number;
  user_id: number;
  comment: string;
  author_name?: string;
  created_at?: string;
  likes?: number;
  is_liked?: boolean;
}

interface RepliesListProps {
  answerId: string;
  refreshTrigger?: number;
}

const RepliesList: React.FC<RepliesListProps> = ({ answerId, refreshTrigger }) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(`${URL}/answers/${answerId}/comments`, {
          params: {
            size: 20
          }
        });
        
        console.log('Replies API Response:', response.data);
        
        // API 응답 구조에 따라 데이터 처리
        const repliesData = response.data.values || response.data.replies || response.data || [];
        
        // API 응답 데이터를 Reply 인터페이스에 맞게 변환
        const formattedReplies: Reply[] = repliesData.map((item: any) => ({
          answer_comment_id: item.answer_comment_id || item.reply_id || item.id,
          answer_id: item.answer_id || parseInt(answerId),
          user_id: item.user_id || 0,
          comment: item.comment || item.reply || item.content || '',
          author_name: item.author_name || item.author || `사용자${item.user_id || ''}`,
          created_at: item.created_at || item.createdAt || new Date().toISOString(),
          likes: item.likes || 0,
          is_liked: item.is_liked || item.isLiked || false
        }));
        
        setReplies(formattedReplies);
        
      } catch (error) {
        console.error('답글을 불러오는데 실패했습니다:', error);
        setError('답글을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (answerId) {
      fetchReplies();
    }
  }, [answerId, URL, refreshTrigger]);

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
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-[#171a1f] rounded-2xl p-6">
          <p className="text-gray-400">아직 답글이 없습니다</p>
          <p className="text-gray-500 text-sm mt-2">첫 번째 답글을 작성해보세요!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {replies.map((reply) => (
        <div key={reply.answer_comment_id} className="bg-[#171a1f] rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-9 h-9 bg-[#2a2f36] rounded-full flex items-center justify-center">
              <span className="text-blue-500 text-sm font-semibold">
                {(reply.author_name || `사용자${reply.user_id}`).charAt(0)}
              </span>
            </div>
            <div>
              <div className="text-gray-300 text-sm font-medium">
                {reply.author_name || `사용자${reply.user_id}`}님
              </div>
              <div className="text-blue-500 text-xs">개발자</div>
            </div>
          </div>

          <p className="text-gray-300 text-sm leading-6 mb-4">
            {reply.comment}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${reply.is_liked ? 'text-blue-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${reply.is_liked ? 'text-blue-500' : 'text-gray-400'}`}>
                  {reply.likes || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-xs">답글</span>
              </div>
            </div>
            <span className="text-gray-400 text-xs">
              {formatDate(reply.created_at || '')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RepliesList;
