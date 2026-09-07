export const routes = {
  home: '/',
  features: '/#features',
  modules: '/#modules',
  pricing: '/#pricing',
  faq: '/#faq',
  contact: '/contact',
  login: '/login',
  app: '/app',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

export const navLinks = [
  { label: 'Features', to: '/#features' },
  { label: 'ERP Modules', to: '/#modules' },
  { label: 'Pricing', to: '/#pricing' },
  { label: 'FAQ', to: '/#faq' },
  { label: 'Contact', to: '/contact' },
] as const

export const megaMenuItems = {
  product: [
    { label: 'Student Registry', to: '/app/students' },
    { label: 'Attendance Watch', to: '/app/attendance' },
    { label: 'Exams & Grade Cards', to: '/app/exams-grades' },
  ],
  solutions: [
    { label: 'School Desk', to: '/app/desk' },
    { label: 'Fee Collection & Billing', to: '/app/fees' },
    { label: 'Hostel & Transport', to: '/app/hostel' },
  ],
} as const

export const footerLinks = {
  Product: [
    { label: 'Student Registry', to: '/app/students' },
    { label: 'Attendance Tracker', to: '/app/attendance' },
    { label: 'Exam Reports', to: '/app/exams-grades' },
    { label: 'Fee Invoicing', to: '/app/fees' },
  ],
  Modules: [
    { label: 'Faculty Directory', to: '/app/faculty' },
    { label: 'Weekly Timetable', to: '/app/timetable' },
    { label: 'Hostel Rooms', to: '/app/hostel' },
    { label: 'Library Catalog', to: '/app/library' },
  ],
  Governance: [
    { label: 'Managerial Reports', to: '/app/reports' },
    { label: 'Staff Roles & RBAC', to: '/app/users-roles' },
    { label: 'School Settings', to: '/app/settings' },
  ],
  Support: [
    { label: 'Staff Portal', to: '/login' },
    { label: 'Help Center', to: '/contact' },
    { label: 'System Status', to: '/app/desk' },
  ],
} as const
