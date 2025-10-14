const URL = import.meta.env.VITE_API_URL || 'https://bumaview.comodoapp.net';

export interface Company {
  company_id: number;
  company_name: string;
}

interface CompaniesResponse {
  values: Company[];
  has_next: boolean;
}

export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    console.log('API URL:', URL);
    const fullUrl = `${URL}/companies/`;
    console.log('Full URL:', fullUrl);
    
    const response = await fetch(fullUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`회사 목록을 가져오는데 실패했습니다. Status: ${response.status}`);
    }
    
    const data: CompaniesResponse = await response.json();
    console.log('API Response:', data);
    console.log('Companies count:', data.values?.length);
    
    return data.values || [];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};
