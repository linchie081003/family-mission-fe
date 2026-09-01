import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import { NotificationProvider, ToastContainer } from './context/NotificationContext'

import LandingPage from './pages/LandingPage'

import ParentLayout from './layouts/ParentLayout'

import ChildLayout from './layouts/ChildLayout'

import PlatformLayout from './layouts/PlatformLayout'

import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

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

import PlatformDashboardPage from './pages/platform/PlatformDashboardPage'
import PlatformActivationsPage from './pages/platform/PlatformActivationsPage'
import PlatformTenantsPage from './pages/platform/PlatformTenantsPage'
import PlatformReferralsPage from './pages/platform/PlatformReferralsPage'
import PlatformBroadcastPage from './pages/platform/PlatformBroadcastPage'
import PlatformAuditPage from './pages/platform/PlatformAuditPage'
import PlatformTemplatesPage from './pages/platform/PlatformTemplatesPage'
import PlatformSettingsPage from './pages/platform/PlatformSettingsPage'
import PlatformPaymentSettingsPage from './pages/platform/billing/PlatformPaymentSettingsPage'
import UpgradePage from './pages/parent/UpgradePage'
import PlatformBillingLayout from './pages/platform/billing/PlatformBillingLayout'
import PlatformPlansPage from './pages/platform/billing/PlatformPlansPage'
import PlatformPaymentsPage from './pages/platform/billing/PlatformPaymentsPage'
import PlatformPaymentVerificationPage from './pages/platform/billing/PlatformPaymentVerificationPage'
import PlatformTrialsPage from './pages/platform/billing/PlatformTrialsPage'



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
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

          <Route path="/admin/login" element={<PlatformLoginPage />} />

          <Route path="/child/login" element={<ChildLoginPage />} />



          <Route path="/admin" element={<ProtectedRoute role="platform_admin"><PlatformLayout /></ProtectedRoute>}>

            <Route index element={<PlatformDashboardPage />} />
            <Route path="activations" element={<PlatformActivationsPage />} />
            <Route path="tenants" element={<PlatformTenantsPage />} />
            <Route path="referrals" element={<PlatformReferralsPage />} />
            <Route path="broadcast" element={<PlatformBroadcastPage />} />
            <Route path="billing" element={<PlatformBillingLayout />}>
              <Route path="verification" element={<PlatformPaymentVerificationPage />} />
              <Route path="plans" element={<PlatformPlansPage />} />
              <Route path="payments" element={<PlatformPaymentsPage />} />
              <Route path="trials" element={<PlatformTrialsPage />} />
              <Route path="payment-settings" element={<PlatformPaymentSettingsPage />} />
            </Route>
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
            <Route path="upgrade" element={<UpgradePage />} />

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


