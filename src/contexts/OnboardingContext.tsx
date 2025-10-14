import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface OnboardingData {
  selectedRoles: string[]
  companyName: string
}

interface OnboardingContextType {
  onboardingData: OnboardingData
  updateSelectedRoles: (roles: string[]) => void
  updateCompanyName: (company: string) => void
  clearOnboardingData: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const STORAGE_KEY = 'bumaview_onboarding_data'

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    selectedRoles: [],
    companyName: ''
  })

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setOnboardingData(parsedData)
      } catch (error) {
        console.error('Failed to parse onboarding data:', error)
      }
    }
  }, [])

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData))
  }, [onboardingData])

  const updateSelectedRoles = (roles: string[]) => {
    setOnboardingData(prev => ({ ...prev, selectedRoles: roles }))
  }

  const updateCompanyName = (company: string) => {
    setOnboardingData(prev => ({ ...prev, companyName: company }))
  }

  const clearOnboardingData = () => {
    setOnboardingData({ selectedRoles: [], companyName: '' })
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <OnboardingContext.Provider value={{
      onboardingData,
      updateSelectedRoles,
      updateCompanyName,
      clearOnboardingData
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
