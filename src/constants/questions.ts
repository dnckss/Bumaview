export interface Question {
  id: number
  companyName: string
  position: string
  questionType: string
  question: string
  companyLogo: string
}

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    companyName: "카카오",
    position: "프론트엔드 개발자",
    questionType: "기술면접",
    question: "React의 Virtual DOM이 무엇이고, 실제 DOM과 어떤 차이가 있는지 설명해주세요. 또한 성능 최적화 관점에서 어떤 장점이 있나요?",
    companyLogo: "카"
  },
  {
    id: 2,
    companyName: "카카오",
    position: "프론트엔드 개발자",
    questionType: "기술면접",
    question: "상태 관리 라이브러리(Redux, Zustand 등)를 선택할 때 어떤 기준을 사용하나요? 각각의 장단점을 설명해주세요.",
    companyLogo: "카"
  },
  {
    id: 3,
    companyName: "카카오",
    position: "프론트엔드 개발자",
    questionType: "기술면접",
    question: "React의 Virtual DOM이 무엇이고, 실제 DOM과 어떤 차이가 있는지 설명해주세요. 또한 성능 최적화 관점에서 어떤 장점이 있나요?",
    companyLogo: "카"
  },
  {
    id: 4,
    companyName: "카카오",
    position: "프론트엔드 개발자",
    questionType: "기술면접",
    question: "상태 관리 라이브러리(Redux, Zustand 등)를 선택할 때 어떤 기준을 사용하나요? 각각의 장단점을 설명해주세요.",
    companyLogo: "카"
  },
  {
    id: 5,
    companyName: "카카오",
    position: "프론트엔드 개발자",
    questionType: "기술면접",
    question: "React의 Virtual DOM이 무엇이고, 실제 DOM과 어떤 차이가 있는지 설명해주세요. 또한 성능 최적화 관점에서 어떤 장점이 있나요?",
    companyLogo: "카"
  },
  {
    id: 6,
    companyName: "카카오",
    position: "프론트엔드 개발자",
    questionType: "기술면접",
    question: "상태 관리 라이브러리(Redux, Zustand 등)를 선택할 때 어떤 기준을 사용하나요? 각각의 장단점을 설명해주세요.",
    companyLogo: "카"
  },
  {
    id: 7,
    companyName: "삼성전자",
    position: "백엔드 개발자",
    questionType: "기술면접",
    question: "RESTful API와 GraphQL의 차이점을 설명하고, 각각의 장단점을 비교해주세요.",
    companyLogo: "삼"
  },
  {
    id: 8,
    companyName: "네이버",
    position: "풀스택 개발자",
    questionType: "기술면접",
    question: "마이크로서비스 아키텍처의 장단점과 모놀리식 아키텍처와의 차이점을 설명해주세요.",
    companyLogo: "네"
  },
  {
    id: 9,
    companyName: "LG전자",
    position: "데이터 사이언티스트",
    questionType: "기술면접",
    question: "머신러닝 모델의 과적합(Overfitting) 문제를 해결하는 방법들을 설명해주세요.",
    companyLogo: "LG"
  },
  {
    id: 10,
    companyName: "SK하이닉스",
    position: "데이터 엔지니어",
    questionType: "기술면접",
    question: "빅데이터 처리에서 ETL과 ELT의 차이점과 각각의 사용 사례를 설명해주세요.",
    companyLogo: "SK"
  },
  {
    id: 11,
    companyName: "현대자동차",
    position: "UI/UX 디자이너",
    questionType: "기술면접",
    question: "사용자 경험(UX) 설계에서 사용자 리서치의 중요성과 주요 방법들을 설명해주세요.",
    companyLogo: "현"
  },
  {
    id: 12,
    companyName: "기아",
    position: "프로덕트 디자이너",
    questionType: "기술면접",
    question: "제품 개발 과정에서 사용자 피드백을 어떻게 수집하고 반영하시나요?",
    companyLogo: "기"
  },
  {
    id: 13,
    companyName: "CJ",
    position: "그래픽 디자이너",
    questionType: "기술면접",
    question: "브랜드 아이덴티티를 시각적으로 표현할 때 고려해야 할 요소들은 무엇인가요?",
    companyLogo: "CJ"
  },
  {
    id: 14,
    companyName: "더미도",
    position: "데브옵스 엔지니어",
    questionType: "기술면접",
    question: "CI/CD 파이프라인 구축 시 고려해야 할 보안 요소들을 설명해주세요.",
    companyLogo: "더"
  },
  {
    id: 15,
    companyName: "달파",
    position: "데이터 분석가",
    questionType: "기술면접",
    question: "A/B 테스트 설계 시 통계적 유의성을 확보하기 위한 방법들을 설명해주세요.",
    companyLogo: "달"
  }
]

// 질문 타입별 색상 매핑
export const QUESTION_TYPE_COLORS: { [key: string]: string } = {
  '기술면접': 'bg-blue-500',
  '인성면접': 'bg-green-500',
  '코딩테스트': 'bg-purple-500',
  '프로젝트': 'bg-orange-500'
}

// 회사별 로고 매핑
export const COMPANY_LOGOS: { [key: string]: string } = {
  '카카오': '카',
  '네이버': '네',
  '삼성전자': '삼',
  'LG전자': 'LG',
  'SK하이닉스': 'SK',
  '현대자동차': '현',
  '기아': '기',
  'CJ': 'CJ',
  '더미도': '더',
  '달파': '달'
}