const URL = import.meta.env.VITE_API_URL || 'https://bumaview.comodoapp.net';

export interface Company {
  company_id: number;
  company_name: string;
}

export interface CompaniesResponse {
  values: Company[];
  has_next: boolean;
}

export interface CompaniesParams {
  cursor_id?: number;
  size?: number;
}

export const fetchCompanies = async (params: CompaniesParams = {}): Promise<CompaniesResponse> => {
  try {
    console.log('API URL:', URL);
    
    const searchParams = new URLSearchParams();
    if (params.cursor_id) {
      searchParams.append('cursor_id', params.cursor_id.toString());
    }
    if (params.size) {
      searchParams.append('size', params.size.toString());
    }
    
    const fullUrl = `${URL}/companies/?${searchParams.toString()}`;
    console.log('Full URL:', fullUrl);
    
    const response = await fetch(fullUrl);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`회사 목록을 가져오는데 실패했습니다. Status: ${response.status}`);
    }
    
    const data: CompaniesResponse = await response.json();
    console.log('API Response:', data);
    console.log('Companies count:', data.values?.length);
    
    return data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};

export const fetchAllCompanies = async (): Promise<Company[]> => {
  try {
    console.log('Fetching all companies...');
    let allCompanies: Company[] = [];
    let cursorId: number | undefined = undefined;
    let hasNext = true;
    
    while (hasNext) {
      const response = await fetchCompanies({ 
        cursor_id: cursorId, 
        size: 20 
      });
      
      allCompanies = [...allCompanies, ...response.values];
      hasNext = response.has_next;
      cursorId = response.values[response.values.length - 1]?.company_id;
      
      console.log(`Loaded ${allCompanies.length} companies so far, hasNext: ${hasNext}`);
    }
    
    console.log(`Total companies loaded: ${allCompanies.length}`);
    return allCompanies;
  } catch (error) {
    console.error('Error fetching all companies:', error);
    throw error;
  }
};
