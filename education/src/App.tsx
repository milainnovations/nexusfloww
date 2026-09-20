import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ErpDataProvider, useErpData } from './context/ErpDataContext'
import { LoadingScreen } from './components/common/LoadingScreen'

// Landing Site Layout & Pages
import { Layout } from './components/layout/Layout'
import { EducationPage } from './pages/EducationPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { routes } from './lib/routes'

// Bluke Campus Office ERP Layout & Modules
import { ErpLayout } from './components/layout/ErpLayout'
import { LoginPage } from './pages/LoginPage'
import { CampusDeskPage } from './pages/CampusDeskPage'
import { StudentsPage } from './pages/StudentsPage'
import { FacultyPage } from './pages/FacultyPage'
import { CoursesPage } from './pages/CoursesPage'
import { AttendancePage } from './pages/AttendancePage'
import { ExamsGradesPage } from './pages/ExamsGradesPage'
import { TimetablePage } from './pages/TimetablePage'
import { FeesPage } from './pages/FeesPage'
import { HostelPage } from './pages/HostelPage'
import { LibraryPage } from './pages/LibraryPage'
import { ReportsPage } from './pages/ReportsPage'
import { UsersRolesPage } from './pages/UsersRolesPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdministrationPage } from './pages/AdministrationPage'

function ErpRoutesWrapper() {
  const { isLoading } = useErpData()

  if (isLoading) {
    return <LoadingScreen message="Syncing Live Supabase Database..." />
  }

  return <ErpLayout />
}

export function App() {
  return (
    <AuthProvider>
      <ErpDataProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. PUBLIC EDUCATION MARKETING & LANDING PAGE */}
            <Route element={<Layout />}>
              <Route path={routes.home} element={<EducationPage />} />
            </Route>

            {/* 2. CAMPUS OFFICE LOGIN */}
            <Route path="/login" element={<LoginPage />} />

            {/* 3. CAMPUS OFFICE ERP WORKSPACE */}
            <Route path="/app" element={<ErpRoutesWrapper />}>
              <Route index element={<CampusDeskPage />} />
              <Route path="desk" element={<CampusDeskPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="faculty" element={<FacultyPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="exams-grades" element={<ExamsGradesPage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="fees" element={<FeesPage />} />
              <Route path="hostel" element={<HostelPage />} />
              <Route path="library" element={<LibraryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users-roles" element={<UsersRolesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="administration" element={<AdministrationPage />} />
            </Route>

            {/* 4. 404 NOT FOUND */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ErpDataProvider>
    </AuthProvider>
  )
}

export default App
