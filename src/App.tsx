import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './landing/home'
import Login from './auth/login'
import Position from './pages/onboarding/position'
import Company from './pages/onboarding/company'
import Dashboard from './pages/dashboard/page'
import QuestionDetail from './pages/questionDetail/page'
import AnswerDetail from './pages/answerDetail/page'
import GenerateQuestion from './pages/generateQuestion/page'
import CompaniesPage from './pages/companies/page'
import ProtectedRoute from './components/ProtectedRoute'
import { OnboardingProvider } from './contexts/OnboardingContext'

function App() {
  return (
    <OnboardingProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/onboarding/position" 
          element={
            <ProtectedRoute>
              <Position />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding/company" 
          element={
            <ProtectedRoute>
              <Company />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/question/:id" 
          element={
            <ProtectedRoute>
              <QuestionDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/answer/:answerId" 
          element={
            <ProtectedRoute>
              <AnswerDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/generate-question" 
          element={
            <ProtectedRoute>
              <GenerateQuestion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/companies" 
          element={
            <ProtectedRoute>
              <CompaniesPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </OnboardingProvider>
  )
}

export default App
