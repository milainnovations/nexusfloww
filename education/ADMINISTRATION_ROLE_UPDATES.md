# Administration Role — Implementation Updates

## Overview

A new user role **Administration** has been added to the Greenwood School ERP. This role is designed for the school's administration department staff — responsible for financial management (fees, expenses, budget), admissions pipeline, and operational oversight.

---

## New Role Identity

| Field | Value |
|---|---|
| Role Name | `Administration` |
| Demo User | Mrs. Priya Desai |
| Email | `admin.office@demo.com` |
| Designation | Head of Administration & Accounts Department |
| Login Status | Active (1-click quick login available) |

---

## Files Modified

### 1. `src/data/mockData.ts`

**Changes:**
- Updated `UserRole` interface: added `'Administration'` to the `role` union type.
- Added three new TypeScript interfaces:
  - `ExpenseRecord` — school expense ledger entry with category, vendor, amount, approval status, payment mode.
  - `BudgetAllocation` — annual department budget vs spend tracking.
  - `AdmissionRecord` — admissions pipeline entry with status workflow.
- Added three new initial datasets:
  - `INITIAL_EXPENSES` — 8 sample expense records across all categories (salaries, utilities, infrastructure, IT, etc.)
  - `INITIAL_BUDGET_ALLOCATIONS` — 7 budget allocations covering all major departments for FY 2024-25.
  - `INITIAL_ADMISSIONS` — 5 sample admissions applications with varied statuses.
- Added `Administration` user entry (`u-7`) to `INITIAL_USERS`.

**New Expense Categories:**
`Salaries & Staff` | `Infrastructure & Maintenance` | `Utilities & Bills` | `Stationery & Supplies` | `Transport & Fleet` | `Events & Activities` | `Technology & IT` | `Miscellaneous`

---

### 2. `src/context/AuthContext.tsx`

**Changes:**
- Updated `UserProfile['role']` union type to include `'Administration'`.
- Added `Administration` login case in `login()` function:
  - Name: `Mrs. Priya Desai`
  - Avatar: `PD`
  - Designation: `Head of Administration & Accounts Department`

---

### 3. `src/context/ErpDataContext.tsx`

**Changes:**
- Imported new types: `ExpenseRecord`, `BudgetAllocation`, `AdmissionRecord`.
- Imported new initial datasets: `INITIAL_EXPENSES`, `INITIAL_BUDGET_ALLOCATIONS`, `INITIAL_ADMISSIONS`.
- Added to context interface:
  - `expenses: ExpenseRecord[]`
  - `budgetAllocations: BudgetAllocation[]`
  - `admissions: AdmissionRecord[]`
- Added new action handlers:
  - `addExpense()` — creates new expense with auto-generated expense number, defaults to `Pending Approval`.
  - `updateExpenseStatus()` — approves or rejects an expense.
  - `addAdmission()` — registers a new admission application with auto-generated application number.
  - `updateAdmissionStatus()` — moves an application through the pipeline (shortlist → admit/reject).
- Added `localStorage` persistence for expenses (`edu_expenses_v1`) and admissions (`edu_admissions_v1`).
- `resetData()` now also resets expenses and admissions to initial values.

---

### 4. `src/components/analytics/AnalyticsCharts.tsx`

**5 new Administration-specific chart components added:**

| Chart | Type | Purpose |
|---|---|---|
| `ExpenseCategoryBarChart` | Grouped Bar | Actual spend vs allocated budget per category |
| `BudgetUtilisationDonutChart` | Donut/Pie | Annual budget share by department |
| `MonthlyExpenseTrendChart` | Line | Monthly revenue vs expenditure trajectory |
| `AdmissionsStatusDonutChart` | Donut/Pie | Admissions pipeline status distribution |
| `FeeRecoveryTrendAreaChart` | Area | Monthly fee collection vs outstanding dues trend |

All charts use the existing Recharts library, consistent colour palette (`#0e4b38` green theme), and the same card styling as existing charts.

---

### 5. `src/pages/AdministrationPage.tsx` *(New File)*

A full-featured administration dashboard with **4 tabbed sections**:

#### Tab 1: Overview & Analytics
- 4 KPI stat cards: Budget Utilisation %, Fee Revenue Collected, Pending Expense Approvals, Admissions count.
- 6 analytics charts: Expense Category Bar, Budget Utilisation Donut, Monthly Revenue/Expense Line, Fee Recovery Area, Fee Collection Donut, Admissions Status Donut.
- Budget Health Monitor table showing all departments with progress bars and over-budget alerts.

#### Tab 2: Expenses
- Filter bar: status filter (All / Approved / Pending / Rejected) + search by description/vendor.
- Full expense ledger table with: Expense #, Category badge, Description & Vendor, Amount, Date, Payment Mode, Status with icon, Action (Approve/Reject for pending items).
- "Log Expense" modal form with all fields: category, description, vendor, amount, payment mode, date, remarks.

#### Tab 3: Fees
- Summary KPI cards: Total Collected, Outstanding Dues, Students with Dues count.
- Fee Collection Donut + Fee Recovery Area charts.
- Outstanding Dues Register table: all students with pending dues, sorted by amount descending, with guardian contact and quick Send Reminder button.

#### Tab 4: Admissions
- Filter bar: status filter + search by applicant name/ID.
- Admissions Status Donut chart + Pipeline Summary card with download button.
- Full applications table: Application #, Applicant Name & Remarks, Class Applied, Guardian, Date, Status badge, Action buttons (Shortlist → Admit/Reject workflow).
- "New Admission" modal form.

---

### 6. `src/pages/CampusDeskPage.tsx`

**Changes:**
- Added `Briefcase` import from lucide-react.
- Added `overdueCount` to useErpData destructure.
- Imported 4 new Administration charts: `ExpenseCategoryBarChart`, `BudgetUtilisationDonutChart`, `FeeRecoveryTrendAreaChart`, `AdmissionsStatusDonutChart`.
- Added **Administration role dashboard view** (VIEW 2.5) with:
  - Welcome hero banner with "Open Admin Panel" and "Fee Collections" quick buttons.
  - 4 KPI stat cards: Budget Utilisation, Fee Revenue, Outstanding Dues, Enrolled Students.
  - 4 analytics charts (2×2 grid): Expense Category, Budget Utilisation, Fee Collection, Admissions Status.
  - Fee Recovery Area chart (full width).
  - Quick Actions panel with 4 shortcuts.
  - Fee Alerts panel showing top 5 students by outstanding dues.

---

### 7. `src/components/layout/Sidebar.tsx`

**Changes:**
- Added `Briefcase`, `IndianRupee`, `UserPlus` imports.
- Added **Administration role navigation view** (case 4) with 5 sections:
  - **ADMIN DESK**: Administration desk (`/app/desk`)
  - **FINANCE & ACCOUNTS**: Expenses & budget (`/app/administration`), Fee collections & dues (`/app/fees`)
  - **ADMISSIONS**: Admissions pipeline (`/app/administration`)
  - **SCHOOL DIRECTORIES**: Students register, Teachers & staff, Transport & boarding
  - **ANALYTICS**: Financial analytics (`/app/reports`)

---

### 8. `src/pages/LoginPage.tsx`

**Changes:**
- Added Administration quick-login card to the `quickRoles` array:
  - Role: `Administration`
  - Name: `Mrs. Priya Desai`
  - Designation: `Head of Administration & Accounts Department`
  - Email: `admin.office@demo.com`

---

### 9. `src/pages/UsersRolesPage.tsx`

**Changes:**
- Updated `permissionsMatrix` array: added `administration` boolean field to all 12 permission rows.
- Added ADMINISTRATION column to the RBAC table header and all rows.
- Updated permissions matrix with 12 modules (up from 9), including new Administration-specific modules:
  - Expenses Logging, Budget Monitoring & Approval ✅ Administration
  - Admissions Pipeline Management & Status Updates ✅ Administration
  - Financial Analytics & Budget Reports ✅ Administration
  - School Fee Invoicing, Collections & Dues Tracker ✅ Administration

---

### 10. `src/App.tsx`

**Changes:**
- Imported `AdministrationPage` component.
- Added new route: `/app/administration` → `<AdministrationPage />`.

---

### 11. `src/db/schema.sql`

**Changes:**
- Updated `users` table `role` CHECK constraint to include `'Administration'`.
- Added 4 new tables:

#### Table 13: `expenses`
Tracks all school operational expenditures. Fields: `id`, `expense_number`, `category` (CHECK constraint with 8 categories), `description`, `vendor`, `amount`, `approved_by`, `expense_date`, `status` (Approved/Pending Approval/Rejected), `payment_mode` (Bank Transfer/Cash/Cheque/Online Payment), `remarks`, `created_by` (FK → users), `created_at`, `updated_at`.

#### Table 14: `budget_allocations`
Annual budget tracking per department/category. Fields: `id`, `category`, `allocated_amount`, `spent_amount`, `academic_year`, `color_hex`, timestamps. Unique constraint on `(category, academic_year)`.

#### Table 15: `admissions`
Student admission applications pipeline. Fields: `id`, `application_number`, `applicant_name`, `applying_for_class`, `guardian_name`, `guardian_phone`, `application_date`, `status` (Under Review/Shortlisted/Admitted/Rejected/Waitlisted), `interview_date`, `remarks`, `processed_by` (FK → users), timestamps.

#### Table 16: `role_permissions`
Documents module-level RBAC for the Administration role (informational reference). Includes 9 seeded permission rows for the Administration role covering expenses, budget, admissions, invoices, students, faculty, hostel, and reports.

**New Indexes Added:**
- `idx_expenses_status` on `expenses(status)`
- `idx_expenses_category` on `expenses(category)`
- `idx_expenses_date` on `expenses(expense_date)`
- `idx_admissions_status` on `admissions(status)`
- `idx_admissions_class` on `admissions(applying_for_class)`
- `idx_budget_year` on `budget_allocations(academic_year)`

---

## Administration Role RBAC Summary

| Module | Super Admin | Principal | Administration | Teacher | Library Admin | Student/Parent |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Executive Desk & Global Analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Student Admissions & Registration | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Teacher & Staff Appointment | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Expenses Logging & Budget Monitoring | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Fee Invoicing, Collections & Dues | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Admissions Pipeline Management | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Library Catalog & Book Management | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Attendance Marking | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Exam Scheduling & Marks Entry | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Progress Report Card View | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Online Fee Payment | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| Financial Analytics & Budget Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## localStorage Keys Added

| Key | Content |
|---|---|
| `edu_expenses_v1` | Serialised `ExpenseRecord[]` array |
| `edu_admissions_v1` | Serialised `AdmissionRecord[]` array |

---

## Route Added

```
/app/administration  →  AdministrationPage
```

---

## Summary of All Changed Files

| File | Change Type |
|---|---|
| `src/data/mockData.ts` | Modified — new interfaces, datasets, updated UserRole type |
| `src/context/AuthContext.tsx` | Modified — role type + login case |
| `src/context/ErpDataContext.tsx` | Modified — new state, actions, localStorage |
| `src/components/analytics/AnalyticsCharts.tsx` | Modified — 5 new chart components |
| `src/pages/AdministrationPage.tsx` | **New file** — full admin dashboard page |
| `src/pages/CampusDeskPage.tsx` | Modified — Administration desk view added |
| `src/components/layout/Sidebar.tsx` | Modified — Administration nav section added |
| `src/pages/LoginPage.tsx` | Modified — Administration quick login card |
| `src/pages/UsersRolesPage.tsx` | Modified — RBAC matrix column + rows updated |
| `src/App.tsx` | Modified — `/app/administration` route added |
| `src/db/schema.sql` | Modified — users role constraint + 4 new tables + 6 indexes |
