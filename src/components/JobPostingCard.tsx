import React from 'react';
import { MapPin, Briefcase } from 'lucide-react';
import type { JobPosting } from '../api/jobPostings';

interface JobPostingCardProps {
  jobPosting: JobPosting;
  companyName: string;
  onCardClick?: (jobPosting: JobPosting) => void;
}

const JobPostingCard: React.FC<JobPostingCardProps> = ({ jobPosting, companyName, onCardClick }) => {
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

  return (
    <div 
      className="bg-[#171a1f] rounded-2xl p-6 cursor-pointer hover:bg-[#1a1d23] transition-colors duration-150"
      onClick={() => onCardClick?.(jobPosting)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold mb-3">
            {companyName}
          </h3>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>{jobPosting.employment_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[200px]">{jobPosting.work_location}</span>
            </div>
          </div>
        </div>
        <div className={`text-xs font-medium ${getDeadlineColor(jobPosting.application_deadline)}`}>
          {formatDeadline(jobPosting.application_deadline)}
        </div>
      </div>

      {/* Tech Stacks */}
      {jobPosting.tech_stacks && jobPosting.tech_stacks.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {jobPosting.tech_stacks.slice(0, 6).map((tech) => (
              <span
                key={tech.tech_stack_id}
                className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs font-medium"
              >
                {tech.tech_name}
              </span>
            ))}
            {jobPosting.tech_stacks.length > 6 && (
              <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded-lg text-xs font-medium">
                +{jobPosting.tech_stacks.length - 6}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostingCard;
