-- ====================================================================
-- GREENWOOD SCHOOL ERP — COMPLETE DATABASE SCHEMA
-- Single-Tenant Architecture (one school per deployment)
-- Compatible with: PostgreSQL 14+ / MySQL 8+ / SQLite 3.35+
-- Last updated: Session 2024-2025
-- ====================================================================

-- ====================================================================
-- 1. INSTITUTION CONFIGURATION
-- Singleton row — one school per database
-- ====================================================================
CREATE TABLE IF NOT EXISTS institution_settings (
    id                  VARCHAR(50)     PRIMARY KEY DEFAULT 'inst_config_01',
    institution_name    VARCHAR(255)    NOT NULL DEFAULT 'Greenwood International School',
    campus_code         VARCHAR(50)     NOT NULL DEFAULT 'GWIS',
    address             TEXT,
    phone               VARCHAR(50),
    email               VARCHAR(255),
    -- Academic calendar
    academic_year       VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    term_structure      VARCHAR(50)     NOT NULL DEFAULT 'Two-Term (Term 1 + Term 2)',
    -- People
    principal_name      VARCHAR(100),
    managing_director   VARCHAR(100),
    -- CBSE / Board affiliation
    affiliation_board   VARCHAR(100)    NOT NULL DEFAULT 'Central Board of Secondary Education (CBSE)',
    affiliation_number  VARCHAR(50),
    -- Academic policies
    attendance_threshold_pct    DECIMAL(5,2)    NOT NULL DEFAULT 75.00,
    grading_system      VARCHAR(100)    NOT NULL DEFAULT '9-Point Grading Scale (A1-A2-B1-B2-C1-C2-D-E)',
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 2. USERS & SYSTEM ROLES (Authentication & RBAC)
-- Roles: Super Admin | Principal | Teacher | Library Admin |
--        Administration | Student | Parent
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    UNIQUE NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL DEFAULT 'pbkdf2:sha256:...',
    role            VARCHAR(50)     NOT NULL CHECK (
                        role IN ('Super Admin', 'Principal', 'Teacher',
                                 'Library Admin', 'Administration', 'Student', 'Parent')
                    ),
    designation     VARCHAR(255),
    status          VARCHAR(20)     NOT NULL DEFAULT 'Active' CHECK (
                        status IN ('Active', 'Invited', 'Suspended')
                    ),
    last_active_at  TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 3. STUDENT DIRECTORY
-- One row per enrolled student
-- ====================================================================
CREATE TABLE IF NOT EXISTS students (
    id                  VARCHAR(50)     PRIMARY KEY,
    -- Link to user account (optional — students may or may not have login)
    user_id             VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    roll_number         VARCHAR(50)     UNIQUE NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    email               VARCHAR(255),
    class_grade         VARCHAR(50)     NOT NULL,   -- e.g. 'Class 8-A'
    section             VARCHAR(10)     NOT NULL DEFAULT 'A',
    academic_year       VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    -- Attendance counters (updated by markAttendanceBulk action)
    attendance_pct      DECIMAL(5,2)    DEFAULT 100.00,
    classes_present     INT             DEFAULT 0,
    total_classes       INT             DEFAULT 0,
    -- Academic standing
    overall_grade       VARCHAR(10)     DEFAULT 'A1',   -- CBSE 9-point grade
    term_percentage     DECIMAL(5,2)    DEFAULT 0.00,
    -- Personal & contact
    phone               VARCHAR(50),
    bus_route           VARCHAR(255),   -- label string e.g. 'Bus Route 04 (North City)'
    guardian_name       VARCHAR(255),
    guardian_relation   VARCHAR(50),    -- 'Father' | 'Mother' | 'Guardian'
    guardian_phone      VARCHAR(50),
    address             TEXT,
    -- Finance
    dues                DECIMAL(10,2)   DEFAULT 0.00,
    -- Registration meta
    admission_date      DATE,
    date_of_birth       DATE,
    blood_group         VARCHAR(10),
    remarks             TEXT,           -- class teacher's remarks
    -- Timestamps
    created_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 4. PARENT–CHILD LINK
-- Connects parent user accounts to student records.
-- Not yet enforced in the front-end (currently hardcoded per demo role)
-- but present here for future multi-child parent support.
-- ====================================================================
CREATE TABLE IF NOT EXISTS parent_student_links (
    id              VARCHAR(50)     PRIMARY KEY,
    parent_user_id  VARCHAR(50)     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    relation        VARCHAR(50)     NOT NULL DEFAULT 'Guardian',
    is_primary      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(parent_user_id, student_roll)
);

-- ====================================================================
-- 5. FACULTY & TEACHING STAFF
-- ====================================================================
CREATE TABLE IF NOT EXISTS faculty (
    id                  VARCHAR(50)     PRIMARY KEY,
    user_id             VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    teacher_code        VARCHAR(50)     UNIQUE NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    email               VARCHAR(255),
    department          VARCHAR(100)    NOT NULL,
    designation         VARCHAR(255)    NOT NULL,
    -- Class teacher assignment (one teacher → one class)
    is_class_teacher_of VARCHAR(50),
    cabin               VARCHAR(100),
    phone               VARCHAR(50),
    qualification       VARCHAR(255),
    experience_years    INT             DEFAULT 0,
    status              VARCHAR(20)     DEFAULT 'Active' CHECK (
                            status IN ('Active', 'On Leave')
                        ),
    created_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 5a. FACULTY ASSIGNED CLASSES  (normalises Faculty.assignedClasses[])
-- Many-to-many: one teacher → many classes; one class → many teachers
-- ====================================================================
CREATE TABLE IF NOT EXISTS faculty_class_assignments (
    id              VARCHAR(50)     PRIMARY KEY,
    faculty_id      VARCHAR(50)     NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    class_grade     VARCHAR(50)     NOT NULL,
    UNIQUE(faculty_id, class_grade)
);

-- ====================================================================
-- 5b. FACULTY SUBJECTS TAUGHT  (normalises Faculty.subjectsTaught[])
-- ====================================================================
CREATE TABLE IF NOT EXISTS faculty_subjects (
    id              VARCHAR(50)     PRIMARY KEY,
    faculty_id      VARCHAR(50)     NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_name    VARCHAR(255)    NOT NULL,
    UNIQUE(faculty_id, subject_name)
);

-- ====================================================================
-- 6. COURSES & ACADEMIC SUBJECTS (curriculum catalogue)
-- ====================================================================
CREATE TABLE IF NOT EXISTS courses (
    id                      VARCHAR(50)     PRIMARY KEY,
    code                    VARCHAR(50)     UNIQUE NOT NULL,    -- e.g. 'MTH-801'
    name                    VARCHAR(255)    NOT NULL,
    class_grade             VARCHAR(50)     NOT NULL,
    department              VARCHAR(100)    NOT NULL,
    periods_per_week        INT             DEFAULT 5,
    type                    VARCHAR(50)     CHECK (
                                type IN ('Core Academic', 'Co-Curricular', 'Laboratory')
                            ),
    faculty_in_charge_id    VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    -- Syllabus progress
    syllabus_chapters_count INT             DEFAULT 15,
    chapters_completed      INT             DEFAULT 0,
    -- Denormalised count (kept in sync by application)
    enrolled_students_count INT             DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 7. CLASS TIMETABLE SLOTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS timetable (
    id              VARCHAR(50)     PRIMARY KEY,
    day_of_week     VARCHAR(20)     NOT NULL CHECK (
                        day_of_week IN ('Monday','Tuesday','Wednesday',
                                        'Thursday','Friday','Saturday')
                    ),
    period_name     VARCHAR(60)     NOT NULL,   -- e.g. 'Period 1 (08:30-09:15)'
    time_slot       VARCHAR(30)     NOT NULL,   -- e.g. '08:30-09:15'
    subject_code    VARCHAR(50)     REFERENCES courses(code) ON DELETE SET NULL,
    subject_name    VARCHAR(255)    NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    room            VARCHAR(100)    NOT NULL,
    teacher_name    VARCHAR(255)    NOT NULL,
    faculty_id      VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    type            VARCHAR(30)     NOT NULL DEFAULT 'Theory' CHECK (
                        type IN ('Theory', 'Lab / Practical', 'Activity')
                    ),
    academic_year   VARCHAR(50)     NOT NULL DEFAULT '2024-2025'
);

-- ====================================================================
-- 8. EXAMINATIONS & ASSESSMENT SCHEDULE
-- ====================================================================
CREATE TABLE IF NOT EXISTS exams (
    id              VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    term            VARCHAR(50)     CHECK (
                        term IN ('Term 1', 'Term 2', 'Unit Assessment')
                    ),
    class_grade     VARCHAR(50)     NOT NULL,
    subject         VARCHAR(255)    NOT NULL,
    exam_date       DATE            NOT NULL,
    max_marks       INT             DEFAULT 100,
    conducted_by    VARCHAR(255),
    faculty_id      VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Scheduled' CHECK (
                        status IN ('Scheduled', 'Conducted', 'Evaluated', 'Published')
                    ),
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 9. STUDENT MARKS LEDGER
-- Replaces the in-document marksMap: Record<studentRoll, {...}>
-- ====================================================================
CREATE TABLE IF NOT EXISTS exam_marks (
    id              VARCHAR(50)     PRIMARY KEY,
    exam_id         VARCHAR(50)     NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    marks_obtained  DECIMAL(5,2)    NOT NULL,
    grade           VARCHAR(20),    -- CBSE grade label e.g. 'A1', 'B2'
    remarks         TEXT,
    entered_by      VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    entered_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_roll)
);

-- ====================================================================
-- 10. ATTENDANCE RECORDS (per-session, per-student)
-- Replaces the "update student counters" model so individual
-- date-stamped records can be queried for subject-wise attendance,
-- absence history, leave reasons, etc.
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id              VARCHAR(50)     PRIMARY KEY,
    record_date     DATE            NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    subject         VARCHAR(255)    NOT NULL,
    period_name     VARCHAR(60)     NOT NULL,
    teacher_name    VARCHAR(255),
    faculty_id      VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    marked_by       VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- Pivot table: one row per student per session
CREATE TABLE IF NOT EXISTS attendance_entries (
    id                      VARCHAR(50)     PRIMARY KEY,
    attendance_record_id    VARCHAR(50)     NOT NULL
                                REFERENCES attendance_records(id) ON DELETE CASCADE,
    student_roll            VARCHAR(50)     NOT NULL
                                REFERENCES students(roll_number) ON DELETE CASCADE,
    status                  VARCHAR(10)     NOT NULL DEFAULT 'Present' CHECK (
                                status IN ('Present', 'Absent', 'Late')
                            ),
    leave_reason            TEXT,           -- optional for Absent entries
    UNIQUE(attendance_record_id, student_roll)
);

-- ====================================================================
-- 11. FEES & INVOICING
-- ====================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id              VARCHAR(50)     PRIMARY KEY,
    invoice_number  VARCHAR(100)    UNIQUE NOT NULL,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    student_name    VARCHAR(255)    NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL,
    due_date        DATE            NOT NULL,
    paid_date       DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Pending' CHECK (
                        status IN ('Pending', 'Paid', 'Overdue')
                    ),
    fee_type        VARCHAR(100)    NOT NULL CHECK (
                        fee_type IN (
                            'Term 1 Tuition Fee',
                            'Term 2 Tuition Fee',
                            'School Bus & Transport',
                            'Annual Activity & Lab',
                            'Uniform & Books Kit'
                        )
                    ),
    academic_year   VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    issued_by       VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 12. TRANSPORT ROUTES & BUS FLEET
-- ====================================================================
CREATE TABLE IF NOT EXISTS transport_routes (
    id              VARCHAR(50)     PRIMARY KEY,
    route_number    VARCHAR(100)    NOT NULL,   -- e.g. 'Route 04 (North City)'
    bus_number      VARCHAR(50)     NOT NULL,   -- e.g. 'KA-01-EB-4210'
    driver_name     VARCHAR(255)    NOT NULL,
    driver_phone    VARCHAR(50),
    attendant_name  VARCHAR(255),
    capacity        INT             NOT NULL DEFAULT 40,
    occupied        INT             NOT NULL DEFAULT 0,
    status          VARCHAR(20)     NOT NULL DEFAULT 'On Time' CHECK (
                        status IN ('On Time', 'Delayed', 'Completed')
                    ),
    academic_year   VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 12a. TRANSPORT ROUTE STOPS
-- Normalises TransportRoute.stops[] — ordered stop list per route
-- ====================================================================
CREATE TABLE IF NOT EXISTS route_stops (
    id              VARCHAR(50)     PRIMARY KEY,
    route_id        VARCHAR(50)     NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,
    stop_name       VARCHAR(255)    NOT NULL,
    stop_order      INT             NOT NULL,   -- 1-based sequence
    UNIQUE(route_id, stop_order)
);

-- ====================================================================
-- 13. HOSTEL ROOMS & ALLOCATIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id              VARCHAR(50)     PRIMARY KEY,
    block           VARCHAR(100)    NOT NULL CHECK (
                        block IN ('Junior Boys Wing', 'Senior Boys Wing', 'Girls Wing')
                    ),
    room_number     VARCHAR(50)     NOT NULL,
    capacity        INT             DEFAULT 4,
    occupied        INT             DEFAULT 0,
    warden          VARCHAR(255),
    status          VARCHAR(20)     DEFAULT 'Available' CHECK (
                        status IN ('Available', 'Full', 'Maintenance')
                    ),
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
    id              VARCHAR(50)     PRIMARY KEY,
    room_id         VARCHAR(50)     NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    student_name    VARCHAR(255)    NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    allocated_at    TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    vacated_at      TIMESTAMP WITH TIME ZONE,
    UNIQUE(room_id, student_roll)
);

-- ====================================================================
-- 14. LIBRARY BOOK CATALOG
-- ====================================================================
CREATE TABLE IF NOT EXISTS library_books (
    id                  VARCHAR(50)     PRIMARY KEY,
    isbn                VARCHAR(50)     UNIQUE NOT NULL,
    title               VARCHAR(255)    NOT NULL,
    author              VARCHAR(255)    NOT NULL,
    category            VARCHAR(100)    NOT NULL CHECK (
                            category IN (
                                'Science & Nature', 'Mathematics',
                                'Literature & Fiction', 'History & Civics',
                                'Encyclopedias'
                            )
                        ),
    total_copies        INT             DEFAULT 1,
    copies_available    INT             DEFAULT 1,
    shelf_location      VARCHAR(100)    NOT NULL,
    created_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 15. LIBRARY BOOK ISSUES & RETURN LEDGER
-- ====================================================================
CREATE TABLE IF NOT EXISTS library_issues (
    id              VARCHAR(50)     PRIMARY KEY,
    book_id         VARCHAR(50)     NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
    book_title      VARCHAR(255)    NOT NULL,   -- denormalised for quick display
    isbn            VARCHAR(50)     NOT NULL,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    student_name    VARCHAR(255)    NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    issue_date      DATE            NOT NULL,
    due_date        DATE            NOT NULL,
    return_date     DATE,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Issued' CHECK (
                        status IN ('Issued', 'Returned', 'Overdue')
                    ),
    fine_amount     DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    remarks         TEXT,
    issued_by       VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 16. EXPENSE LEDGER (Administration role)
-- ====================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id              VARCHAR(50)     PRIMARY KEY,
    expense_number  VARCHAR(100)    UNIQUE NOT NULL,
    category        VARCHAR(100)    NOT NULL CHECK (
                        category IN (
                            'Salaries & Staff',
                            'Infrastructure & Maintenance',
                            'Utilities & Bills',
                            'Stationery & Supplies',
                            'Transport & Fleet',
                            'Events & Activities',
                            'Technology & IT',
                            'Miscellaneous'
                        )
                    ),
    description     TEXT            NOT NULL,
    vendor          VARCHAR(255)    NOT NULL,
    amount          DECIMAL(12,2)   NOT NULL,
    approved_by     VARCHAR(255),
    approved_by_id  VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    expense_date    DATE            NOT NULL,
    status          VARCHAR(30)     NOT NULL DEFAULT 'Pending Approval' CHECK (
                        status IN ('Approved', 'Pending Approval', 'Rejected')
                    ),
    payment_mode    VARCHAR(30)     NOT NULL DEFAULT 'Bank Transfer' CHECK (
                        payment_mode IN ('Bank Transfer', 'Cash', 'Cheque', 'Online Payment')
                    ),
    remarks         TEXT,
    created_by      VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    academic_year   VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 17. ANNUAL BUDGET ALLOCATIONS (Administration role)
-- ====================================================================
CREATE TABLE IF NOT EXISTS budget_allocations (
    id                  VARCHAR(50)     PRIMARY KEY,
    category            VARCHAR(100)    NOT NULL,
    allocated_amount    DECIMAL(12,2)   NOT NULL,
    spent_amount        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    academic_year       VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    color_hex           VARCHAR(10),
    created_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, academic_year)
);

-- ====================================================================
-- 18. ADMISSIONS PIPELINE (Administration role)
-- ====================================================================
CREATE TABLE IF NOT EXISTS admissions (
    id                  VARCHAR(50)     PRIMARY KEY,
    application_number  VARCHAR(100)    UNIQUE NOT NULL,
    applicant_name      VARCHAR(255)    NOT NULL,
    applying_for_class  VARCHAR(50)     NOT NULL,
    guardian_name       VARCHAR(255)    NOT NULL,
    guardian_phone      VARCHAR(50)     NOT NULL,
    guardian_email      VARCHAR(255),
    application_date    DATE            NOT NULL,
    status              VARCHAR(30)     NOT NULL DEFAULT 'Under Review' CHECK (
                            status IN (
                                'Under Review', 'Shortlisted',
                                'Admitted', 'Rejected', 'Waitlisted'
                            )
                        ),
    interview_date      DATE,
    remarks             TEXT,
    processed_by        VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    -- If admitted, points to the resulting student record
    student_id          VARCHAR(50)     REFERENCES students(id) ON DELETE SET NULL,
    academic_year       VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    created_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 19. ROLE-BASED ACCESS CONTROL (RBAC) REFERENCE TABLE
-- Informational — enforcement is in the application layer.
-- Seeded for all roles across all modules.
-- ====================================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    id          SERIAL          PRIMARY KEY,
    role        VARCHAR(50)     NOT NULL,
    module      VARCHAR(100)    NOT NULL,
    can_view    BOOLEAN         NOT NULL DEFAULT FALSE,
    can_create  BOOLEAN         NOT NULL DEFAULT FALSE,
    can_edit    BOOLEAN         NOT NULL DEFAULT FALSE,
    can_delete  BOOLEAN         NOT NULL DEFAULT FALSE,
    UNIQUE(role, module)
);

-- Seed all role-module permissions
INSERT INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
-- Super Admin — full access everywhere
('Super Admin', 'students',             TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'faculty',              TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'courses',              TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'timetable',            TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'exams',                TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'exam_marks',           TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'attendance',           TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'invoices',             TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'transport_routes',     TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'hostel',               TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'library',              TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'expenses',             TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'budget_allocations',   TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'admissions',           TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'users',                TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'settings',             TRUE, TRUE,  TRUE,  TRUE),
('Super Admin', 'reports',              TRUE, FALSE, FALSE, FALSE),
-- Principal
('Principal', 'students',              TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'faculty',               TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'courses',               TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'timetable',             TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'exams',                 TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'exam_marks',            TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'attendance',            TRUE, TRUE,  FALSE, FALSE),
('Principal', 'invoices',              TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'transport_routes',      TRUE, FALSE, FALSE, FALSE),
('Principal', 'hostel',                TRUE, FALSE, TRUE,  FALSE),
('Principal', 'library',               TRUE, FALSE, FALSE, FALSE),
('Principal', 'expenses',              TRUE, FALSE, FALSE, FALSE),
('Principal', 'admissions',            TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'users',                 TRUE, TRUE,  FALSE, FALSE),
('Principal', 'settings',              TRUE, TRUE,  FALSE, FALSE),
('Principal', 'reports',               TRUE, FALSE, FALSE, FALSE),
-- Administration
('Administration', 'students',         TRUE, TRUE,  FALSE, FALSE),
('Administration', 'faculty',          TRUE, FALSE, FALSE, FALSE),
('Administration', 'courses',          TRUE, FALSE, FALSE, FALSE),
('Administration', 'timetable',        TRUE, FALSE, FALSE, FALSE),
('Administration', 'exams',            TRUE, FALSE, FALSE, FALSE),
('Administration', 'exam_marks',       FALSE,FALSE, FALSE, FALSE),
('Administration', 'attendance',       TRUE, FALSE, FALSE, FALSE),
('Administration', 'invoices',         TRUE, TRUE,  TRUE,  FALSE),
('Administration', 'transport_routes', TRUE, FALSE, FALSE, FALSE),
('Administration', 'hostel',           TRUE, TRUE,  FALSE, FALSE),
('Administration', 'library',          TRUE, FALSE, FALSE, FALSE),
('Administration', 'expenses',         TRUE, TRUE,  TRUE,  FALSE),
('Administration', 'budget_allocations',TRUE,FALSE, FALSE, FALSE),
('Administration', 'admissions',       TRUE, TRUE,  TRUE,  FALSE),
('Administration', 'users',            FALSE,FALSE, FALSE, FALSE),
('Administration', 'reports',          TRUE, FALSE, FALSE, FALSE),
-- Teacher
('Teacher', 'students',                TRUE, FALSE, FALSE, FALSE),
('Teacher', 'faculty',                 TRUE, FALSE, FALSE, FALSE),
('Teacher', 'courses',                 TRUE, FALSE, TRUE,  FALSE),
('Teacher', 'timetable',               TRUE, FALSE, FALSE, FALSE),
('Teacher', 'exams',                   TRUE, TRUE,  TRUE,  FALSE),
('Teacher', 'exam_marks',              TRUE, TRUE,  TRUE,  FALSE),
('Teacher', 'attendance',              TRUE, TRUE,  FALSE, FALSE),
('Teacher', 'invoices',                FALSE,FALSE, FALSE, FALSE),
('Teacher', 'library',                 TRUE, FALSE, FALSE, FALSE),
('Teacher', 'hostel',                  FALSE,FALSE, FALSE, FALSE),
-- Library Admin
('Library Admin', 'students',          TRUE, FALSE, FALSE, FALSE),
('Library Admin', 'faculty',           TRUE, FALSE, FALSE, FALSE),
('Library Admin', 'library',           TRUE, TRUE,  TRUE,  TRUE),
('Library Admin', 'courses',           TRUE, FALSE, FALSE, FALSE),
-- Student
('Student', 'students',                TRUE, FALSE, FALSE, FALSE),
('Student', 'exams',                   TRUE, FALSE, FALSE, FALSE),
('Student', 'exam_marks',              TRUE, FALSE, FALSE, FALSE),
('Student', 'attendance',              TRUE, FALSE, FALSE, FALSE),
('Student', 'invoices',                TRUE, FALSE, FALSE, FALSE),
('Student', 'timetable',               TRUE, FALSE, FALSE, FALSE),
('Student', 'courses',                 TRUE, FALSE, FALSE, FALSE),
('Student', 'library',                 TRUE, FALSE, FALSE, FALSE),
('Student', 'transport_routes',        TRUE, FALSE, FALSE, FALSE),
-- Parent (same read access as Student)
('Parent', 'students',                 TRUE, FALSE, FALSE, FALSE),
('Parent', 'exams',                    TRUE, FALSE, FALSE, FALSE),
('Parent', 'exam_marks',               TRUE, FALSE, FALSE, FALSE),
('Parent', 'attendance',               TRUE, FALSE, FALSE, FALSE),
('Parent', 'invoices',                 TRUE, FALSE, FALSE, FALSE),
('Parent', 'timetable',                TRUE, FALSE, FALSE, FALSE),
('Parent', 'courses',                  TRUE, FALSE, FALSE, FALSE),
('Parent', 'library',                  TRUE, FALSE, FALSE, FALSE),
('Parent', 'transport_routes',         TRUE, FALSE, FALSE, FALSE)
ON CONFLICT (role, module) DO NOTHING;

-- ====================================================================
-- 20. AUDIT LOG (system-wide mutation tracking)
-- Records who changed what, when — supports compliance & debugging.
-- ====================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    user_role       VARCHAR(50),
    action          VARCHAR(50)     NOT NULL,   -- 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
    table_name      VARCHAR(100)    NOT NULL,
    record_id       VARCHAR(100),   -- ID of the affected row
    old_values      JSONB,          -- snapshot before change (UPDATE/DELETE)
    new_values      JSONB,          -- snapshot after change (INSERT/UPDATE)
    ip_address      VARCHAR(50),
    created_at      TIMESTAMP WITH TIME ZONE    DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INDEXES — high-performance querying
-- ====================================================================

-- Students
CREATE INDEX IF NOT EXISTS idx_students_class          ON students(class_grade);
CREATE INDEX IF NOT EXISTS idx_students_roll           ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_dues           ON students(dues) WHERE dues > 0;
CREATE INDEX IF NOT EXISTS idx_students_attendance     ON students(attendance_pct);

-- Faculty
CREATE INDEX IF NOT EXISTS idx_faculty_dept            ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_faculty_class_teacher   ON faculty(is_class_teacher_of);

-- Faculty associations
CREATE INDEX IF NOT EXISTS idx_fca_faculty             ON faculty_class_assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_fca_class               ON faculty_class_assignments(class_grade);
CREATE INDEX IF NOT EXISTS idx_fs_faculty              ON faculty_subjects(faculty_id);

-- Timetable
CREATE INDEX IF NOT EXISTS idx_timetable_class_day     ON timetable(class_grade, day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty       ON timetable(faculty_id);

-- Exams & marks
CREATE INDEX IF NOT EXISTS idx_exams_class_term        ON exams(class_grade, term);
CREATE INDEX IF NOT EXISTS idx_exam_marks_exam         ON exam_marks(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_marks_student      ON exam_marks(student_roll);

-- Attendance
CREATE INDEX IF NOT EXISTS idx_att_records_class_date  ON attendance_records(class_grade, record_date);
CREATE INDEX IF NOT EXISTS idx_att_entries_record      ON attendance_entries(attendance_record_id);
CREATE INDEX IF NOT EXISTS idx_att_entries_student     ON attendance_entries(student_roll);
CREATE INDEX IF NOT EXISTS idx_att_entries_status      ON attendance_entries(status) WHERE status = 'Absent';

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_student        ON invoices(student_roll);
CREATE INDEX IF NOT EXISTS idx_invoices_status         ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date       ON invoices(due_date);

-- Parent–child links
CREATE INDEX IF NOT EXISTS idx_psl_parent              ON parent_student_links(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_psl_student             ON parent_student_links(student_roll);

-- Library
CREATE INDEX IF NOT EXISTS idx_lib_books_isbn          ON library_books(isbn);
CREATE INDEX IF NOT EXISTS idx_lib_books_category      ON library_books(category);
CREATE INDEX IF NOT EXISTS idx_lib_issues_student      ON library_issues(student_roll);
CREATE INDEX IF NOT EXISTS idx_lib_issues_status       ON library_issues(status);
CREATE INDEX IF NOT EXISTS idx_lib_issues_due          ON library_issues(due_date) WHERE status = 'Issued';

-- Transport
CREATE INDEX IF NOT EXISTS idx_route_stops_route       ON route_stops(route_id, stop_order);

-- Hostel
CREATE INDEX IF NOT EXISTS idx_hostel_alloc_room       ON hostel_allocations(room_id);
CREATE INDEX IF NOT EXISTS idx_hostel_alloc_student    ON hostel_allocations(student_roll);

-- Administration
CREATE INDEX IF NOT EXISTS idx_expenses_status         ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category       ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date           ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_year           ON expenses(academic_year);
CREATE INDEX IF NOT EXISTS idx_budget_year             ON budget_allocations(academic_year);
CREATE INDEX IF NOT EXISTS idx_admissions_status       ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_class        ON admissions(applying_for_class);
CREATE INDEX IF NOT EXISTS idx_admissions_year         ON admissions(academic_year);

-- Audit log
CREATE INDEX IF NOT EXISTS idx_audit_user              ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_record      ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created           ON audit_log(created_at);
