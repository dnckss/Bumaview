export const COMPANY_MAP: { [key: string]: number } = {
  '더미도': 1,
  '달파': 2,
  '카카오': 3,
  '네이버': 4,
  '삼성전자': 5,
  'LG전자': 6,
  'SK하이닉스': 7,
  '현대자동차': 8,
  '기아': 9,
  'CJ': 10
}

export const getCompanyId = (companyName: string): number => {
  return COMPANY_MAP[companyName] || 0
}

export const companies = Object.keys(COMPANY_MAP)
