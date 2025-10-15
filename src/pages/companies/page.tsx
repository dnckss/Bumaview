import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import { fetchCompanies, type Company } from '../../api/companies';
import { ArrowUp } from 'lucide-react';

const CompaniesPage: React.FC = () => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(false);
    const [cursorId, setCursorId] = useState<number | undefined>(undefined);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const loadCompanies = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            
            console.log('Loading companies...', { cursorId, isInitial });
            const response = await fetchCompanies({ 
                cursor_id: cursorId, 
                size: 20 
            });
            
            console.log('Loaded companies:', response);
            
            if (isInitial) {
                setCompanies(response.values);
                setFilteredCompanies(response.values);
            } else {
                // 중복 제거를 위해 기존 회사 ID들과 비교
                setCompanies(prev => {
                    const existingIds = new Set(prev.map(company => company.company_id));
                    const newCompanies = response.values.filter(company => !existingIds.has(company.company_id));
                    return [...prev, ...newCompanies];
                });
                setFilteredCompanies(prev => {
                    const existingIds = new Set(prev.map(company => company.company_id));
                    const newCompanies = response.values.filter(company => !existingIds.has(company.company_id));
                    return [...prev, ...newCompanies];
                });
            }
            
            setHasNext(response.has_next);
            setCursorId(response.values[response.values.length - 1]?.company_id);
            
        } catch (err) {
            console.error('Error in loadCompanies:', err);
            setError('회사 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [cursorId]);

    useEffect(() => {
        loadCompanies(true);
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredCompanies(companies);
        } else {
            const filtered = companies.filter(company =>
                company.company_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCompanies(filtered);
        }
    }, [searchTerm, companies]);

    const handleScroll = useCallback(() => {
        const scrollTop = document.documentElement.scrollTop;
        
        // 스크롤 위치에 따라 맨 위로 가기 버튼 표시/숨김
        setShowScrollTop(scrollTop > 300);
        
        // 무한 스크롤 처리
        if (window.innerHeight + scrollTop >= document.documentElement.offsetHeight - 1000) {
            if (hasNext && !loadingMore && !loading && !searchTerm.trim()) {
                console.log('Loading more companies...');
                loadCompanies(false);
            }
        }
    }, [hasNext, loadingMore, loading, loadCompanies, searchTerm]);

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1115]">
                <Header activeTab="companies" />
                <div className="flex items-center justify-center h-96">
                    <div className="text-[#D1D5DB] text-lg">회사 목록을 불러오는 중...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0F1115]">
                <Header activeTab="companies" />
                <div className="flex items-center justify-center h-96">
                    <div className="text-red-400 text-lg">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0F1115]">
            <Header activeTab="companies" />

            <div className="px-8 py-8 max-w-7xl mx-auto">
                {/* 페이지 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold text-[#F9FAFB] mb-1">
                                회사 목록
                            </h1>
                            
                        </div>
                    
                    </div>
                </div>

                {/* 검색 및 필터 */}
                <div className="mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="회사 검색"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 bg-[#1F2937] border border-[#374151] rounded-md text-[#F9FAFB] placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#60A5FA] focus:border-[#60A5FA] text-sm"
                            />
                        </div>
                        <div className="text-xs text-[#6B7280]">
                            {searchTerm ? `${filteredCompanies.length}개의 결과` : '모든 회사'}
                        </div>
                    </div>
                </div>

                {/* 회사 목록 */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-lg overflow-hidden">
                    {/* 테이블 헤더 */}
                    <div className="bg-[#111827] border-b border-[#374151] px-6 py-3">
                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">
                            <div className="col-span-1">ID</div>
                            <div className="col-span-8">회사이름</div>
                           
                        </div>
                    </div>

                    {/* 테이블 바디 */}
                    <div className="divide-y divide-[#374151]">
                        {filteredCompanies.map((company, _index) => (
                            <div
                                key={company.company_id}
                                className="px-6 py-4 hover:bg-[#111827] transition-colors duration-150 group"
                            >
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    {/* ID */}
                                    <div className="col-span-1">
                                        <div className="text-sm font-mono text-[#6B7280]">
                                            {company.company_id.toString().padStart(3, '0')}
                                        </div>
                                    </div>

                                    {/* Company Name */}
                                    <div className="col-span-8">
                                        <div className="text-[#F9FAFB] font-medium group-hover:text-[#60A5FA] transition-colors duration-150">
                                            {company.company_name}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    

                                    {/* Actions */}
                                   
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 로딩 인디케이터 */}
                    {loadingMore && !searchTerm.trim() && (
                        <div className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-[#D1D5DB] text-sm">더 많은 회사를 불러오는 중...</span>
                            </div>
                        </div>
                    )}

                    {/* 더 이상 데이터가 없을 때 */}
                    {!hasNext && filteredCompanies.length > 0 && !searchTerm.trim() && (
                        <div className="px-6 py-8 text-center">
                            <span className="text-[#6B7280] text-sm">모든 회사를 불러왔습니다.</span>
                        </div>
                    )}
                </div>

                {/* 검색 결과가 없을 때 */}
                {filteredCompanies.length === 0 && searchTerm && (
                    <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-12 text-center">
                        <div className="text-[#6B7280] text-sm font-medium mb-2">
                            검색 결과 없음
                        </div>
                        <div className="text-[#9CA3AF] text-sm mb-4">
                            다음의 이름으로 검색되 회사가 없음 : "<span className="text-[#F9FAFB]">{searchTerm}</span>"
                        </div>
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="text-[#60A5FA] hover:text-[#3B82F6] text-sm font-medium transition-colors duration-150"
                        >
                            검색 초기화
                        </button>
                    </div>
                )}

                {/* 회사가 없을 때 */}
                {companies.length === 0 && !loading && (
                    <div className="bg-[#1F2937] border border-[#374151] rounded-lg p-12 text-center">
                        <div className="text-[#6B7280] text-sm font-medium mb-2">
                            회사 없음
                        </div>
                        <div className="text-[#9CA3AF] text-sm">
                            현재 시스템에 회사가 없습니다
                        </div>
                    </div>
                )}
            </div>

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

export default CompaniesPage;
