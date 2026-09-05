# NexusFlow — Premium CRM & ERP Landing Page

A modern, premium SaaS landing page for a cloud-based CRM & ERP platform serving Business and Education sectors.

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, trusted by, explore cards, stats, testimonials |
| `/features` | Platform features (Why Choose Us) |
| `/business` | Business CRM & ERP modules |
| `/education` | Education CRM & ERP modules |
| `/dashboard` | Interactive dashboard showcase |
| `/industries` | Industry solutions grid |
| `/pricing` | Pricing plans + FAQ |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form & support |

Navigation uses **React Router** with smooth page transitions and scroll-to-top on route change.

## Tech Stack

- **React 19** + **TypeScript**
- **React Router** — multi-page routing
- **Tailwind CSS v4**
- **Framer Motion** — scroll animations, transitions, micro-interactions
- **Lucide React** — icons
- **Recharts** — dashboard charts and analytics

## Features

- Light / dark mode toggle
- Sticky glass navigation with mega menu
- Animated hero with floating dashboard mockup
- Business & Education edition sections
- Interactive dashboard showcase with tab switching
- Animated statistics counters
- Testimonials carousel
- Pricing cards with feature comparison
- FAQ accordion
- Contact form with map placeholder
- Fully responsive design
- SEO-friendly meta tags

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── pages/             # Route-level page components
├── components/
│   ├── dashboard/     # Dashboard mockups & charts
│   ├── layout/        # Navbar, Footer, Layout, PageWrapper
│   ├── sections/      # Reusable section components
│   └── ui/            # Reusable UI components
├── hooks/             # Theme, animated counter
└── lib/               # Utilities & route constants
```
