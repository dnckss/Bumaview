import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Clock, Calendar } from 'lucide-react';
import Header from '../../components/Header';
import type { JobPosting } from '../../api/jobPostings';
import { fetchCompanies } from '../../api/companies';
import type { Company } from '../../api/companies';


const JobPostingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [jobPosting, setJobPosting] = useState<JobPosting | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 회사 정보 가져오기
        const companiesData = await fetchCompanies();
        setCompanies(companiesData.values);

        // URL에서 jobPosting 데이터 가져오기 (navigate state에서 전달됨)
        const jobPostingData = location.state?.jobPosting as JobPosting;
        
        if (jobPostingData) {
          setJobPosting(jobPostingData);
        } else {
          // state에서 데이터가 없으면 API로 직접 가져오기 (필요시)
          throw new Error('채용공고 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('데이터를 불러오는데 실패했습니다:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, location.state]);

  const getCompanyName = (companyId: number): string => {
    const company = companies.find(c => c.company_id === companyId);
    return company ? company.company_name : `회사 ID: ${companyId}`;
  };

  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return '마감';
      if (diffDays === 0) return '오늘 마감';
      if (diffDays === 1) return '내일 마감';
      return `${diffDays}일 남음`;
    } catch {
      return deadline;
    }
  };

  const getDeadlineColor = (deadline: string) => {
    try {
      const date = new Date(deadline);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) return 'text-red-400';
      if (diffDays <= 3) return 'text-orange-400';
      return 'text-gray-400';
    } catch {
      return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-white">
        <Header activeTab="job-postings" />
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !jobPosting) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] text-white">
        <Header activeTab="job-postings" />
        <div className="max-w-4xl mx-auto px-10 py-10">
          <div className="text-center py-12">
            <p className="text-red-400 text-lg mb-4">{error || '채용공고를 찾을 수 없습니다.'}</p>
            <button
              onClick={() => navigate('/job-postings')}
              className="text-blue-500 hover:text-blue-400"
            >
              채용공고 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] text-white">
      <Header activeTab="job-postings" />
      
      <div className="max-w-4xl mx-auto px-10 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/job-postings')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          채용공고 목록으로 돌아가기
        </button>

        {/* Header */}
        <div className="bg-[#171a1f] rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-white text-3xl font-bold mb-4">
                {getCompanyName(jobPosting.company_id)}
              </h1>
              <div className="flex items-center gap-6 text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span className="text-lg">{jobPosting.employment_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{jobPosting.work_location}</span>
                </div>
              </div>
            </div>
            <div className={`text-lg font-semibold ${getDeadlineColor(jobPosting.application_deadline)}`}>
              {formatDeadline(jobPosting.application_deadline)}
            </div>
          </div>

          {/* Tech Stacks */}
          {jobPosting.tech_stacks && jobPosting.tech_stacks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-lg font-semibold mb-3">기술 스택</h3>
              <div className="flex flex-wrap gap-3">
                {jobPosting.tech_stacks.map((tech) => (
                  <span
                    key={tech.tech_stack_id}
                    className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {tech.tech_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Job ID */}
          <div className="text-sm text-gray-500">
            Job ID: {jobPosting.job_id}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* 회사 개요 */}
          <div className="bg-[#171a1f] rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">회사 개요</h2>
            <div className="text-gray-300 leading-7 whitespace-pre-line">
              {jobPosting.overview}
            </div>
          </div>

          {/* 주요 업무 */}
          <div className="bg-[#171a1f] rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">주요 업무</h2>
            <div className="text-gray-300 leading-7 whitespace-pre-line">
              {jobPosting.key_responsibilities}
            </div>
          </div>

          {/* 우대 사항 */}
          <div className="bg-[#171a1f] rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">우대 사항</h2>
            <div className="text-gray-300 leading-7 whitespace-pre-line">
              {jobPosting.preferred_qualifications}
            </div>
          </div>

          {/* 복리후생 */}
          <div className="bg-[#171a1f] rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">복리후생</h2>
            <div className="text-gray-300 leading-7 whitespace-pre-line">
              {jobPosting.benefits_and_perks}
            </div>
          </div>

          {/* 채용 절차 */}
          <div className="bg-[#171a1f] rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">채용 절차</h2>
            <div className="text-gray-300 leading-7 whitespace-pre-line">
              {jobPosting.hiring_process}
            </div>
          </div>

          {/* 지원 정보 */}
          <div className="bg-[#171a1f] rounded-2xl p-8">
            <h2 className="text-white text-2xl font-bold mb-6">지원 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-gray-400 text-sm">지원 마감일</div>
                  <div className="text-white font-medium">{jobPosting.application_deadline}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-gray-400 text-sm">고용 형태</div>
                  <div className="text-white font-medium">{jobPosting.employment_type}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-gray-400 text-sm">근무 지역</div>
                  <div className="text-white font-medium">{jobPosting.work_location}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-gray-400 text-sm">마감 상태</div>
                  <div className={`font-medium ${getDeadlineColor(jobPosting.application_deadline)}`}>
                    {formatDeadline(jobPosting.application_deadline)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apply Button */}
      
      </div>
    </div>
  );
};

export default JobPostingDetailPage;
