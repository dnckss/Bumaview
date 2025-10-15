import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ArrowUp } from 'lucide-react';
import Header from '../../components/Header';
import JobPostingCard from '../../components/JobPostingCard';
import { fetchJobPostings } from '../../api/jobPostings';
import type { JobPosting, JobPostingsParams } from '../../api/jobPostings';
import { useCompanies } from '../../contexts/CompaniesContext';

const JobPostingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getCompanyName } = useCompanies();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<JobPostingsParams>({});
  const [searchInput, setSearchInput] = useState('');
  const [hasNext, setHasNext] = useState(true);
  const [cursorId, setCursorId] = useState<number | undefined>(undefined);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const [activeFilterTab, setActiveFilterTab] = useState<string | null>(null);
  const [uniqueEmploymentTypes, setUniqueEmploymentTypes] = useState<string[]>([]);
  const [_uniqueWorkLocations, setUniqueWorkLocations] = useState<string[]>([]);

  const loadJobPostings = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const params = {
        ...searchParams,
        cursor_id: cursorId,
        size: 20
      };
      
      console.log('Loading job postings...', { cursorId, isInitial, params });
      const jobPostingsData = await fetchJobPostings(params);
      
      console.log('Loaded job postings:', jobPostingsData);
      
      // 채용공고 데이터에 회사명 추가
      const jobPostingsWithCompanyNames = jobPostingsData.map(job => ({
        ...job,
        company_name: getCompanyName(job.company_id)
      }));
      
      if (isInitial) {
        setJobPostings(jobPostingsWithCompanyNames);
      } else {
        // 중복 제거를 위해 ID 기반으로 필터링
        setJobPostings(prev => {
          const existingIds = new Set(prev.map(job => job.company_job_posting_id));
          const newJobs = jobPostingsWithCompanyNames.filter(job => !existingIds.has(job.company_job_posting_id));
          return [...prev, ...newJobs];
        });
      }
      
      setHasNext(jobPostingsData.length > 0); // 실제로는 API에서 has_next를 받아야 함
      setCursorId(jobPostingsData[jobPostingsData.length - 1]?.company_job_posting_id);
      
    } catch (error) {
      console.error('Error loading job postings:', error);
      setError('채용공고를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  }, [cursorId, searchParams, getCompanyName]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setHasNext(true);
        setCursorId(undefined);
        
        // 첫 번째 채용공고 데이터 로드
        setIsLoading(true);
        const params = {
          ...searchParams,
          cursor_id: undefined,
          size: 20
        };
        
        console.log('Loading initial job postings...', params);
        const jobPostingsData = await fetchJobPostings(params);
        
        console.log('Loaded initial job postings:', jobPostingsData);
        
        // 채용공고 데이터에 회사명 추가
        const jobPostingsWithCompanyNames = jobPostingsData.map(job => ({
          ...job,
          company_name: getCompanyName(job.company_id)
        }));
        
        setJobPostings(jobPostingsWithCompanyNames);
        setHasNext(jobPostingsData.length > 0);
        setCursorId(jobPostingsData[jobPostingsData.length - 1]?.company_job_posting_id);
        setIsLoading(false);
        
        // 고유한 고용형태와 근무지역 추출 (전체 데이터에서)
        const allJobPostings = await fetchJobPostings({});
        const employmentTypes = [...new Set(allJobPostings.map(job => job.employment_type))].sort();
        const workLocations = [...new Set(allJobPostings.map(job => job.work_location))].sort();
        
        setUniqueEmploymentTypes(employmentTypes);
        setUniqueWorkLocations(workLocations);
      } catch (err) {
        console.error('데이터를 불러오는데 실패했습니다:', err);
        setError('데이터를 불러오는데 실패했습니다.');
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams, getCompanyName]);

  const handleSearch = () => {
    setSearchParams(prev => ({
      ...prev,
      company_name: searchInput.trim() || undefined,
    }));
    // 검색 시 무한 스크롤 상태 초기화
    setCursorId(undefined);
    setHasNext(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (field: keyof JobPostingsParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value === 'all' ? undefined : value,
    }));
    // 필터 변경 시 무한 스크롤 상태 초기화
    setCursorId(undefined);
    setHasNext(true);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchInput('');
    // 필터 초기화 시 무한 스크롤 상태 초기화
    setCursorId(undefined);
    setHasNext(true);
  };


  const handleCardClick = (jobPosting: JobPosting) => {
    navigate(`/job-posting/${jobPosting.company_job_posting_id}`, {
      state: { jobPosting }
    });
  };

  const handleScroll = useCallback(() => {
    const scrollTop = document.documentElement.scrollTop;
    
    // 스크롤 위치에 따라 맨 위로 가기 버튼 표시/숨김
    setShowScrollTop(scrollTop > 300);
    
    // 무한 스크롤 처리
    if (window.innerHeight + scrollTop >= document.documentElement.offsetHeight - 1000) {
      if (hasNext && !loadingMore && !isLoading) {
        console.log('Loading more job postings...');
        loadJobPostings(false);
      }
    }
  }, [hasNext, loadingMore, isLoading, loadJobPostings]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <Header activeTab="job-postings" />

      {/* Main Content */}
      <main className="max-w-[1360px] mx-auto px-10 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">채용공고</h1>
          
        </div>

        {/* Search Bar */}
        <div className="bg-[#171a1f] rounded-2xl p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="회사명으로 검색..."
                className="w-full bg-[#2a2f36] border border-[#374151] rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              검색
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-[#171a1f] rounded-2xl mb-8 overflow-hidden">
          {/* Filter Tab Headers */}
          <div className="flex border-b border-[#2a2f36]">
            <button
              onClick={() => setActiveFilterTab(activeFilterTab === 'location' ? null : 'location')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeFilterTab === 'location' 
                  ? 'bg-[#2a2f36] text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1d23]'
              }`}
            >
              근무지역
              <ChevronDown className={`w-4 h-4 transition-transform ${activeFilterTab === 'location' ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setActiveFilterTab(activeFilterTab === 'employment' ? null : 'employment')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeFilterTab === 'employment' 
                  ? 'bg-[#2a2f36] text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1d23]'
              }`}
            >
              고용형태
              <ChevronDown className={`w-4 h-4 transition-transform ${activeFilterTab === 'employment' ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setActiveFilterTab(activeFilterTab === 'experience' ? null : 'experience')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeFilterTab === 'experience' 
                  ? 'bg-[#2a2f36] text-white border-b-2 border-blue-500' 
                  : 'text-gray-400 hover:text-white hover:bg-[#1a1d23]'
              }`}
            >
              경력
              <ChevronDown className={`w-4 h-4 transition-transform ${activeFilterTab === 'experience' ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={clearFilters}
              className="px-6 py-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#1a1d23] transition-colors"
            >
              필터 초기화
            </button>
          </div>

          {/* Filter Content Panels */}
          {activeFilterTab && (
            <div className="p-6 bg-[#1a1d23]">
              {activeFilterTab === 'location' && (
                <div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleFilterChange('work_location', 'all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !searchParams.work_location 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      전체 지역
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '서울')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '서울' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      서울
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '경기')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '경기' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      경기
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '인천')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '인천' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      인천
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '부산')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '부산' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      부산
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '대구')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '대구' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      대구
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '광주')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '광주' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      광주
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '대전')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '대전' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      대전
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '울산')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '울산' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      울산
                    </button>
                    <button
                      onClick={() => handleFilterChange('work_location', '세종')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.work_location === '세종' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      세종
                    </button>
                  </div>
                </div>
              )}

              {activeFilterTab === 'employment' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleFilterChange('employment_type', 'all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !searchParams.employment_type 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      전체 고용형태
                    </button>
                    {uniqueEmploymentTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('employment_type', type)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          searchParams.employment_type === type 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeFilterTab === 'experience' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => handleFilterChange('employment_type', 'all')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !searchParams.employment_type 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      경력무관
                    </button>
                    <button
                      onClick={() => handleFilterChange('employment_type', '신입')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.employment_type === '신입' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      신입
                    </button>
                    <button
                      onClick={() => handleFilterChange('employment_type', '경력 1~3년')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.employment_type === '경력 1~3년' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      1~3년
                    </button>
                    <button
                      onClick={() => handleFilterChange('employment_type', '경력 3~5년')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.employment_type === '경력 3~5년' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      3~5년
                    </button>
                    <button
                      onClick={() => handleFilterChange('employment_type', '경력 5~10년')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.employment_type === '경력 5~10년' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      5~10년
                    </button>
                    <button
                      onClick={() => handleFilterChange('employment_type', '경력 10년 이상')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        searchParams.employment_type === '경력 10년 이상' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-[#2a2f36] text-gray-300 hover:bg-[#374151]'
                      }`}
                    >
                      10년 이상
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-blue-500 hover:text-blue-400"
            >
              다시 시도
            </button>
          </div>
        ) : jobPostings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-[#171a1f] rounded-2xl p-8">
              <p className="text-gray-400 text-lg">검색 조건에 맞는 채용공고가 없습니다</p>
              <p className="text-gray-500 text-sm mt-2">다른 조건으로 검색해보세요</p>
            </div>
          </div>
        ) : (
          <>
            {/* Job Postings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobPostings.map((jobPosting) => (
                <JobPostingCard
                  key={jobPosting.company_job_posting_id}
                  jobPosting={jobPosting}
                  companyName={(jobPosting as any).company_name}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>

            {/* Load More Section */}
            {/* 로딩 인디케이터 */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-white text-sm">더 많은 채용공고를 불러오는 중...</span>
                </div>
              </div>
            )}

            {/* 더 이상 데이터가 없을 때 */}
            {!hasNext && jobPostings.length > 0 && (
              <div className="flex justify-center py-8">
                <span className="text-gray-400 text-sm">모든 채용공고를 불러왔습니다.</span>
              </div>
            )}
          </>
        )}
      </main>

      {/* 맨 위로 가기 버튼 */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
          aria-label="맨 위로 가기"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default JobPostingsPage;
