export const POSITION_MAP: { [key: string]: number } = {
  '프론트엔드 개발자': 1,
  '백엔드 개발자': 2,
  '풀스택 개발자': 3,
  '모바일 개발자': 4,
  '데브옵스 엔지니어': 5,
  '데이터 사이언티스트': 6,
  '데이터 분석가': 7,
  '데이터 엔지니어': 8,
  'UI/UX 디자이너': 9,
  '프로덕트 디자이너': 10,
  '그래픽 디자이너': 11
}

export const POSITION_CATEGORIES = [
  {
    title: '개발 · Development',
    roles: [
      { name: '프론트엔드 개발자', id: 1 },
      { name: '백엔드 개발자', id: 2 },
      { name: '풀스택 개발자', id: 3 },
      { name: '모바일 개발자', id: 4 },
      { name: '데브옵스 엔지니어', id: 5 }
    ]
  },
  {
    title: '데이터 · Data',
    roles: [
      { name: '데이터 사이언티스트', id: 6 },
      { name: '데이터 분석가', id: 7 },
      { name: '데이터 엔지니어', id: 8 }
    ]
  },
  {
    title: '디자인 · Design',
    roles: [
      { name: 'UI/UX 디자이너', id: 9 },
      { name: '프로덕트 디자이너', id: 10 },
      { name: '그래픽 디자이너', id: 11 }
    ]
  }
]

export const getPositionId = (positionName: string): number => {
  return POSITION_MAP[positionName] || 0
}

export const positions = Object.keys(POSITION_MAP)
