import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Check } from 'lucide-react';
import { positions } from '../../constants/positions';
import { fetchCompanies, type Company } from '../../api/companies';
import Header from '../../components/Header';
import axios from 'axios';


interface FormData {
  question: string;
  category: string;
  company_id: number;
  company_name: string;
  tag: string;
}

const GenerateQuestionPage: React.FC = () => {
  
  const [formData, setFormData] = useState<FormData>({
    question: '',
    category: '',
    company_id: 0,
    company_name: '',
    tag: '',
  });

  const { getToken } = useAuth()
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [_showRoundDropdown, setShowRoundDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [apiPositions, setApiPositions] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  const questionTypes = ['기술 면접', '인성 면접'];

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCompanyInputChange = (value: string) => {
    setFormData(prev => ({ ...prev, company_name: value }));
    setShowCompanyDropdown(true);
    
    // 회사명으로 필터링
    if (value.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.company_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
    
    // 에러 메시지 초기화
    if (errors.company_name) {
      setErrors(prev => ({ ...prev, company_name: undefined }));
    }
  };

  const handleCompanySelect = (company: Company) => {
    setFormData(prev => ({ 
      ...prev, 
      company_id: company.company_id,
      company_name: company.company_name 
    }));
    setShowCompanyDropdown(false);
  };

  const handleAddNewCompany = () => {
    // 기존 회사들의 가장 큰 ID + 1
    const maxId = companies.length > 0 ? Math.max(...companies.map(c => c.company_id)) : 0;
    const newCompanyId = maxId + 1;
    
    setFormData(prev => ({ 
      ...prev, 
      company_id: newCompanyId,
      company_name: prev.company_name // 사용자가 입력한 회사명 유지
    }));
    setShowCompanyDropdown(false);
  };

  // API에서 회사 데이터 가져오기
  useEffect(() => {
    const fetchCompaniesData = async () => {
      try {
        const companiesData = await fetchCompanies();
        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (error) {
        console.error('회사 데이터 로딩 실패:', error);
      }
    };

    fetchCompaniesData();
  }, []);

  // API에서 포지션 데이터 가져오기
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        setIsLoadingPositions(true);
        const URL = import.meta.env.VITE_API_URL;
        
        if (URL) {
          const response = await axios.get(`${URL}/users/positions`);
          console.log('Positions API Response:', response.data);
          
          // API 응답에서 포지션 데이터 추출
          let positionsData = [];
          
          if (response.data && Array.isArray(response.data.values)) {
            // values 배열에서 position_name 추출
            positionsData = response.data.values
              .map((item: any) => item.position_name)
              .filter((name: string) => name && name.trim() !== ''); // 빈 값 필터링
            
            console.log('추출된 포지션 데이터:', positionsData);
            console.log('포지션 개수:', positionsData.length);
            
            // API에서 유효한 데이터가 없으면 기본 포지션 사용
            if (positionsData.length === 0) {
              console.log('API에서 유효한 포지션이 없어 기본 포지션 사용');
              positionsData = positions;
            }
          } else if (Array.isArray(response.data)) {
            // 응답이 직접 배열인 경우
            positionsData = response.data;
          } else if (response.data && Array.isArray(response.data.positions)) {
            // 응답이 객체이고 positions 속성이 배열인 경우
            positionsData = response.data.positions;
          } else if (response.data && Array.isArray(response.data.data)) {
            // 응답이 객체이고 data 속성이 배열인 경우
            positionsData = response.data.data;
          } else {
            console.warn('예상치 못한 API 응답 구조:', response.data);
            positionsData = positions; // 기본값 사용
          }
          
          setApiPositions(positionsData);
        } else {
          // API URL이 없으면 기본 포지션 사용
          setApiPositions(positions);
        }
      } catch (error) {
        console.error('포지션 데이터 로딩 실패:', error);
        // API 실패 시 기본 포지션 사용
        setApiPositions(positions);
      } finally {
        setIsLoadingPositions(false);
      }
    };

    fetchPositions();
  }, []);

  // 페이지 로드 시 애니메이션 시작
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowMainContent(true);
    }, 300);

    const timer2 = setTimeout(() => {
      setShowRegistration(true);
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 드롭박스 관련 요소가 아닌 경우에만 닫기
      if (!target.closest('.position-dropdown-container') && 
          !target.closest('.round-dropdown-container') && 
          !target.closest('.type-dropdown-container') &&
          !target.closest('.company-dropdown-container')) {
        setShowPositionDropdown(false);
        setShowRoundDropdown(false);
        setShowTypeDropdown(false);
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (formData.question.length < 10) {
      newErrors.question = '최소 10자 이상 작성해주세요';
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = '회사명을 입력해주세요';
    }

    if (formData.company_id === 0) {
      newErrors.company_name = '유효한 회사를 선택하거나 새 회사를 추가해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        const URL = import.meta.env.VITE_API_URL;
        const token = await getToken()
        const submitData = {
          question: formData.question,
          company_id: formData.company_id,
          category: formData.category || '기술 면접',
          tag: formData.tag || ''
        };
        
        console.log('Form submitted:', submitData);
        
        if (URL) {
          const response = await axios.post(`${URL}/questions/single`,
             submitData,
             {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              withCredentials: false
             });
          console.log('API Response:', response.data);
          alert('질문이 성공적으로 등록되었습니다!');
          // 폼 초기화
          setFormData({
            question: '',
            category: '',
            company_id: 0,
            company_name: '',
            tag: '',
          });
        } else {
          alert('질문이 성공적으로 등록되었습니다!');
        }
      } catch (error) {
        console.error('질문 등록 실패:', error);
        alert('질문 등록에 실패했습니다. 다시 시도해주세요.');
      }
    } else {
      alert('입력 정보를 다시 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C]">
      <Header activeTab="generate-question" />

      {/* Main Content */}
      <div className="flex justify-center">
        <div className="w-full max-w-[640px] px-5 py-8">
        {/* Page Header */}
        <div className={`text-center mb-8 transition-all duration-700 ease-out ${
          showMainContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-white text-[28px] font-bold mb-4">
            면접 질문 등록
          </h1>
          <p className="text-gray-400 text-base leading-6">
            실제 면접에서 받았던 질문을 공유해주세요.<br />
            다른 지원자들에게 큰 도움이 됩니다.
          </p>
        </div>

        {/* Guidelines Section */}
        <div className={`bg-[#0f1115] rounded-2xl p-6 mb-8 transition-all duration-700 ease-out ${
          showMainContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center mb-6">
            <h3 className="text-blue-500 text-base font-semibold">
              질문 등록 가이드라인
            </h3>
          </div>
          <div className="space-y-3">
            {[
              '실제 면접에서 받은 질문만 등록해주세요',
              '질문은 구체적이고 명확하게 작성해주세요',
              '개인정보가 포함되지 않도록 주의해주세요',
              '중복된 질문은 자동으로 필터링됩니다'
            ].map((guideline, index) => (
              <div key={index} className="flex items-center">
                <div className="w-4 h-4 mr-3">
                    <Check size={16} color='#3b82f6' />
                </div>
                <span className="text-gray-300 text-sm">{guideline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={`bg-[#171a1f] rounded-2xl p-10 transition-all duration-700 ease-out ${
          showRegistration 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`}>
          <div className="space-y-8">
            {/* Question Field */}
            <div>
              <label className="block text-white text-base font-semibold mb-2">
                면접 질문
              </label>
              <div className="relative">
                <textarea
                  value={formData.question}
                  onChange={(e) => handleInputChange('question', e.target.value)}
                  placeholder="실제 면접에서 받은 질문을 자세히 작성해주세요..."
                  className="w-full h-[120px] bg-[#171a1f] border border-[#2a2f36] rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className={`text-xs mt-2 ${errors.question ? 'text-red-400' : 'text-gray-400'}`}>
                {errors.question || '최소 10자 이상 작성해주세요'}
              </p>
            </div>

            {/* Position Field */}
            <div>
              <label className="block text-white text-base font-semibold mb-2">
                지원 포지션
              </label>
              <div className="relative position-dropdown-container">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('드롭박스 클릭됨, 현재 상태:', showPositionDropdown);
                    setShowPositionDropdown(!showPositionDropdown);
                  }}
                  className="w-full bg-[#171a1f] border border-[#2a2f36] rounded-xl p-4 text-left text-white flex justify-between items-center hover:border-blue-500 transition-colors"
                >
                  <span>{formData.category}</span>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showPositionDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-[#171a1f] border border-[#2a2f36] rounded-xl mt-1 z-10 max-h-48 overflow-y-auto">
                    <div className="p-2 text-xs text-gray-500 border-b border-gray-600">
                      포지션 개수: {apiPositions.length}
                    </div>
                    {isLoadingPositions ? (
                      <div className="p-4 text-center text-gray-400">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        포지션 로딩 중...
                      </div>
                    ) : (
                      Array.isArray(apiPositions) && apiPositions.length > 0 ? (
                        apiPositions.map((position: string) => (
                          <button
                            key={position}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInputChange('category', position);
                              setShowPositionDropdown(false);
                            }}
                            className="w-full p-4 text-left text-white hover:bg-[#2a2f36] first:rounded-t-xl last:rounded-b-xl"
                          >
                            {position}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          사용 가능한 포지션이 없습니다.
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-2">
                지원했던 정확한 포지션을 선택해주세요
              </p>
            </div>

            {/* Company Field */}
            <div>
              <label className="block text-white text-base font-semibold mb-2">
                회사명
              </label>
              <div className="relative company-dropdown-container">
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleCompanyInputChange(e.target.value)}
                  onFocus={() => setShowCompanyDropdown(true)}
                  placeholder="회사명을 검색해주세요"
                  className="w-full bg-[#171a1f] border border-[#2a2f36] rounded-xl p-4 pr-12 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                
                {showCompanyDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-[#171a1f] border border-[#2a2f36] rounded-xl mt-1 z-10 max-h-48 overflow-y-auto">
                    <div className="p-2 text-xs text-gray-500 border-b border-gray-600">
                      회사 {filteredCompanies.length}개
                    </div>
                    {filteredCompanies.length > 0 ? (
                      <>
                        {filteredCompanies.map((company) => (
                          <button
                            key={company.company_id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompanySelect(company);
                            }}
                            className="w-full p-4 text-left text-white hover:bg-[#2a2f36]"
                          >
                            <div className="font-medium">{company.company_name}</div>
                            <div className="text-xs text-gray-400">ID: {company.company_id}</div>
                          </button>
                        ))}
                        {/* 새 회사 추가 옵션 */}
                        {formData.company_name.trim() && !filteredCompanies.some(c => 
                          c.company_name.toLowerCase() === formData.company_name.toLowerCase()
                        ) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddNewCompany();
                            }}
                            className="w-full p-4 text-left text-blue-400 hover:bg-[#2a2f36] border-t border-gray-600"
                          >
                            <div className="font-medium">+ "{formData.company_name}" 회사 추가하기</div>
                            <div className="text-xs text-gray-400">
                              ID: {companies.length > 0 ? Math.max(...companies.map(c => c.company_id)) + 1 : 1}
                            </div>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center">
                        <div className="text-gray-400 mb-2">검색 결과가 없습니다.</div>
                        {formData.company_name.trim() && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddNewCompany();
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                          >
                            + "{formData.company_name}" 회사 추가하기
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className={`text-xs mt-2 ${errors.company_name ? 'text-red-400' : 'text-gray-400'}`}>
                {errors.company_name || '면접을 본 회사명을 검색하여 선택하거나 새 회사를 추가해주세요'}
              </p>
            </div>

            {/* Interview Type Field */}
            <div>
              <label className="block text-white text-base font-semibold mb-2">
                면접 유형
              </label>
              <div className="relative type-dropdown-container">
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full bg-[#171a1f] border border-[#2a2f36] rounded-xl p-4 text-left text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 flex items-center justify-between"
                >
                  <span className={formData.tag ? 'text-white' : 'text-gray-400'}>
                    {formData.tag === 'technology' ? '기술 면접' : 
                     formData.tag === 'tenacity' ? '인성 면접' : 
                     '면접 유형을 선택해주세요'}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 right-0 bg-[#171a1f] border border-[#2a2f36] rounded-xl mt-1 z-10">
                    {questionTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          const value = type === '기술 면접' ? 'technology' : 'tenacity';
                          handleInputChange('tag', value);
                          setShowTypeDropdown(false);
                        }}
                        className="w-full p-4 text-left text-white hover:bg-[#2a2f36] first:rounded-t-xl last:rounded-b-xl"
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-2">
                면접의 유형을 선택해주세요
              </p>
            </div>

            {/* Optional Fields */}
            
          </div>

          {/* Form Actions */}
          <div className="mt-8">
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                질문 등록하기
              </button>
            </div>
            <p className="text-gray-400 text-xs text-center mt-8">
              등록된 질문은 검토 후 24시간 내에 게시됩니다
            </p>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default GenerateQuestionPage;
