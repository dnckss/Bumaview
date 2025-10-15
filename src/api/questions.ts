const URL = import.meta.env.VITE_API_URL || 'https://bumaview.comodoapp.net';

export interface Question {
  question_id: number;
  company_id: number;
  question: string;
  category: string;
  tag: string;
  question_at: string;
  registrant_id: number;
}

export interface QuestionsResponse {
  values: Question[];
  has_next: boolean;
}

export interface QuestionsParams {
  cursor_id?: number;
  size?: number;
}

export const fetchQuestions = async (params: QuestionsParams = {}): Promise<QuestionsResponse> => {
  try {
    console.log('Questions API URL:', URL);
    
    const searchParams = new URLSearchParams();
    if (params.cursor_id) {
      searchParams.append('cursor_id', params.cursor_id.toString());
    }
    if (params.size) {
      searchParams.append('size', params.size.toString());
    }
    
    const fullUrl = `${URL}/questions?${searchParams.toString()}`;
    console.log('Full URL:', fullUrl);
    
    const response = await fetch(fullUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`질문 목록을 가져오는데 실패했습니다. Status: ${response.status}`);
    }
    
    const data: QuestionsResponse = await response.json();
    console.log('API Response:', data);
    console.log('Questions count:', data.values?.length);
    
    return data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};
