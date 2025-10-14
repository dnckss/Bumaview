import { useNavigate } from 'react-router-dom'

interface QuestionCardProps {
  id: number
  companyName: string
  position: string
  questionType: string
  question: string
  companyLogo?: string
}

export default function QuestionCard({ 
  id,
  companyName, 
  position, 
  questionType, 
  question,
  companyLogo 
}: QuestionCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/question/${id}`)
  }
  return (
    <div 
      className="bg-[#171A1F] rounded-2xl p-6 h-40 hover:bg-[#1F2329] transition-colors cursor-pointer"
      onClick={handleClick}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        {/* Company Info */}
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-[#1F2937] rounded-md flex items-center justify-center">
            <span className="text-blue-500 font-semibold text-xs">
              {companyLogo || companyName.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-[#D1D5DB] font-semibold text-sm">
              {companyName}
            </div>
            <div className="text-[#9CA3AF] text-xs">
              {position}
            </div>
          </div>
        </div>
        
        {/* Question Type */}
        <div className="bg-[#1E3A8A] rounded-lg px-3 py-1">
          <span className="text-[#60A5FA] font-medium text-xs">
            {questionType}
          </span>
        </div>
      </div>
      
      {/* Question Text */}
      <p className="text-[#D1D5DB] font-medium text-sm leading-5 line-clamp-2">
        {question}
      </p>
    </div>
  )
}
