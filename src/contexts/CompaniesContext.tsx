import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { fetchAllCompanies, type Company } from '../api/companies';

interface CompaniesContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  getCompanyName: (companyId: number) => string;
  loadCompanies: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextType | undefined>(undefined);

export const useCompanies = () => {
  const context = useContext(CompaniesContext);
  if (context === undefined) {
    throw new Error('useCompanies must be used within a CompaniesProvider');
  }
  return context;
};

interface CompaniesProviderProps {
  children: ReactNode;
}

// localStorage 키
const COMPANIES_STORAGE_KEY = 'bumaview_companies';
const COMPANIES_TIMESTAMP_KEY = 'bumaview_companies_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30분

export const CompaniesProvider: React.FC<CompaniesProviderProps> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage에서 회사 데이터 로드
  const loadCompaniesFromStorage = (): Company[] | null => {
    try {
      const storedData = localStorage.getItem(COMPANIES_STORAGE_KEY);
      const timestamp = localStorage.getItem(COMPANIES_TIMESTAMP_KEY);
      
      if (!storedData || !timestamp) {
        return null;
      }
      
      const now = Date.now();
      const storedTime = parseInt(timestamp);
      
      // 캐시가 만료되었는지 확인
      if (now - storedTime > CACHE_DURATION) {
        localStorage.removeItem(COMPANIES_STORAGE_KEY);
        localStorage.removeItem(COMPANIES_TIMESTAMP_KEY);
        return null;
      }
      
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Failed to load companies from storage:', error);
      return null;
    }
  };

  // localStorage에 회사 데이터 저장
  const saveCompaniesToStorage = (companiesData: Company[]) => {
    try {
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companiesData));
      localStorage.setItem(COMPANIES_TIMESTAMP_KEY, Date.now().toString());
      console.log('Companies data saved to localStorage');
    } catch (error) {
      console.error('Failed to save companies to storage:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      // 이미 데이터가 있으면 로드하지 않음
      if (companies.length > 0) {
        console.log('Companies data already loaded:', companies.length);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      // 먼저 localStorage에서 확인
      const cachedCompanies = loadCompaniesFromStorage();
      if (cachedCompanies) {
        console.log('Using cached companies data:', cachedCompanies.length);
        setCompanies(cachedCompanies);
        setIsLoading(false);
        return;
      }
      
      // 캐시가 없거나 만료된 경우 API에서 로드
      console.log('Loading companies data from API...');
      const companiesData = await fetchAllCompanies();
      console.log('Companies loaded from API:', companiesData.length);
      
      setCompanies(companiesData);
      saveCompaniesToStorage(companiesData);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('회사 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanyName = (companyId: number): string => {
    const company = companies.find(c => c.company_id === companyId);
    return company ? company.company_name : `회사 ${companyId}`;
  };

  const refreshCompanies = async () => {
    // 강제로 새로고침할 때는 캐시 무시
    localStorage.removeItem(COMPANIES_STORAGE_KEY);
    localStorage.removeItem(COMPANIES_TIMESTAMP_KEY);
    await loadCompanies();
  };

  // 초기 로딩 제거 - 필요할 때만 로드

  const value: CompaniesContextType = {
    companies,
    isLoading,
    error,
    getCompanyName,
    loadCompanies,
    refreshCompanies,
  };

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  );
};
