import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import { NotificationProvider, ToastContainer } from './context/NotificationContext'

import LandingPage from './pages/LandingPage'

import ParentLayout from './layouts/ParentLayout'

import ChildLayout from './layouts/ChildLayout'

import PlatformLayout from './layouts/PlatformLayout'

import ParentDashboard from './pages/parent/Dashboard'

import PendingPage from './pages/parent/PendingPage'

import ChildrenPage from './pages/parent/ChildrenPage'

import ChildDetailPage from './pages/parent/ChildDetailPage'

import MissionsPage from './pages/parent/MissionsPage'

import SettingsPage from './pages/parent/SettingsPage'

import ReportsPage from './pages/parent/ReportsPage'

import AgendaPage from './pages/parent/AgendaPage'
import QuizzesPage from './pages/parent/QuizzesPage'
import ChatPage from './pages/parent/ChatPage'

import ChildLoginPage from './pages/child/ChildLoginPage'
import ChildQuizPage from './pages/child/ChildQuizPage'
import ChildChatPage from './pages/child/ChildChatPage'

import ChildHomePage from './pages/child/ChildHomePage'

import ChildMissionsPage from './pages/child/ChildMissionsPage'

import ChildExchangePage from './pages/child/ChildExchangePage'

import ChildProfilePage from './pages/child/ChildProfilePage'

import PlatformLoginPage from './pages/platform/PlatformLoginPage'

import PlatformTenantsPage from './pages/platform/PlatformTenantsPage'

import PlatformAuditPage from './pages/platform/PlatformAuditPage'
import PlatformTemplatesPage from './pages/platform/PlatformTemplatesPage'
import PlatformSettingsPage from './pages/platform/PlatformSettingsPage'



function AuthLoading() {

  return (

    <div className="min-h-screen flex items-center justify-center text-gray-400">

      Memuat sesi...

    </div>

  )

}



function ProtectedRoute({ role, children }: { role: 'parent' | 'child' | 'platform_admin'; children: React.ReactNode }) {

  const { token, role: userRole, isReady } = useAuth()

  if (!isReady) return <AuthLoading />

  if (!token) return <Navigate to="/" replace />

  if (userRole !== role) return <Navigate to="/" replace />

  return <>{children}</>

}



function HomeRoute() {

  const { token, role, isReady } = useAuth()

  if (!isReady) return <AuthLoading />

  if (token && role === 'parent') return <Navigate to="/parent" replace />

  if (token && role === 'child') return <Navigate to="/child" replace />

  if (token && role === 'platform_admin') return <Navigate to="/admin" replace />

  return <LandingPage />

}



export default function App() {

  return (

    <AuthProvider>
      <LoadingProvider>
      <BrowserRouter>

        <NotificationProvider>

          <ToastContainer />

          <Routes>

          <Route path="/" element={<HomeRoute />} />

          <Route path="/admin/login" element={<PlatformLoginPage />} />

          <Route path="/child/login" element={<ChildLoginPage />} />



          <Route path="/admin" element={<ProtectedRoute role="platform_admin"><PlatformLayout /></ProtectedRoute>}>

            <Route index element={<PlatformTenantsPage />} />

            <Route path="audit" element={<PlatformAuditPage />} />
            <Route path="templates" element={<PlatformTemplatesPage />} />
            <Route path="settings" element={<PlatformSettingsPage />} />

          </Route>



          <Route path="/parent" element={<ProtectedRoute role="parent"><ParentLayout /></ProtectedRoute>}>

            <Route index element={<ParentDashboard />} />

            <Route path="pending" element={<PendingPage />} />

            <Route path="children" element={<ChildrenPage />} />

            <Route path="children/:id" element={<ChildDetailPage />} />

            <Route path="missions" element={<MissionsPage />} />

            <Route path="agenda" element={<AgendaPage />} />
            <Route path="quizzes" element={<QuizzesPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="reports" element={<ReportsPage />} />

            <Route path="settings" element={<SettingsPage />} />

          </Route>



          <Route path="/child" element={<ProtectedRoute role="child"><ChildLayout /></ProtectedRoute>}>

            <Route index element={<ChildHomePage />} />

            <Route path="missions" element={<ChildMissionsPage />} />

            <Route path="exchange" element={<ChildExchangePage />} />
            <Route path="quiz" element={<ChildQuizPage />} />
            <Route path="chat" element={<ChildChatPage />} />
            <Route path="profile" element={<ChildProfilePage />} />

          </Route>

        </Routes>

        </NotificationProvider>

      </BrowserRouter>
      </LoadingProvider>
    </AuthProvider>

  )

}


