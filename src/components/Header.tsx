import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Settings, LogOut, User } from 'lucide-react';

interface HeaderProps {
  activeTab?: 'dashboard' | 'generate-question' | 'companies';
}

const Header: React.FC<HeaderProps> = ({ activeTab = 'dashboard' }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getTabStyle = (tab: string) => {
    const isActive = activeTab === tab;
    return `font-medium text-sm transition-colors cursor-pointer ${
      isActive 
        ? 'text-[#60A5FA]' 
        : 'text-[#D1D5DB] hover:text-[#60A5FA]'
    }`;
  };

  const handleTabClick = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'generate-question':
        navigate('/generate-question');
        break;
      case 'companies':
        navigate('/companies');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    signOut();
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-[#0F1115] border-b border-[#2A2F36] h-20 flex items-center justify-between px-20">
      {/* Logo Section */}
      <div className="flex items-center space-x-3">
        <span className="text-[#D1D5DB] font-bold text-lg">BUMAVIEW</span>
      </div>

      {/* Navigation Tabs */}
      <div className='flex items-center space-x-12'>
        <button 
          onClick={() => handleTabClick('generate-question')}
          className={getTabStyle('generate-question')}
        >
          질문등록
        </button>
        <button 
          onClick={() => handleTabClick('dashboard')}
          className={getTabStyle('dashboard')}
        >
          대시보드
        </button>
        <button 
          onClick={() => handleTabClick('companies')}
          className={getTabStyle('companies')}
        >
          회사
        </button>
      </div>
      
      {/* User Section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <span className="text-[#D1D5DB] font-medium text-sm">
            {user?.fullName || '사용자'}님              
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="p-1 rounded-md hover:bg-[#374151] transition-colors duration-150"
            >
              <Settings 
                strokeWidth={1} 
                size={20} 
                color='white'
                className={`transition-transform duration-150 ${isDropdownOpen ? 'rotate-90' : ''}`}
              />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1F2937] border border-[#374151] rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <div className="px-4 py-2 text-xs text-[#9CA3AF] border-b border-[#374151]">
                    {user?.emailAddresses[0]?.emailAddress}
                  </div>
                  
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // 프로필 페이지로 이동 (추후 구현)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#D1D5DB] hover:bg-[#374151] transition-colors duration-150 flex items-center space-x-2"
                  >
                    <User size={16} />
                    <span>프로필</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-[#D1D5DB] hover:bg-[#374151] transition-colors duration-150 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

