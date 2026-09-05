export const routes = {
  home: '/',
  features: '/features',
  business: '/business',
  education: '/education',
  dashboard: '/dashboard',
  industries: '/industries',
  pricing: '/pricing',
  faq: '/faq',
  contact: '/contact',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

export const navLinks = [
  { label: 'Features', to: routes.features },
  { label: 'Business', to: routes.business },
  { label: 'Education', to: routes.education },
  { label: 'Dashboard', to: routes.dashboard },
  { label: 'Pricing', to: routes.pricing },
  { label: 'FAQ', to: routes.faq },
  { label: 'Contact', to: routes.contact },
] as const

export const megaMenuItems = {
  product: [
    { label: 'Features', to: routes.features },
    { label: 'Dashboard', to: routes.dashboard },
    { label: 'Pricing', to: routes.pricing },
  ],
  solutions: [
    { label: 'Business CRM & ERP', to: routes.business },
    { label: 'Education CRM & ERP', to: routes.education },
    { label: 'Industry Solutions', to: routes.industries },
  ],
} as const

export const footerLinks = {
  Product: [
    { label: 'Features', to: routes.features },
    { label: 'Dashboard', to: routes.dashboard },
    { label: 'Pricing', to: routes.pricing },
    { label: 'FAQ', to: routes.faq },
  ],
  Solutions: [
    { label: 'Business', to: routes.business },
    { label: 'Education', to: routes.education },
    { label: 'Industries', to: routes.industries },
  ],
  Resources: [
    { label: 'Documentation', to: routes.faq },
    { label: 'Case Studies', to: routes.home },
    { label: 'Help Center', to: routes.contact },
  ],
  Company: [
    { label: 'About Us', to: routes.home },
    { label: 'Careers', to: routes.home },
    { label: 'Contact', to: routes.contact },
  ],
  Support: [
    { label: 'Help Center', to: routes.contact },
    { label: 'FAQ', to: routes.faq },
    { label: 'Status', to: routes.home },
  ],
} as const
