import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ErpDataProvider } from './context/ErpDataContext'

// Landing Site Layout & Pages
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { FeaturesPage } from './pages/FeaturesPage'
import { BusinessPage } from './pages/BusinessPage'
import { EducationPage } from './pages/EducationPage'
import { DashboardPage } from './pages/DashboardPage'
import { IndustriesPage } from './pages/IndustriesPage'
import { PricingPage } from './pages/PricingPage'
import { FAQPage } from './pages/FAQPage'
import { ContactPage } from './pages/ContactPage'
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

export function App() {
  return (
    <AuthProvider>
      <ErpDataProvider>
        <BrowserRouter>
          <Routes>
            {/* 1. PUBLIC MARKETING & PRODUCT LANDING WEBSITE */}
            <Route element={<Layout />}>
              <Route path={routes.home} element={<HomePage />} />
              <Route path={routes.features} element={<FeaturesPage />} />
              <Route path={routes.business} element={<BusinessPage />} />
              <Route path={routes.education} element={<EducationPage />} />
              <Route path={routes.dashboard} element={<DashboardPage />} />
              <Route path={routes.industries} element={<IndustriesPage />} />
              <Route path={routes.pricing} element={<PricingPage />} />
              <Route path={routes.faq} element={<FAQPage />} />
              <Route path={routes.contact} element={<ContactPage />} />
            </Route>

            {/* 2. BLUKE CAMPUS OFFICE LOGIN (Screenshot 1) */}
            <Route path="/login" element={<LoginPage />} />

            {/* 3. BLUKE CAMPUS OFFICE ERP WORKSPACE (Screenshots 2, 3, 4) */}
            <Route path="/app" element={<ErpLayout />}>
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
