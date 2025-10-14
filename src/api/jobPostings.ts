import axios from 'axios';

export interface TechStack {
  tech_stack_id: number;
  tech_name: string;
}

export interface JobPosting {
  company_job_posting_id: number;
  company_id: number;
  job_id: string;
  overview: string;
  key_responsibilities: string;
  preferred_qualifications: string;
  benefits_and_perks: string;
  hiring_process: string;
  employment_type: string;
  application_deadline: string;
  work_location: string;
  tech_stacks: TechStack[];
}

export interface JobPostingsResponse {
  values: JobPosting[];
  has_next: boolean;
}

export interface JobPostingsParams {
  cursor_id?: number;
  size?: number;
  company_name?: string;
  employment_type?: string;
  work_location?: string;
}

export const fetchJobPostings = async (params: JobPostingsParams = {}): Promise<JobPosting[]> => {
  try {
    const URL = import.meta.env.VITE_API_URL;

    console.log('Job Postings API URL:', URL);
    console.log('Job Postings API Params:', params);

    const response = await axios.get<JobPostingsResponse>(`${URL}/companies/job-postings`, {
      params: {
        size: 20,
        ...params
      }
    });

    console.log('Job Postings API Response:', response.data);
    console.log('Job Postings Count:', response.data.values?.length || 0);

    return response.data.values || [];
  } catch (error) {
    console.error('채용공고를 불러오는데 실패했습니다:', error);
    throw error;
  }
};
