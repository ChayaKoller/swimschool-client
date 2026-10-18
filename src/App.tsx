import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout'
import { Loading } from './components/States'
import LoginPage from './pages/LoginPage'
import GroupsPage from './pages/GroupsPage'
import GroupDetailsPage from './pages/GroupDetailsPage'
import StudentsPage from './pages/StudentsPage'
import StudentDetailsPage from './pages/StudentDetailsPage'
import ReportsPage from './pages/ReportsPage'
import NewReportPage from './pages/NewReportPage'
import NotFoundPage from './pages/NotFoundPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, loggedOut } = useAuth()
  const location = useLocation()
  if (loading) return <Loading text="מתחבר..." />
  // After an expired session the user returns to the same page; after "logout" to the home page
  if (!user) return <Navigate to="/login" replace state={loggedOut ? null : { from: location.pathname }} />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/groups" replace />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id" element={<GroupDetailsPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/new" element={<NewReportPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
