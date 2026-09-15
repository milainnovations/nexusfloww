-- ====================================================================
-- NEXUSFLOW / GREENWOOD SCHOOL ERP — COMPLETE PRODUCTION DATABASE SETUP
-- Single-Tenant Enterprise School Management & RBAC Security System
-- Compatible with: PostgreSQL 13+ / Supabase / Neon / Render / AWS RDS
-- Version: 1.0.0 (Session 2024-2025)
-- ====================================================================

-- --------------------------------------------------------------------
-- 0. EXTENSIONS & PREREQUISITES
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for fresh provision (comment out in production upgrades)
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- ====================================================================
-- 1. INSTITUTION CONFIGURATION (Singleton)
-- ====================================================================
CREATE TABLE IF NOT EXISTS institution_settings (
    id                          VARCHAR(50)     PRIMARY KEY DEFAULT 'inst_config_01',
    institution_name            VARCHAR(255)    NOT NULL DEFAULT 'Greenwood International School',
    campus_code                 VARCHAR(50)     NOT NULL DEFAULT 'GWIS',
    address                     TEXT            DEFAULT 'Greenwood Campus, Outer Ring Road, Bengaluru',
    phone                       VARCHAR(50)     DEFAULT '+91 80 2843 9000',
    email                       VARCHAR(255)    DEFAULT 'office@greenwood.edu.in',
    academic_year               VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    term_structure              VARCHAR(50)     NOT NULL DEFAULT 'Two-Term (Term 1 + Term 2)',
    principal_name              VARCHAR(100)    DEFAULT 'Dr. Anita Sharma',
    managing_director           VARCHAR(100)    DEFAULT 'Dr. Rajesh Kumar',
    affiliation_board           VARCHAR(100)    NOT NULL DEFAULT 'Central Board of Secondary Education (CBSE)',
    affiliation_number          VARCHAR(50)     DEFAULT 'CBSE/AFF/2024/9842',
    attendance_threshold_pct    DECIMAL(5,2)    NOT NULL DEFAULT 75.00,
    grading_system              VARCHAR(100)    NOT NULL DEFAULT '9-Point Grading Scale (A1-A2-B1-B2-C1-C2-D-E)',
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 2. USERS & RBAC AUTHENTICATION
-- Roles: Super Admin | Principal | Teacher | Library Admin |
--        Administration | Student | Parent
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    email           VARCHAR(255)    UNIQUE NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL DEFAULT '$2a$12$e8j.K89bY2wT7d.O5o1e8O7p2zP3w4e5r6t7y8u9i0o1p2a3s4d5f',
    role            VARCHAR(50)     NOT NULL CHECK (
                        role IN ('Super Admin', 'Principal', 'Teacher',
                                 'Library Admin', 'Administration', 'Student', 'Parent')
                    ),
    designation     VARCHAR(255),
    assigned_class  VARCHAR(50),    -- For Teachers and Students (e.g. 'Class 8-A')
    roll_number     VARCHAR(50),    -- For Students and Parents (e.g. 'SCH-8A-01')
    avatar_text     VARCHAR(10)     DEFAULT 'US',
    status          VARCHAR(20)     NOT NULL DEFAULT 'Active' CHECK (
                        status IN ('Active', 'Invited', 'Suspended')
                    ),
    last_active     VARCHAR(50)     DEFAULT 'Just now',
    last_active_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 3. STUDENTS DIRECTORY
-- ====================================================================
CREATE TABLE IF NOT EXISTS students (
    id                  VARCHAR(50)     PRIMARY KEY,
    user_id             VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    roll_number         VARCHAR(50)     UNIQUE NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    email               VARCHAR(255),
    gender              VARCHAR(20)     DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
    class_grade         VARCHAR(50)     NOT NULL,   -- e.g. 'Class 8-A'
    section             VARCHAR(10)     NOT NULL DEFAULT 'A',
    academic_year       VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    attendance_pct      DECIMAL(5,2)    DEFAULT 100.00,
    classes_present     INT             DEFAULT 0,
    total_classes       INT             DEFAULT 66,
    overall_grade       VARCHAR(10)     DEFAULT 'A1',
    term_percentage     DECIMAL(5,2)    DEFAULT 0.00,
    phone               VARCHAR(50),
    bus_route           VARCHAR(255),
    guardian_name       VARCHAR(255),
    guardian_relation   VARCHAR(50)     DEFAULT 'Father',
    guardian_phone      VARCHAR(50),
    address             TEXT,
    dues                DECIMAL(10,2)   DEFAULT 0.00,
    admission_date      DATE,
    date_of_birth       DATE,
    blood_group         VARCHAR(10),
    remarks             TEXT,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 4. PARENT–STUDENT RELATIONSHIPS
-- ====================================================================
CREATE TABLE IF NOT EXISTS parent_student_links (
    id              VARCHAR(50)     PRIMARY KEY,
    parent_user_id  VARCHAR(50)     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    relation        VARCHAR(50)     NOT NULL DEFAULT 'Father',
    is_primary      BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
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
    assigned_classes    TEXT[]          NOT NULL DEFAULT '{}',
    subjects_taught     TEXT[]          NOT NULL DEFAULT '{}',
    is_class_teacher_of VARCHAR(50),
    cabin               VARCHAR(100),
    phone               VARCHAR(50),
    qualification       VARCHAR(255),
    experience_years    INT             DEFAULT 0,
    status              VARCHAR(20)     DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave')),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Normalized link tables for cross-DB compatibility
CREATE TABLE IF NOT EXISTS faculty_class_assignments (
    id              VARCHAR(50)     PRIMARY KEY,
    faculty_id      VARCHAR(50)     NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    class_grade     VARCHAR(50)     NOT NULL,
    UNIQUE(faculty_id, class_grade)
);

CREATE TABLE IF NOT EXISTS faculty_subjects (
    id              VARCHAR(50)     PRIMARY KEY,
    faculty_id      VARCHAR(50)     NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
    subject_name    VARCHAR(255)    NOT NULL,
    UNIQUE(faculty_id, subject_name)
);

-- ====================================================================
-- 6. COURSES & ACADEMIC CURRICULUM
-- ====================================================================
CREATE TABLE IF NOT EXISTS courses (
    id                      VARCHAR(50)     PRIMARY KEY,
    code                    VARCHAR(50)     UNIQUE NOT NULL,
    name                    VARCHAR(255)    NOT NULL,
    class_grade             VARCHAR(50)     NOT NULL,
    department              VARCHAR(100)    NOT NULL,
    periods_per_week        INT             DEFAULT 5,
    type                    VARCHAR(50)     CHECK (type IN ('Core Academic', 'Co-Curricular', 'Laboratory')),
    faculty_in_charge       VARCHAR(255),
    faculty_id              VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    enrolled_students_count INT             DEFAULT 0,
    syllabus_chapters_count INT             DEFAULT 15,
    chapters_completed      INT             DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 7. CLASS TIMETABLE SLOTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS timetable (
    id              VARCHAR(50)     PRIMARY KEY,
    day_of_week     VARCHAR(20)     NOT NULL CHECK (
                        day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')
                    ),
    period          VARCHAR(60)     NOT NULL,   -- e.g. 'Period 1 (08:30–09:15)'
    time            VARCHAR(30)     NOT NULL,   -- e.g. '08:30–09:15'
    subject_code    VARCHAR(50)     REFERENCES courses(code) ON DELETE SET NULL,
    subject_name    VARCHAR(255)    NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    room            VARCHAR(100)    NOT NULL,
    teacher         VARCHAR(255)    NOT NULL,
    faculty_id      VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    type            VARCHAR(30)     NOT NULL DEFAULT 'Theory' CHECK (
                        type IN ('Theory', 'Lab / Practical', 'Activity')
                    ),
    academic_year   VARCHAR(50)     NOT NULL DEFAULT '2024-2025'
);

-- ====================================================================
-- 8. EXAMINATIONS & STUDENT MARKS
-- ====================================================================
CREATE TABLE IF NOT EXISTS exams (
    id              VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    term            VARCHAR(50)     CHECK (term IN ('Term 1', 'Term 2', 'Unit Assessment')),
    class_grade     VARCHAR(50)     NOT NULL,
    subject         VARCHAR(255)    NOT NULL,
    exam_date       DATE            NOT NULL,
    max_marks       INT             DEFAULT 100,
    conducted_by    VARCHAR(255),
    faculty_id      VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'Scheduled' CHECK (
                        status IN ('Scheduled', 'Conducted', 'Evaluated', 'Published')
                    ),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exam_marks (
    id              VARCHAR(50)     PRIMARY KEY,
    exam_id         VARCHAR(50)     NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    marks_obtained  DECIMAL(5,2)    NOT NULL,
    grade           VARCHAR(20),
    remarks         TEXT,
    entered_by      VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, student_roll)
);

-- ====================================================================
-- 9. ATTENDANCE SESSIONS & STUDENT LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id              VARCHAR(50)     PRIMARY KEY,
    record_date     DATE            NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    subject         VARCHAR(255)    NOT NULL,
    period_name     VARCHAR(60),
    teacher_name    VARCHAR(255),
    faculty_id      VARCHAR(50)     REFERENCES faculty(id) ON DELETE SET NULL,
    marked_by       VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_entries (
    id                      VARCHAR(50)     PRIMARY KEY,
    attendance_record_id    VARCHAR(50)     NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
    student_roll            VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    status                  VARCHAR(10)     NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late')),
    leave_reason            TEXT,
    UNIQUE(attendance_record_id, student_roll)
);

-- ====================================================================
-- 10. FEES & INVOICING
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
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 11. TRANSPORT FLEET & BUS ROUTES
-- ====================================================================
CREATE TABLE IF NOT EXISTS transport_routes (
    id              VARCHAR(50)     PRIMARY KEY,
    route_number    VARCHAR(100)    NOT NULL,
    bus_number      VARCHAR(50)     NOT NULL,
    driver_name     VARCHAR(255)    NOT NULL,
    driver_phone    VARCHAR(50),
    attendant_name  VARCHAR(255),
    capacity        INT             NOT NULL DEFAULT 40,
    occupied        INT             NOT NULL DEFAULT 0,
    stops           TEXT[]          NOT NULL DEFAULT '{}',
    status          VARCHAR(20)     NOT NULL DEFAULT 'On Time' CHECK (
                        status IN ('On Time', 'Delayed', 'Completed')
                    ),
    academic_year   VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_stops (
    id              VARCHAR(50)     PRIMARY KEY,
    route_id        VARCHAR(50)     NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,
    stop_name       VARCHAR(255)    NOT NULL,
    stop_order      INT             NOT NULL,
    UNIQUE(route_id, stop_order)
);

-- ====================================================================
-- 12. HOSTEL & BOARDING
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
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
    id              VARCHAR(50)     PRIMARY KEY,
    room_id         VARCHAR(50)     NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    student_roll    VARCHAR(50)     NOT NULL REFERENCES students(roll_number) ON DELETE CASCADE,
    student_name    VARCHAR(255)    NOT NULL,
    class_grade     VARCHAR(50)     NOT NULL,
    allocated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    vacated_at      TIMESTAMP WITH TIME ZONE,
    UNIQUE(room_id, student_roll)
);

-- ====================================================================
-- 13. LIBRARY CATALOG & CIRCULATION
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
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_issues (
    id              VARCHAR(50)     PRIMARY KEY,
    book_id         VARCHAR(50)     NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
    book_title      VARCHAR(255)    NOT NULL,
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
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 14. EXPENSES & FINANCIAL LEDGER
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
    academic_year   VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 15. ANNUAL BUDGET ALLOCATIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS budget_allocations (
    id                  VARCHAR(50)     PRIMARY KEY,
    category            VARCHAR(100)    NOT NULL,
    allocated_amount    DECIMAL(12,2)   NOT NULL,
    spent_amount        DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    academic_year       VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    color_hex           VARCHAR(10)     DEFAULT '#0e4b38',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, academic_year)
);

-- ====================================================================
-- 16. ADMISSIONS & ENROLLMENT FUNNEL
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
                            status IN ('Under Review', 'Shortlisted', 'Admitted', 'Rejected', 'Waitlisted')
                        ),
    interview_date      DATE,
    remarks             TEXT,
    student_id          VARCHAR(50)     REFERENCES students(id) ON DELETE SET NULL,
    academic_year       VARCHAR(50)     NOT NULL DEFAULT '2024-2025',
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 17. AI CHATBOT SESSIONS & SECURITY FIREWALL AUDIT
-- ====================================================================
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id                  VARCHAR(50)     PRIMARY KEY,
    user_id             VARCHAR(50)     REFERENCES users(id) ON DELETE CASCADE,
    role                VARCHAR(50)     NOT NULL,
    session_started_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_messages (
    id                      VARCHAR(50)     PRIMARY KEY,
    conversation_id         VARCHAR(50)     NOT NULL REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    sender                  VARCHAR(20)     NOT NULL CHECK (sender IN ('user', 'assistant')),
    content                 TEXT            NOT NULL,
    is_security_violation   BOOLEAN         NOT NULL DEFAULT FALSE,
    violation_reason        TEXT,
    data_highlights         JSONB,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chatbot_security_audit (
    id                  BIGSERIAL       PRIMARY KEY,
    user_id             VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    role                VARCHAR(50)     NOT NULL,
    user_name           VARCHAR(255)    NOT NULL,
    query_text          TEXT            NOT NULL,
    blocked_target      VARCHAR(255),
    violation_reason    TEXT            NOT NULL,
    ip_address          VARCHAR(50),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 18. ROLE PERMISSIONS MATRIX & SYSTEM AUDIT LOG
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

CREATE TABLE IF NOT EXISTS audit_log (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         VARCHAR(50)     REFERENCES users(id) ON DELETE SET NULL,
    user_role       VARCHAR(50),
    action          VARCHAR(50)     NOT NULL,
    table_name      VARCHAR(100)    NOT NULL,
    record_id       VARCHAR(100),
    old_values      JSONB,
    new_values      JSONB,
    ip_address      VARCHAR(50),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_roll            ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_class           ON students(class_grade);
CREATE INDEX IF NOT EXISTS idx_students_attendance      ON students(attendance_pct);
CREATE INDEX IF NOT EXISTS idx_students_dues            ON students(dues) WHERE dues > 0;
CREATE INDEX IF NOT EXISTS idx_faculty_dept             ON faculty(department);
CREATE INDEX IF NOT EXISTS idx_faculty_class_teacher    ON faculty(is_class_teacher_of);
CREATE INDEX IF NOT EXISTS idx_timetable_class_day      ON timetable(class_grade, day_of_week);
CREATE INDEX IF NOT EXISTS idx_timetable_faculty        ON timetable(faculty_id);
CREATE INDEX IF NOT EXISTS idx_exams_class_term         ON exams(class_grade, term);
CREATE INDEX IF NOT EXISTS idx_exam_marks_exam_roll     ON exam_marks(exam_id, student_roll);
CREATE INDEX IF NOT EXISTS idx_invoices_student_status  ON invoices(student_roll, status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date        ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_lib_issues_student_stat  ON library_issues(student_roll, status);
CREATE INDEX IF NOT EXISTS idx_expenses_status_year     ON expenses(status, academic_year);
CREATE INDEX IF NOT EXISTS idx_admissions_status_class  ON admissions(status, applying_for_class);
CREATE INDEX IF NOT EXISTS idx_chat_audit_user          ON chatbot_security_audit(user_id, created_at);

-- ====================================================================
-- SEED DATASET (Production Demo Population)
-- ====================================================================

-- 1. Institution Settings
INSERT INTO institution_settings (
    id, institution_name, campus_code, address, phone, email,
    academic_year, term_structure, principal_name, managing_director,
    affiliation_board, affiliation_number, attendance_threshold_pct
) VALUES (
    'inst_config_01', 'Greenwood International School', 'GWIS',
    'Greenwood Campus, Outer Ring Road, Bengaluru', '+91 80 2843 9000', 'office@greenwood.edu.in',
    '2024-2025', 'Two-Term (Term 1 + Term 2)', 'Dr. Anita Sharma', 'Dr. Rajesh Kumar',
    'Central Board of Secondary Education (CBSE)', 'CBSE/AFF/2024/9842', 75.00
) ON CONFLICT (id) DO UPDATE SET
    institution_name = EXCLUDED.institution_name,
    principal_name = EXCLUDED.principal_name;

-- 2. System Users & RBAC
INSERT INTO users (id, name, email, role, designation, assigned_class, roll_number, avatar_text, status) VALUES
('u-1', 'Dr. Rajesh Kumar', 'admin@demo.com', 'Super Admin', 'Managing Director & System Administrator', NULL, NULL, 'DR', 'Active'),
('u-2', 'Dr. Anita Sharma', 'principal@demo.com', 'Principal', 'Head of School & Executive Academic Principal', NULL, NULL, 'AS', 'Active'),
('u-3', 'Prof. Vikram Singh', 'teacher@demo.com', 'Teacher', 'Senior Faculty (Maths) & Class Teacher 8-A', 'Class 8-A', NULL, 'VS', 'Active'),
('u-4', 'Rahul Sharma', 'student@demo.com', 'Student', 'Student — Class 8-A (Roll #01)', 'Class 8-A', 'SCH-8A-01', 'RS', 'Active'),
('u-5', 'Mr. Suresh Sharma', 'parent@demo.com', 'Parent', 'Parent / Guardian of Rahul Sharma (Class 8-A)', 'Class 8-A', 'SCH-8A-01', 'SS', 'Active'),
('u-6', 'Mrs. Meenakshi Sundaram', 'library@demo.com', 'Library Admin', 'Head Librarian & Learning Resource Administrator', NULL, NULL, 'MS', 'Active'),
('u-7', 'Mrs. Priya Desai', 'admin.office@demo.com', 'Administration', 'Head of Administration & Accounts Department', NULL, NULL, 'PD', 'Active')
ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    designation = EXCLUDED.designation;

-- 3. Students (300 Enrolled Students across Classes 5A to 10B)
INSERT INTO students (
    id, user_id, roll_number, name, email, gender, class_grade, section, academic_year,
    attendance_pct, classes_present, total_classes, overall_grade, term_percentage,
    phone, bus_route, guardian_name, guardian_relation, guardian_phone, address, dues,
    admission_date, date_of_birth, blood_group, remarks
) VALUES
('s-5a-01', NULL, 'SCH-5A-01', 'Akash Singh', 'akash.singh@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43001', 'Bus Route 02 (Indiranagar)', 'Sunil Singh', 'Father', '+91 98765 10001', 'Flat 137, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-03', '2014-04-06', 'B+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-5a-02', NULL, 'SCH-5A-02', 'Ananya Chopra', 'ananya.chopra@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43002', 'Bus Route 03 (Jayanagar)', 'Mahaveer Chopra', 'Father', '+91 98765 10002', 'Flat 174, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-05', '2014-07-11', 'O+', 'Exemplary leadership skills, serves as student representative.'),
('s-5a-03', NULL, 'SCH-5A-03', 'Aryan Pillai', 'aryan.pillai@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43003', 'Bus Route 04 (North City)', 'Gopal Pillai', 'Father', '+91 98765 10003', 'Flat 211, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-07', '2014-10-16', 'AB+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-5a-04', NULL, 'SCH-5A-04', 'Charu Kapoor', 'charu.kapoor@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43004', 'Bus Route 05 (Malleshwaram)', 'Anil Kapoor', 'Father', '+91 98765 10004', 'Flat 248, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-09', '2014-01-21', 'A-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-5a-05', NULL, 'SCH-5A-05', 'Harsh Srinivasan', 'harsh.srinivasan@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43005', 'Bus Route 06 (Whitefield)', 'Vikram Srinivasan', 'Father', '+91 98765 10005', 'Flat 285, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2014-04-26', 'B-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-5a-06', NULL, 'SCH-5A-06', 'Gauri Patel', 'gauri.patel@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43006', 'Private / Walker', 'Alok Patel', 'Father', '+91 98765 10006', 'Flat 322, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2014-07-03', 'O-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-5a-07', NULL, 'SCH-5A-07', 'Kunwar Joshi', 'kunwar.joshi@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43007', 'Bus Route 01 (Koramangala)', 'Sanjay Joshi', 'Father', '+91 98765 10007', 'Flat 359, Sobha Forest View, Kanakapura Road, Bengaluru', 25000.00, '2024-06-15', '2014-10-08', 'A+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-5a-08', NULL, 'SCH-5A-08', 'Khushi Rao', 'khushi.rao@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43008', 'Bus Route 02 (Indiranagar)', 'Harish Rao', 'Mother', '+91 98765 10008', 'Flat 396, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2014-01-13', 'B+', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-5a-09', NULL, 'SCH-5A-09', 'Naveen Hegde', 'naveen.hegde@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43009', 'Bus Route 03 (Jayanagar)', 'Praveen Hegde', 'Father', '+91 98765 10009', 'Flat 433, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2014-04-18', 'O+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-5a-10', NULL, 'SCH-5A-10', 'Mitali Aggarwal', 'mitali.aggarwal@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43010', 'Bus Route 04 (North City)', 'Suresh Aggarwal', 'Father', '+91 98765 10010', 'Flat 470, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2014-07-23', 'AB+', 'Exemplary leadership skills, serves as student representative.'),
('s-5a-11', NULL, 'SCH-5A-11', 'Prateek Nambiar', 'prateek.nambiar@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43011', 'Bus Route 05 (Malleshwaram)', 'Sunil Nambiar', 'Father', '+91 98765 10011', 'Flat 507, Mantri Espana, Bellandur, Bengaluru', 45000.00, '2024-06-03', '2014-10-28', 'A-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-5a-12', NULL, 'SCH-5A-12', 'Palak Nair', 'palak.nair@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43012', 'Bus Route 06 (Whitefield)', 'Mahaveer Nair', 'Father', '+91 98765 10012', 'Flat 544, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2014-01-05', 'B-', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-5a-13', NULL, 'SCH-5A-13', 'Rudra Deshmukh', 'rudra.deshmukh@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43013', 'Private / Walker', 'Gopal Deshmukh', 'Father', '+91 98765 10013', 'Flat 581, Hiranandani Glen Gate, Hebbal, Bengaluru', 60000.00, '2024-06-07', '2014-04-10', 'O-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-5a-14', NULL, 'SCH-5A-14', 'Riddhi Das', 'riddhi.das@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43014', 'Bus Route 01 (Koramangala)', 'Anil Das', 'Father', '+91 98765 10014', 'Flat 618, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 25000.00, '2024-06-09', '2014-07-15', 'A+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-5a-15', NULL, 'SCH-5A-15', 'Siddharth Mishra', 'siddharth.mishra@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43015', 'Bus Route 02 (Indiranagar)', 'Vikram Mishra', 'Father', '+91 98765 10015', 'Flat 655, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2014-10-20', 'B+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-5a-16', NULL, 'SCH-5A-16', 'Sanya Jain', 'sanya.jain@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43016', 'Bus Route 03 (Jayanagar)', 'Alok Jain', 'Mother', '+91 98765 10016', 'Flat 692, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2014-01-25', 'O+', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-5a-17', NULL, 'SCH-5A-17', 'Varun Shinde', 'varun.shinde@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43017', 'Bus Route 04 (North City)', 'Sanjay Shinde', 'Father', '+91 98765 10017', 'Flat 729, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-15', '2014-04-02', 'AB+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-5a-18', NULL, 'SCH-5A-18', 'Sonakshi Gupta', 'sonakshi.gupta@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43018', 'Bus Route 05 (Malleshwaram)', 'Harish Gupta', 'Father', '+91 98765 10018', 'Flat 766, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2014-07-07', 'A-', 'Exemplary leadership skills, serves as student representative.'),
('s-5a-19', NULL, 'SCH-5A-19', 'Vinay Kulkarni', 'vinay.kulkarni@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43019', 'Bus Route 06 (Whitefield)', 'Praveen Kulkarni', 'Father', '+91 98765 10019', 'Flat 803, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2014-10-12', 'B-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-5a-20', NULL, 'SCH-5A-20', 'Aadhya Menon', 'aadhya.menon@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43020', 'Private / Walker', 'Suresh Menon', 'Father', '+91 98765 10020', 'Flat 840, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2014-01-17', 'O-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-5a-21', NULL, 'SCH-5A-21', 'Akash Saxena', 'akash.saxena@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43021', 'Bus Route 01 (Koramangala)', 'Sunil Saxena', 'Father', '+91 98765 10021', 'Flat 877, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 25000.00, '2024-06-03', '2014-04-22', 'A+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-5a-22', NULL, 'SCH-5A-22', 'Ananya Gowda', 'ananya.gowda@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43022', 'Bus Route 02 (Indiranagar)', 'Mahaveer Gowda', 'Father', '+91 98765 10022', 'Flat 914, Sobha Forest View, Kanakapura Road, Bengaluru', 45000.00, '2024-06-05', '2014-07-27', 'B+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-5a-23', NULL, 'SCH-5A-23', 'Aryan Verma', 'aryan.verma@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43023', 'Bus Route 03 (Jayanagar)', 'Gopal Verma', 'Father', '+91 98765 10023', 'Flat 951, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2014-10-04', 'O+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-5a-24', NULL, 'SCH-5A-24', 'Charu Kumar', 'charu.kumar@demo.com', 'Female', 'Class 5-A', 'A', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43024', 'Bus Route 04 (North City)', 'Anil Kumar', 'Mother', '+91 98765 10024', 'Flat 988, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2014-01-09', 'AB+', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-5a-25', NULL, 'SCH-5A-25', 'Harsh Malhotra', 'harsh.malhotra@demo.com', 'Male', 'Class 5-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43025', 'Bus Route 05 (Malleshwaram)', 'Vikram Malhotra', 'Father', '+91 98765 10025', 'Flat 135, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2014-04-14', 'A-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-5b-01', NULL, 'SCH-5B-01', 'Nikhil Jain', 'nikhil.jain@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43026', 'Bus Route 02 (Indiranagar)', 'Pranab Jain', 'Father', '+91 98765 10026', 'Flat 137, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-03', '2014-04-06', 'B-', 'Exemplary leadership skills, serves as student representative.'),
('s-5b-02', NULL, 'SCH-5B-02', 'Navya Shinde', 'navya.shinde@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43027', 'Bus Route 03 (Jayanagar)', 'Manoj Shinde', 'Father', '+91 98765 10027', 'Flat 174, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2014-07-11', 'O-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-5b-03', NULL, 'SCH-5B-03', 'Rahul Gupta', 'rahul.gupta@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43028', 'Bus Route 04 (North City)', 'Rajeev Gupta', 'Father', '+91 98765 10028', 'Flat 211, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2014-10-16', 'A+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-5b-04', NULL, 'SCH-5B-04', 'Pooja Kulkarni', 'pooja.kulkarni@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43029', 'Bus Route 05 (Malleshwaram)', 'Dinesh Kulkarni', 'Father', '+91 98765 10029', 'Flat 248, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2014-01-21', 'B+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-5b-05', NULL, 'SCH-5B-05', 'Sachin Menon', 'sachin.menon@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43030', 'Bus Route 06 (Whitefield)', 'Mukesh Menon', 'Father', '+91 98765 10030', 'Flat 285, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2014-04-26', 'O+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-5b-06', NULL, 'SCH-5B-06', 'Riya Saxena', 'riya.saxena@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43031', 'Private / Walker', 'Kishore Saxena', 'Father', '+91 98765 10031', 'Flat 322, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2014-07-03', 'AB+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-5b-07', NULL, 'SCH-5B-07', 'Sohan Gowda', 'sohan.gowda@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43032', 'Bus Route 01 (Koramangala)', 'Santosh Gowda', 'Father', '+91 98765 10032', 'Flat 359, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 25000.00, '2024-06-15', '2014-10-08', 'A-', 'Consistent academic performer with strong conceptual clarity.'),
('s-5b-08', NULL, 'SCH-5B-08', 'Sara Verma', 'sara.verma@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43033', 'Bus Route 02 (Indiranagar)', 'Ramesh Verma', 'Mother', '+91 98765 10033', 'Flat 396, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2014-01-13', 'B-', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-5b-09', NULL, 'SCH-5B-09', 'Vedant Kumar', 'vedant.kumar@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43034', 'Bus Route 03 (Jayanagar)', 'Deepak Kumar', 'Father', '+91 98765 10034', 'Flat 433, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2014-04-18', 'O-', 'Exemplary leadership skills, serves as student representative.'),
('s-5b-10', NULL, 'SCH-5B-10', 'Suhani Malhotra', 'suhani.malhotra@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43035', 'Bus Route 04 (North City)', 'Venkat Malhotra', 'Father', '+91 98765 10035', 'Flat 470, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2014-07-23', 'A+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-5b-11', NULL, 'SCH-5B-11', 'Vivaan Shetty', 'vivaan.shetty@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43036', 'Bus Route 05 (Malleshwaram)', 'Pranab Shetty', 'Father', '+91 98765 10036', 'Flat 507, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 45000.00, '2024-06-03', '2014-10-28', 'B+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-5b-12', NULL, 'SCH-5B-12', 'Aanya Khanna', 'aanya.khanna@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43037', 'Bus Route 06 (Whitefield)', 'Manoj Khanna', 'Father', '+91 98765 10037', 'Flat 544, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2014-01-05', 'O+', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-5b-13', NULL, 'SCH-5B-13', 'Amit Krishnan', 'amit.krishnan@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43038', 'Private / Walker', 'Rajeev Krishnan', 'Father', '+91 98765 10038', 'Flat 581, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 60000.00, '2024-06-07', '2014-04-10', 'AB+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-5b-14', NULL, 'SCH-5B-14', 'Anika Reddy', 'anika.reddy@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43039', 'Bus Route 01 (Koramangala)', 'Dinesh Reddy', 'Father', '+91 98765 10039', 'Flat 618, Godrej Woodsman Estate, Hebbal, Bengaluru', 25000.00, '2024-06-09', '2014-07-15', 'A-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-5b-15', NULL, 'SCH-5B-15', 'Ayush Bhatia', 'ayush.bhatia@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43040', 'Bus Route 02 (Indiranagar)', 'Mukesh Bhatia', 'Father', '+91 98765 10040', 'Flat 655, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2014-10-20', 'B-', 'Consistent academic performer with strong conceptual clarity.'),
('s-5b-16', NULL, 'SCH-5B-16', 'Deepika Chatterjee', 'deepika.chatterjee@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43041', 'Bus Route 03 (Jayanagar)', 'Kishore Chatterjee', 'Mother', '+91 98765 10041', 'Flat 692, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2014-01-25', 'O-', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-5b-17', NULL, 'SCH-5B-17', 'Ishaan Banerjee', 'ishaan.banerjee@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43042', 'Bus Route 04 (North City)', 'Santosh Banerjee', 'Father', '+91 98765 10042', 'Flat 729, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-15', '2014-04-02', 'A+', 'Exemplary leadership skills, serves as student representative.'),
('s-5b-18', NULL, 'SCH-5B-18', 'Gayatri Mittal', 'gayatri.mittal@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43043', 'Bus Route 05 (Malleshwaram)', 'Ramesh Mittal', 'Father', '+91 98765 10043', 'Flat 766, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2014-07-07', 'B+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-5b-19', NULL, 'SCH-5B-19', 'Madhav Patil', 'madhav.patil@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43044', 'Bus Route 06 (Whitefield)', 'Deepak Patil', 'Father', '+91 98765 10044', 'Flat 803, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2014-10-12', 'O+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-5b-20', NULL, 'SCH-5B-20', 'Kritika Iyer', 'kritika.iyer@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43045', 'Private / Walker', 'Venkat Iyer', 'Father', '+91 98765 10045', 'Flat 840, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2014-01-17', 'AB+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-5b-21', NULL, 'SCH-5B-21', 'Nikhil Mehta', 'nikhil.mehta@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43046', 'Bus Route 01 (Koramangala)', 'Pranab Mehta', 'Father', '+91 98765 10046', 'Flat 877, Palm Residency, Indiranagar, Bengaluru', 25000.00, '2024-06-03', '2014-04-22', 'A-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-5b-22', NULL, 'SCH-5B-22', 'Navya Sen', 'navya.sen@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43047', 'Bus Route 02 (Indiranagar)', 'Manoj Sen', 'Father', '+91 98765 10047', 'Flat 914, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 45000.00, '2024-06-05', '2014-07-27', 'B-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-5b-23', NULL, 'SCH-5B-23', 'Rahul Pandey', 'rahul.pandey@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43048', 'Bus Route 03 (Jayanagar)', 'Rajeev Pandey', 'Father', '+91 98765 10048', 'Flat 951, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-07', '2014-10-04', 'O-', 'Consistent academic performer with strong conceptual clarity.'),
('s-5b-24', NULL, 'SCH-5B-24', 'Pooja Bansal', 'pooja.bansal@demo.com', 'Female', 'Class 5-B', 'B', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43049', 'Bus Route 04 (North City)', 'Dinesh Bansal', 'Mother', '+91 98765 10049', 'Flat 988, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-09', '2014-01-09', 'A+', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-5b-25', NULL, 'SCH-5B-25', 'Sachin Sharma', 'sachin.sharma@demo.com', 'Male', 'Class 5-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43050', 'Bus Route 05 (Malleshwaram)', 'Mukesh Sharma', 'Father', '+91 98765 10050', 'Flat 135, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2014-04-14', 'B+', 'Exemplary leadership skills, serves as student representative.'),
('s-6a-01', NULL, 'SCH-6A-01', 'Vihaan Chatterjee', 'vihaan.chatterjee@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43051', 'Bus Route 02 (Indiranagar)', 'Alok Chatterjee', 'Father', '+91 98765 10051', 'Flat 137, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-03', '2013-04-06', 'O+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-6a-02', NULL, 'SCH-6A-02', 'Tanvi Banerjee', 'tanvi.banerjee@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43052', 'Bus Route 03 (Jayanagar)', 'Sanjay Banerjee', 'Father', '+91 98765 10052', 'Flat 174, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2013-07-11', 'AB+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-6a-03', NULL, 'SCH-6A-03', 'Yash Mittal', 'yash.mittal@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43053', 'Bus Route 04 (North City)', 'Harish Mittal', 'Father', '+91 98765 10053', 'Flat 211, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2013-10-16', 'A-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-6a-04', NULL, 'SCH-6A-04', 'Aditi Patil', 'aditi.patil@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43054', 'Bus Route 05 (Malleshwaram)', 'Praveen Patil', 'Father', '+91 98765 10054', 'Flat 248, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2013-01-21', 'B-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-6a-05', NULL, 'SCH-6A-05', 'Anand Iyer', 'anand.iyer@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43055', 'Bus Route 06 (Whitefield)', 'Suresh Iyer', 'Father', '+91 98765 10055', 'Flat 285, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2013-04-26', 'O-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-6a-06', NULL, 'SCH-6A-06', 'Ankita Mehta', 'ankita.mehta@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43056', 'Private / Walker', 'Sunil Mehta', 'Father', '+91 98765 10056', 'Flat 322, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2013-07-03', 'A+', 'Consistent academic performer with strong conceptual clarity.'),
('s-6a-07', NULL, 'SCH-6A-07', 'Chetan Sen', 'chetan.sen@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43057', 'Bus Route 01 (Koramangala)', 'Mahaveer Sen', 'Father', '+91 98765 10057', 'Flat 359, Purva Venezia, Yelahanka, Bengaluru', 25000.00, '2024-06-15', '2013-10-08', 'B+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-6a-08', NULL, 'SCH-6A-08', 'Dia Pandey', 'dia.pandey@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43058', 'Bus Route 02 (Indiranagar)', 'Gopal Pandey', 'Mother', '+91 98765 10058', 'Flat 396, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2013-01-13', 'O+', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-6a-09', NULL, 'SCH-6A-09', 'Kabir Bansal', 'kabir.bansal@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43059', 'Bus Route 03 (Jayanagar)', 'Anil Bansal', 'Father', '+91 98765 10059', 'Flat 433, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2013-04-18', 'AB+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-6a-10', NULL, 'SCH-6A-10', 'Isha Sharma', 'isha.sharma@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43060', 'Bus Route 04 (North City)', 'Vikram Sharma', 'Father', '+91 98765 10060', 'Flat 470, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2013-07-23', 'A-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-6a-11', NULL, 'SCH-6A-11', 'Manish Singh', 'manish.singh@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43061', 'Bus Route 05 (Malleshwaram)', 'Alok Singh', 'Father', '+91 98765 10061', 'Flat 507, Palm Residency, Indiranagar, Bengaluru', 45000.00, '2024-06-03', '2013-10-28', 'B-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-6a-12', NULL, 'SCH-6A-12', 'Lavanya Chopra', 'lavanya.chopra@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43062', 'Bus Route 06 (Whitefield)', 'Sanjay Chopra', 'Father', '+91 98765 10062', 'Flat 544, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-05', '2013-01-05', 'O-', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-6a-13', NULL, 'SCH-6A-13', 'Omkar Pillai', 'omkar.pillai@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43063', 'Private / Walker', 'Harish Pillai', 'Father', '+91 98765 10063', 'Flat 581, Shantiniketan Apartments, Whitefield, Bengaluru', 60000.00, '2024-06-07', '2013-04-10', 'A+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-6a-14', NULL, 'SCH-6A-14', 'Neha Kapoor', 'neha.kapoor@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43064', 'Bus Route 01 (Koramangala)', 'Praveen Kapoor', 'Father', '+91 98765 10064', 'Flat 618, Ferns Habitat, Marathahalli, Bengaluru', 25000.00, '2024-06-09', '2013-07-15', 'B+', 'Consistent academic performer with strong conceptual clarity.'),
('s-6a-15', NULL, 'SCH-6A-15', 'Rajat Srinivasan', 'rajat.srinivasan@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43065', 'Bus Route 02 (Indiranagar)', 'Suresh Srinivasan', 'Father', '+91 98765 10065', 'Flat 655, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2013-10-20', 'O+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-6a-16', NULL, 'SCH-6A-16', 'Prachi Patel', 'prachi.patel@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43066', 'Bus Route 03 (Jayanagar)', 'Sunil Patel', 'Mother', '+91 98765 10066', 'Flat 692, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2013-01-25', 'AB+', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-6a-17', NULL, 'SCH-6A-17', 'Sahil Joshi', 'sahil.joshi@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43067', 'Bus Route 04 (North City)', 'Mahaveer Joshi', 'Father', '+91 98765 10067', 'Flat 729, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-15', '2013-04-02', 'A-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-6a-18', NULL, 'SCH-6A-18', 'Roshni Rao', 'roshni.rao@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43068', 'Bus Route 05 (Malleshwaram)', 'Gopal Rao', 'Father', '+91 98765 10068', 'Flat 766, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2013-07-07', 'B-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-6a-19', NULL, 'SCH-6A-19', 'Sparsh Hegde', 'sparsh.hegde@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43069', 'Bus Route 06 (Whitefield)', 'Anil Hegde', 'Father', '+91 98765 10069', 'Flat 803, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2013-10-12', 'O-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-6a-20', NULL, 'SCH-6A-20', 'Shreya Aggarwal', 'shreya.aggarwal@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43070', 'Private / Walker', 'Vikram Aggarwal', 'Father', '+91 98765 10070', 'Flat 840, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2013-01-17', 'A+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-6a-21', NULL, 'SCH-6A-21', 'Vihaan Nambiar', 'vihaan.nambiar@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43071', 'Bus Route 01 (Koramangala)', 'Alok Nambiar', 'Father', '+91 98765 10071', 'Flat 877, Mantri Espana, Bellandur, Bengaluru', 25000.00, '2024-06-03', '2013-04-22', 'B+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-6a-22', NULL, 'SCH-6A-22', 'Tanvi Nair', 'tanvi.nair@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43072', 'Bus Route 02 (Indiranagar)', 'Sanjay Nair', 'Father', '+91 98765 10072', 'Flat 914, Purva Venezia, Yelahanka, Bengaluru', 45000.00, '2024-06-05', '2013-07-27', 'O+', 'Consistent academic performer with strong conceptual clarity.'),
('s-6a-23', NULL, 'SCH-6A-23', 'Yash Deshmukh', 'yash.deshmukh@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43073', 'Bus Route 03 (Jayanagar)', 'Harish Deshmukh', 'Father', '+91 98765 10073', 'Flat 951, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2013-10-04', 'AB+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-6a-24', NULL, 'SCH-6A-24', 'Aditi Das', 'aditi.das@demo.com', 'Female', 'Class 6-A', 'A', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43074', 'Bus Route 04 (North City)', 'Praveen Das', 'Mother', '+91 98765 10074', 'Flat 988, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2013-01-09', 'A-', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-6a-25', NULL, 'SCH-6A-25', 'Anand Mishra', 'anand.mishra@demo.com', 'Male', 'Class 6-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43075', 'Bus Route 05 (Malleshwaram)', 'Suresh Mishra', 'Father', '+91 98765 10075', 'Flat 135, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2013-04-14', 'B-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-6b-01', NULL, 'SCH-6B-01', 'Ananya Reddy', 'ananya.reddy@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 94.5, 62, 66, 'A1', 96, '+91 98765 43206', 'Bus Route 03 (Jayanagar)', 'Venkat Reddy', 'Father', '+91 98765 00006', '77, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-13', '2013-10-09', 'B+', 'Class topper in Science; exceptional quiz team participant.'),
('s-6b-02', NULL, 'SCH-6B-02', 'Ishani Joshi', 'ishani.joshi@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43076', 'Bus Route 03 (Jayanagar)', 'Santosh Joshi', 'Father', '+91 98765 10076', 'Flat 174, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-05', '2013-07-11', 'A+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-6b-03', NULL, 'SCH-6B-03', 'Mayank Rao', 'mayank.rao@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43077', 'Bus Route 04 (North City)', 'Ramesh Rao', 'Father', '+91 98765 10077', 'Flat 211, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-07', '2013-10-16', 'B+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-6b-04', NULL, 'SCH-6B-04', 'Mahika Hegde', 'mahika.hegde@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43078', 'Bus Route 05 (Malleshwaram)', 'Deepak Hegde', 'Father', '+91 98765 10078', 'Flat 248, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-09', '2013-01-21', 'O+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-6b-05', NULL, 'SCH-6B-05', 'Parth Aggarwal', 'parth.aggarwal@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43079', 'Bus Route 06 (Whitefield)', 'Venkat Aggarwal', 'Father', '+91 98765 10079', 'Flat 285, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2013-04-26', 'AB+', 'Consistent academic performer with strong conceptual clarity.'),
('s-6b-06', NULL, 'SCH-6B-06', 'Niharika Nambiar', 'niharika.nambiar@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43080', 'Private / Walker', 'Pranab Nambiar', 'Father', '+91 98765 10080', 'Flat 322, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2013-07-03', 'A-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-6b-07', NULL, 'SCH-6B-07', 'Rajesh Nair', 'rajesh.nair@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43081', 'Bus Route 01 (Koramangala)', 'Manoj Nair', 'Father', '+91 98765 10081', 'Flat 359, Sobha Forest View, Kanakapura Road, Bengaluru', 25000.00, '2024-06-15', '2013-10-08', 'B-', 'Exemplary leadership skills, serves as student representative.'),
('s-6b-08', NULL, 'SCH-6B-08', 'Priya Deshmukh', 'priya.deshmukh@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43082', 'Bus Route 02 (Indiranagar)', 'Rajeev Deshmukh', 'Mother', '+91 98765 10082', 'Flat 396, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2013-01-13', 'O-', 'Active in co-curriculars; regular homework revision is advised.'),
('s-6b-09', NULL, 'SCH-6B-09', 'Samar Das', 'samar.das@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43083', 'Bus Route 03 (Jayanagar)', 'Dinesh Das', 'Father', '+91 98765 10083', 'Flat 433, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2013-04-18', 'A+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-6b-10', NULL, 'SCH-6B-10', 'Saanvi Mishra', 'saanvi.mishra@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43084', 'Bus Route 04 (North City)', 'Mukesh Mishra', 'Father', '+91 98765 10084', 'Flat 470, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2013-07-23', 'B+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-6b-11', NULL, 'SCH-6B-11', 'Tanmay Jain', 'tanmay.jain@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43085', 'Bus Route 05 (Malleshwaram)', 'Kishore Jain', 'Father', '+91 98765 10085', 'Flat 507, Mantri Espana, Bellandur, Bengaluru', 45000.00, '2024-06-03', '2013-10-28', 'O+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-6b-12', NULL, 'SCH-6B-12', 'Shruti Shinde', 'shruti.shinde@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43086', 'Bus Route 06 (Whitefield)', 'Santosh Shinde', 'Father', '+91 98765 10086', 'Flat 544, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2013-01-05', 'AB+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-6b-13', NULL, 'SCH-6B-13', 'Vijay Gupta', 'vijay.gupta@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43087', 'Private / Walker', 'Ramesh Gupta', 'Father', '+91 98765 10087', 'Flat 581, Hiranandani Glen Gate, Hebbal, Bengaluru', 60000.00, '2024-06-07', '2013-04-10', 'A-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-6b-14', NULL, 'SCH-6B-14', 'Tara Kulkarni', 'tara.kulkarni@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43088', 'Bus Route 01 (Koramangala)', 'Deepak Kulkarni', 'Father', '+91 98765 10088', 'Flat 618, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 25000.00, '2024-06-09', '2013-07-15', 'B-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-6b-15', NULL, 'SCH-6B-15', 'Aarav Menon', 'aarav.menon@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43089', 'Bus Route 02 (Indiranagar)', 'Venkat Menon', 'Father', '+91 98765 10089', 'Flat 655, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2013-10-20', 'O-', 'Exemplary leadership skills, serves as student representative.'),
('s-6b-16', NULL, 'SCH-6B-16', 'Akshara Saxena', 'akshara.saxena@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43090', 'Bus Route 03 (Jayanagar)', 'Pranab Saxena', 'Mother', '+91 98765 10090', 'Flat 692, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2013-01-25', 'A+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-6b-17', NULL, 'SCH-6B-17', 'Aniket Gowda', 'aniket.gowda@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43091', 'Bus Route 04 (North City)', 'Manoj Gowda', 'Father', '+91 98765 10091', 'Flat 729, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-15', '2013-04-02', 'B+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-6b-18', NULL, 'SCH-6B-18', 'Anushka Verma', 'anushka.verma@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43092', 'Bus Route 05 (Malleshwaram)', 'Rajeev Verma', 'Father', '+91 98765 10092', 'Flat 766, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2013-07-07', 'O+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-6b-19', NULL, 'SCH-6B-19', 'Dev Kumar', 'dev.kumar@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43093', 'Bus Route 06 (Whitefield)', 'Dinesh Kumar', 'Father', '+91 98765 10093', 'Flat 803, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2013-10-12', 'AB+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-6b-20', NULL, 'SCH-6B-20', 'Divya Malhotra', 'divya.malhotra@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43094', 'Private / Walker', 'Mukesh Malhotra', 'Father', '+91 98765 10094', 'Flat 840, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2013-01-17', 'A-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-6b-21', NULL, 'SCH-6B-21', 'Karan Shetty', 'karan.shetty@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43095', 'Bus Route 01 (Koramangala)', 'Kishore Shetty', 'Father', '+91 98765 10095', 'Flat 877, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 25000.00, '2024-06-03', '2013-04-22', 'B-', 'Consistent academic performer with strong conceptual clarity.'),
('s-6b-22', NULL, 'SCH-6B-22', 'Ishani Khanna', 'ishani.khanna@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43096', 'Bus Route 02 (Indiranagar)', 'Santosh Khanna', 'Father', '+91 98765 10096', 'Flat 914, Sobha Forest View, Kanakapura Road, Bengaluru', 45000.00, '2024-06-05', '2013-07-27', 'O-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-6b-23', NULL, 'SCH-6B-23', 'Mayank Krishnan', 'mayank.krishnan@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43097', 'Bus Route 03 (Jayanagar)', 'Ramesh Krishnan', 'Father', '+91 98765 10097', 'Flat 951, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2013-10-04', 'A+', 'Exemplary leadership skills, serves as student representative.'),
('s-6b-24', NULL, 'SCH-6B-24', 'Mahika Reddy', 'mahika.reddy@demo.com', 'Female', 'Class 6-B', 'B', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43098', 'Bus Route 04 (North City)', 'Deepak Reddy', 'Mother', '+91 98765 10098', 'Flat 988, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2013-01-09', 'B+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-6b-25', NULL, 'SCH-6B-25', 'Parth Bhatia', 'parth.bhatia@demo.com', 'Male', 'Class 6-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43099', 'Bus Route 05 (Malleshwaram)', 'Venkat Bhatia', 'Father', '+91 98765 10099', 'Flat 135, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2013-04-14', 'O+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-7a-01', NULL, 'SCH-7A-01', 'Vijay Nair', 'vijay.nair@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 73.5, 48, 66, 'B2', 72.5, '+91 98765 43207', 'Bus Route 05 (Malleshwaram)', 'Gopal Nair', 'Father', '+91 98765 00007', 'Plot 10, Malleshwaram, Bengaluru', 50000.00, '2024-06-14', '2012-12-17', 'A-', 'Good progress in Hindi and Social Studies; needs regular homework check.'),
('s-7a-02', NULL, 'SCH-7A-02', 'Sakshi Gowda', 'sakshi.gowda@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43100', 'Bus Route 03 (Jayanagar)', 'Mahaveer Gowda', 'Father', '+91 98765 10100', 'Flat 174, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2012-07-11', 'A-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-7a-03', NULL, 'SCH-7A-03', 'Tarun Verma', 'tarun.verma@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43101', 'Bus Route 04 (North City)', 'Gopal Verma', 'Father', '+91 98765 10101', 'Flat 211, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2012-10-16', 'B-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-7a-04', NULL, 'SCH-7A-04', 'Simran Kumar', 'simran.kumar@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43102', 'Bus Route 05 (Malleshwaram)', 'Anil Kumar', 'Father', '+91 98765 10102', 'Flat 248, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2012-01-21', 'O-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-7a-05', NULL, 'SCH-7A-05', 'Vikas Malhotra', 'vikas.malhotra@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43103', 'Bus Route 06 (Whitefield)', 'Vikram Malhotra', 'Father', '+91 98765 10103', 'Flat 285, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2012-04-26', 'A+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-7a-06', NULL, 'SCH-7A-06', 'Trisha Shetty', 'trisha.shetty@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43104', 'Private / Walker', 'Alok Shetty', 'Father', '+91 98765 10104', 'Flat 322, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2012-07-03', 'B+', 'Exemplary leadership skills, serves as student representative.'),
('s-7a-07', NULL, 'SCH-7A-07', 'Aditya Khanna', 'aditya.khanna@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43105', 'Bus Route 01 (Koramangala)', 'Sanjay Khanna', 'Father', '+91 98765 10105', 'Flat 359, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 25000.00, '2024-06-15', '2012-10-08', 'O+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-7a-08', NULL, 'SCH-7A-08', 'Alia Krishnan', 'alia.krishnan@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43106', 'Bus Route 02 (Indiranagar)', 'Harish Krishnan', 'Mother', '+91 98765 10106', 'Flat 396, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2012-01-13', 'AB+', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-7a-09', NULL, 'SCH-7A-09', 'Anirudh Reddy', 'anirudh.reddy@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43107', 'Bus Route 03 (Jayanagar)', 'Praveen Reddy', 'Father', '+91 98765 10107', 'Flat 433, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2012-04-18', 'A-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-7a-10', NULL, 'SCH-7A-10', 'Avani Bhatia', 'avani.bhatia@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43108', 'Bus Route 04 (North City)', 'Suresh Bhatia', 'Father', '+91 98765 10108', 'Flat 470, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2012-07-23', 'B-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-7a-11', NULL, 'SCH-7A-11', 'Dhruv Chatterjee', 'dhruv.chatterjee@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43109', 'Bus Route 05 (Malleshwaram)', 'Sunil Chatterjee', 'Father', '+91 98765 10109', 'Flat 507, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 45000.00, '2024-06-03', '2012-10-28', 'O-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-7a-12', NULL, 'SCH-7A-12', 'Diya Banerjee', 'diya.banerjee@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43110', 'Bus Route 06 (Whitefield)', 'Mahaveer Banerjee', 'Father', '+91 98765 10110', 'Flat 544, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2012-01-05', 'A+', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-7a-13', NULL, 'SCH-7A-13', 'Kartik Mittal', 'kartik.mittal@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43111', 'Private / Walker', 'Gopal Mittal', 'Father', '+91 98765 10111', 'Flat 581, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 60000.00, '2024-06-07', '2012-04-10', 'B+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-7a-14', NULL, 'SCH-7A-14', 'Jhanvi Patil', 'jhanvi.patil@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43112', 'Bus Route 01 (Koramangala)', 'Anil Patil', 'Father', '+91 98765 10112', 'Flat 618, Godrej Woodsman Estate, Hebbal, Bengaluru', 25000.00, '2024-06-09', '2012-07-15', 'O+', 'Exemplary leadership skills, serves as student representative.'),
('s-7a-15', NULL, 'SCH-7A-15', 'Mihir Iyer', 'mihir.iyer@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43113', 'Bus Route 02 (Indiranagar)', 'Vikram Iyer', 'Father', '+91 98765 10113', 'Flat 655, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2012-10-20', 'AB+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-7a-16', NULL, 'SCH-7A-16', 'Manvi Mehta', 'manvi.mehta@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43114', 'Bus Route 03 (Jayanagar)', 'Alok Mehta', 'Mother', '+91 98765 10114', 'Flat 692, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2012-01-25', 'A-', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-7a-17', NULL, 'SCH-7A-17', 'Pranav Sen', 'pranav.sen@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43115', 'Bus Route 04 (North City)', 'Sanjay Sen', 'Father', '+91 98765 10115', 'Flat 729, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-15', '2012-04-02', 'B-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-7a-18', NULL, 'SCH-7A-18', 'Nikita Pandey', 'nikita.pandey@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43116', 'Bus Route 05 (Malleshwaram)', 'Harish Pandey', 'Father', '+91 98765 10116', 'Flat 766, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2012-07-07', 'O-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-7a-19', NULL, 'SCH-7A-19', 'Rohan Bansal', 'rohan.bansal@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43117', 'Bus Route 06 (Whitefield)', 'Praveen Bansal', 'Father', '+91 98765 10117', 'Flat 803, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2012-10-12', 'A+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-7a-20', NULL, 'SCH-7A-20', 'Rachana Sharma', 'rachana.sharma@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43118', 'Private / Walker', 'Suresh Sharma', 'Father', '+91 98765 10118', 'Flat 840, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2012-01-17', 'B+', 'Consistent academic performer with strong conceptual clarity.'),
('s-7a-21', NULL, 'SCH-7A-21', 'Sameer Singh', 'sameer.singh@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43119', 'Bus Route 01 (Koramangala)', 'Sunil Singh', 'Father', '+91 98765 10119', 'Flat 877, Palm Residency, Indiranagar, Bengaluru', 25000.00, '2024-06-03', '2012-04-22', 'O+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-7a-22', NULL, 'SCH-7A-22', 'Sakshi Chopra', 'sakshi.chopra@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43120', 'Bus Route 02 (Indiranagar)', 'Mahaveer Chopra', 'Father', '+91 98765 10120', 'Flat 914, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 45000.00, '2024-06-05', '2012-07-27', 'AB+', 'Exemplary leadership skills, serves as student representative.'),
('s-7a-23', NULL, 'SCH-7A-23', 'Tarun Pillai', 'tarun.pillai@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43121', 'Bus Route 03 (Jayanagar)', 'Gopal Pillai', 'Father', '+91 98765 10121', 'Flat 951, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-07', '2012-10-04', 'A-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-7a-24', NULL, 'SCH-7A-24', 'Simran Kapoor', 'simran.kapoor@demo.com', 'Female', 'Class 7-A', 'A', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43122', 'Bus Route 04 (North City)', 'Anil Kapoor', 'Mother', '+91 98765 10122', 'Flat 988, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-09', '2012-01-09', 'B-', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-7a-25', NULL, 'SCH-7A-25', 'Vikas Srinivasan', 'vikas.srinivasan@demo.com', 'Male', 'Class 7-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43123', 'Bus Route 05 (Malleshwaram)', 'Vikram Srinivasan', 'Father', '+91 98765 10123', 'Flat 135, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2012-04-14', 'O-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-7b-01', NULL, 'SCH-7B-01', 'Arjun Mehta', 'arjun.mehta@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43124', 'Bus Route 02 (Indiranagar)', 'Pranab Mehta', 'Father', '+91 98765 10124', 'Flat 137, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-03', '2012-04-06', 'A+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-7b-02', NULL, 'SCH-7B-02', 'Bhavna Sen', 'bhavna.sen@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43125', 'Bus Route 03 (Jayanagar)', 'Manoj Sen', 'Father', '+91 98765 10125', 'Flat 174, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2012-07-11', 'B+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-7b-03', NULL, 'SCH-7B-03', 'Gaurav Pandey', 'gaurav.pandey@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43126', 'Bus Route 04 (North City)', 'Rajeev Pandey', 'Father', '+91 98765 10126', 'Flat 211, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2012-10-16', 'O+', 'Consistent academic performer with strong conceptual clarity.'),
('s-7b-04', NULL, 'SCH-7B-04', 'Esha Bansal', 'esha.bansal@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43127', 'Bus Route 05 (Malleshwaram)', 'Dinesh Bansal', 'Father', '+91 98765 10127', 'Flat 248, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2012-01-21', 'AB+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-7b-05', NULL, 'SCH-7B-05', 'Krish Sharma', 'krish.sharma@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43128', 'Bus Route 06 (Whitefield)', 'Mukesh Sharma', 'Father', '+91 98765 10128', 'Flat 285, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2012-04-26', 'A-', 'Exemplary leadership skills, serves as student representative.'),
('s-7b-06', NULL, 'SCH-7B-06', 'Kavita Singh', 'kavita.singh@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43129', 'Private / Walker', 'Kishore Singh', 'Father', '+91 98765 10129', 'Flat 322, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2012-07-03', 'B-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-7b-07', NULL, 'SCH-7B-07', 'Nakul Chopra', 'nakul.chopra@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43130', 'Bus Route 01 (Koramangala)', 'Santosh Chopra', 'Father', '+91 98765 10130', 'Flat 359, Purva Venezia, Yelahanka, Bengaluru', 25000.00, '2024-06-15', '2012-10-08', 'O-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-7b-08', NULL, 'SCH-7B-08', 'Meera Pillai', 'meera.pillai@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43131', 'Bus Route 02 (Indiranagar)', 'Ramesh Pillai', 'Mother', '+91 98765 10131', 'Flat 396, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2012-01-13', 'A+', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-7b-09', NULL, 'SCH-7B-09', 'Praneeth Kapoor', 'praneeth.kapoor@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43132', 'Bus Route 03 (Jayanagar)', 'Deepak Kapoor', 'Father', '+91 98765 10132', 'Flat 433, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2012-04-18', 'B+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-7b-10', NULL, 'SCH-7B-10', 'Nisha Srinivasan', 'nisha.srinivasan@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43133', 'Bus Route 04 (North City)', 'Venkat Srinivasan', 'Father', '+91 98765 10133', 'Flat 470, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2012-07-23', 'O+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-7b-11', NULL, 'SCH-7B-11', 'Rohit Patel', 'rohit.patel@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43134', 'Bus Route 05 (Malleshwaram)', 'Pranab Patel', 'Father', '+91 98765 10134', 'Flat 507, Palm Residency, Indiranagar, Bengaluru', 45000.00, '2024-06-03', '2012-10-28', 'AB+', 'Consistent academic performer with strong conceptual clarity.'),
('s-7b-12', NULL, 'SCH-7B-12', 'Rhea Joshi', 'rhea.joshi@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43135', 'Bus Route 06 (Whitefield)', 'Manoj Joshi', 'Father', '+91 98765 10135', 'Flat 544, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-05', '2012-01-05', 'A-', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-7b-13', NULL, 'SCH-7B-13', 'Samarth Rao', 'samarth.rao@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43136', 'Private / Walker', 'Rajeev Rao', 'Father', '+91 98765 10136', 'Flat 581, Shantiniketan Apartments, Whitefield, Bengaluru', 60000.00, '2024-06-07', '2012-04-10', 'B-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-7b-14', NULL, 'SCH-7B-14', 'Samaira Hegde', 'samaira.hegde@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43137', 'Bus Route 01 (Koramangala)', 'Dinesh Hegde', 'Father', '+91 98765 10137', 'Flat 618, Ferns Habitat, Marathahalli, Bengaluru', 25000.00, '2024-06-09', '2012-07-15', 'O-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-7b-15', NULL, 'SCH-7B-15', 'Utkarsh Aggarwal', 'utkarsh.aggarwal@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43138', 'Bus Route 02 (Indiranagar)', 'Mukesh Aggarwal', 'Father', '+91 98765 10138', 'Flat 655, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2012-10-20', 'A+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-7b-16', NULL, 'SCH-7B-16', 'Sneha Nambiar', 'sneha.nambiar@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43139', 'Bus Route 03 (Jayanagar)', 'Kishore Nambiar', 'Mother', '+91 98765 10139', 'Flat 692, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2012-01-25', 'B+', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-7b-17', NULL, 'SCH-7B-17', 'Vikram Nair', 'vikram.nair@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43140', 'Bus Route 04 (North City)', 'Santosh Nair', 'Father', '+91 98765 10140', 'Flat 729, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-15', '2012-04-02', 'O+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-7b-18', NULL, 'SCH-7B-18', 'Vanya Deshmukh', 'vanya.deshmukh@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43141', 'Bus Route 05 (Malleshwaram)', 'Ramesh Deshmukh', 'Father', '+91 98765 10141', 'Flat 766, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2012-07-07', 'AB+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-7b-19', NULL, 'SCH-7B-19', 'Advait Das', 'advait.das@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43142', 'Bus Route 06 (Whitefield)', 'Deepak Das', 'Father', '+91 98765 10142', 'Flat 803, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2012-10-12', 'A-', 'Consistent academic performer with strong conceptual clarity.'),
('s-7b-20', NULL, 'SCH-7B-20', 'Amrita Mishra', 'amrita.mishra@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43143', 'Private / Walker', 'Venkat Mishra', 'Father', '+91 98765 10143', 'Flat 840, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2012-01-17', 'B-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-7b-21', NULL, 'SCH-7B-21', 'Arjun Jain', 'arjun.jain@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43144', 'Bus Route 01 (Koramangala)', 'Pranab Jain', 'Father', '+91 98765 10144', 'Flat 877, Mantri Espana, Bellandur, Bengaluru', 25000.00, '2024-06-03', '2012-04-22', 'O-', 'Exemplary leadership skills, serves as student representative.'),
('s-7b-22', NULL, 'SCH-7B-22', 'Bhavna Shinde', 'bhavna.shinde@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43145', 'Bus Route 02 (Indiranagar)', 'Manoj Shinde', 'Father', '+91 98765 10145', 'Flat 914, Purva Venezia, Yelahanka, Bengaluru', 45000.00, '2024-06-05', '2012-07-27', 'A+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-7b-23', NULL, 'SCH-7B-23', 'Gaurav Gupta', 'gaurav.gupta@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43146', 'Bus Route 03 (Jayanagar)', 'Rajeev Gupta', 'Father', '+91 98765 10146', 'Flat 951, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2012-10-04', 'B+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-7b-24', NULL, 'SCH-7B-24', 'Esha Kulkarni', 'esha.kulkarni@demo.com', 'Female', 'Class 7-B', 'B', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43147', 'Bus Route 04 (North City)', 'Dinesh Kulkarni', 'Mother', '+91 98765 10147', 'Flat 988, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2012-01-09', 'O+', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-7b-25', NULL, 'SCH-7B-25', 'Krish Menon', 'krish.menon@demo.com', 'Male', 'Class 7-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43148', 'Bus Route 05 (Malleshwaram)', 'Mukesh Menon', 'Father', '+91 98765 10148', 'Flat 135, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2012-04-14', 'AB+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-8a-01', 'u-4', 'SCH-8A-01', 'Rahul Sharma', 'rahul.sharma@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 71.2, 47, 66, 'A2', 84.5, '+91 98765 43201', 'Bus Route 04 (North City)', 'Suresh Sharma', 'Father', '+91 98765 00001', 'Flat 402, Green Meadows, Outer Ring Road, Bengaluru', 25000.00, '2024-06-10', '2011-11-14', 'B+', 'Consistent performer; needs slight focus in Science practicals.'),
('s-8a-02', NULL, 'SCH-8A-02', 'Sneha Patel', 'sneha.patel@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 92.5, 61, 66, 'A1', 94.2, '+91 98765 43202', 'Bus Route 02 (Indiranagar)', 'Ramesh Patel', 'Father', '+91 98765 00002', 'B-12, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-10', '2011-03-22', 'O+', 'Class Monitor; outstanding analytical ability in Mathematics.'),
('s-8a-03', NULL, 'SCH-8A-03', 'Amit Kumar', 'amit.kumar@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 71.2, 47, 66, 'B1', 76.8, '+91 98765 43203', 'Bus Route 06 (Whitefield)', 'Sunil Kumar', 'Father', '+91 98765 00003', '14/3, Indira Nagar, Bengaluru', 45000.00, '2024-06-11', '2011-08-05', 'A+', 'Active in sports; encouraged to attend remedial English sessions.'),
('s-8a-04', NULL, 'SCH-8A-04', 'Pooja Gupta', 'pooja.gupta@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 72.7, 48, 66, 'A2', 82.4, '+91 98765 43204', 'Bus Route 01 (Koramangala)', 'Deepak Gupta', 'Father', '+91 98765 00004', '89, Koramangala 4th Block, Bengaluru', 60000.00, '2024-06-12', '2011-01-19', 'AB+', 'Strong creative writing skills and active in cultural debates.'),
('s-8a-05', NULL, 'SCH-8A-05', 'Rohit Jain', 'rohit.jain@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 74, 49, 66, 'B1', 75, '+91 98765 43205', 'Bus Route 04 (North City)', 'Mahaveer Jain', 'Father', '+91 98765 00005', '22, Ring Road, Bengaluru', 70000.00, '2024-06-12', '2011-07-30', 'O-', 'Shows keen interest in Computer Science and robotics club.'),
('s-8a-06', NULL, 'SCH-8A-06', 'Sanya Jain', 'sanya.jain@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43149', 'Private / Walker', 'Sunil Jain', 'Father', '+91 98765 10149', 'Flat 322, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2011-07-03', 'O+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-8a-07', NULL, 'SCH-8A-07', 'Varun Shinde', 'varun.shinde@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43150', 'Bus Route 01 (Koramangala)', 'Mahaveer Shinde', 'Father', '+91 98765 10150', 'Flat 359, Sobha Forest View, Kanakapura Road, Bengaluru', 25000.00, '2024-06-15', '2011-10-08', 'AB+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-8a-08', NULL, 'SCH-8A-08', 'Sonakshi Gupta', 'sonakshi.gupta@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43151', 'Bus Route 02 (Indiranagar)', 'Gopal Gupta', 'Mother', '+91 98765 10151', 'Flat 396, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2011-01-13', 'A-', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-8a-09', NULL, 'SCH-8A-09', 'Vinay Kulkarni', 'vinay.kulkarni@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43152', 'Bus Route 03 (Jayanagar)', 'Anil Kulkarni', 'Father', '+91 98765 10152', 'Flat 433, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2011-04-18', 'B-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-8a-10', NULL, 'SCH-8A-10', 'Aadhya Menon', 'aadhya.menon@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43153', 'Bus Route 04 (North City)', 'Vikram Menon', 'Father', '+91 98765 10153', 'Flat 470, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2011-07-23', 'O-', 'Consistent academic performer with strong conceptual clarity.'),
('s-8a-11', NULL, 'SCH-8A-11', 'Akash Saxena', 'akash.saxena@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43154', 'Bus Route 05 (Malleshwaram)', 'Alok Saxena', 'Father', '+91 98765 10154', 'Flat 507, Mantri Espana, Bellandur, Bengaluru', 45000.00, '2024-06-03', '2011-10-28', 'A+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-8a-12', NULL, 'SCH-8A-12', 'Ananya Gowda', 'ananya.gowda@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43155', 'Bus Route 06 (Whitefield)', 'Sanjay Gowda', 'Father', '+91 98765 10155', 'Flat 544, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2011-01-05', 'B+', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-8a-13', NULL, 'SCH-8A-13', 'Aryan Verma', 'aryan.verma@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43156', 'Private / Walker', 'Harish Verma', 'Father', '+91 98765 10156', 'Flat 581, Hiranandani Glen Gate, Hebbal, Bengaluru', 60000.00, '2024-06-07', '2011-04-10', 'O+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-8a-14', NULL, 'SCH-8A-14', 'Charu Kumar', 'charu.kumar@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43157', 'Bus Route 01 (Koramangala)', 'Praveen Kumar', 'Father', '+91 98765 10157', 'Flat 618, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 25000.00, '2024-06-09', '2011-07-15', 'AB+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-8a-15', NULL, 'SCH-8A-15', 'Harsh Malhotra', 'harsh.malhotra@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43158', 'Bus Route 02 (Indiranagar)', 'Suresh Malhotra', 'Father', '+91 98765 10158', 'Flat 655, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2011-10-20', 'A-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-8a-16', NULL, 'SCH-8A-16', 'Gauri Shetty', 'gauri.shetty@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43159', 'Bus Route 03 (Jayanagar)', 'Sunil Shetty', 'Mother', '+91 98765 10159', 'Flat 692, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2011-01-25', 'B-', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-8a-17', NULL, 'SCH-8A-17', 'Kunwar Khanna', 'kunwar.khanna@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43160', 'Bus Route 04 (North City)', 'Mahaveer Khanna', 'Father', '+91 98765 10160', 'Flat 729, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-15', '2011-04-02', 'O-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-8a-18', NULL, 'SCH-8A-18', 'Khushi Krishnan', 'khushi.krishnan@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43161', 'Bus Route 05 (Malleshwaram)', 'Gopal Krishnan', 'Father', '+91 98765 10161', 'Flat 766, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2011-07-07', 'A+', 'Consistent academic performer with strong conceptual clarity.'),
('s-8a-19', NULL, 'SCH-8A-19', 'Naveen Reddy', 'naveen.reddy@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43162', 'Bus Route 06 (Whitefield)', 'Anil Reddy', 'Father', '+91 98765 10162', 'Flat 803, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2011-10-12', 'B+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-8a-20', NULL, 'SCH-8A-20', 'Mitali Bhatia', 'mitali.bhatia@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43163', 'Private / Walker', 'Vikram Bhatia', 'Father', '+91 98765 10163', 'Flat 840, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2011-01-17', 'O+', 'Exemplary leadership skills, serves as student representative.'),
('s-8a-21', NULL, 'SCH-8A-21', 'Prateek Chatterjee', 'prateek.chatterjee@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43164', 'Bus Route 01 (Koramangala)', 'Alok Chatterjee', 'Father', '+91 98765 10164', 'Flat 877, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 25000.00, '2024-06-03', '2011-04-22', 'AB+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-8a-22', NULL, 'SCH-8A-22', 'Palak Banerjee', 'palak.banerjee@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43165', 'Bus Route 02 (Indiranagar)', 'Sanjay Banerjee', 'Father', '+91 98765 10165', 'Flat 914, Sobha Forest View, Kanakapura Road, Bengaluru', 45000.00, '2024-06-05', '2011-07-27', 'A-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-8a-23', NULL, 'SCH-8A-23', 'Rudra Mittal', 'rudra.mittal@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43166', 'Bus Route 03 (Jayanagar)', 'Harish Mittal', 'Father', '+91 98765 10166', 'Flat 951, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2011-10-04', 'B-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-8a-24', NULL, 'SCH-8A-24', 'Riddhi Patil', 'riddhi.patil@demo.com', 'Female', 'Class 8-A', 'A', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43167', 'Bus Route 04 (North City)', 'Praveen Patil', 'Mother', '+91 98765 10167', 'Flat 988, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2011-01-09', 'O-', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-8a-25', NULL, 'SCH-8A-25', 'Siddharth Iyer', 'siddharth.iyer@demo.com', 'Male', 'Class 8-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43168', 'Bus Route 05 (Malleshwaram)', 'Suresh Iyer', 'Father', '+91 98765 10168', 'Flat 135, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2011-04-14', 'A+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-8b-01', NULL, 'SCH-8B-01', 'Vivaan Shetty', 'vivaan.shetty@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43169', 'Bus Route 02 (Indiranagar)', 'Kishore Shetty', 'Father', '+91 98765 10169', 'Flat 137, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-03', '2011-04-06', 'B+', 'Consistent academic performer with strong conceptual clarity.'),
('s-8b-02', NULL, 'SCH-8B-02', 'Aanya Khanna', 'aanya.khanna@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43170', 'Bus Route 03 (Jayanagar)', 'Santosh Khanna', 'Father', '+91 98765 10170', 'Flat 174, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2011-07-11', 'O+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-8b-03', NULL, 'SCH-8B-03', 'Amit Krishnan', 'amit.krishnan@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43171', 'Bus Route 04 (North City)', 'Ramesh Krishnan', 'Father', '+91 98765 10171', 'Flat 211, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2011-10-16', 'AB+', 'Exemplary leadership skills, serves as student representative.'),
('s-8b-04', NULL, 'SCH-8B-04', 'Anika Reddy', 'anika.reddy@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43172', 'Bus Route 05 (Malleshwaram)', 'Deepak Reddy', 'Father', '+91 98765 10172', 'Flat 248, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2011-01-21', 'A-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-8b-05', NULL, 'SCH-8B-05', 'Ayush Bhatia', 'ayush.bhatia@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43173', 'Bus Route 06 (Whitefield)', 'Venkat Bhatia', 'Father', '+91 98765 10173', 'Flat 285, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2011-04-26', 'B-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-8b-06', NULL, 'SCH-8B-06', 'Deepika Chatterjee', 'deepika.chatterjee@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43174', 'Private / Walker', 'Pranab Chatterjee', 'Father', '+91 98765 10174', 'Flat 322, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2011-07-03', 'O-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-8b-07', NULL, 'SCH-8B-07', 'Ishaan Banerjee', 'ishaan.banerjee@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43175', 'Bus Route 01 (Koramangala)', 'Manoj Banerjee', 'Father', '+91 98765 10175', 'Flat 359, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 25000.00, '2024-06-15', '2011-10-08', 'A+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-8b-08', NULL, 'SCH-8B-08', 'Gayatri Mittal', 'gayatri.mittal@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43176', 'Bus Route 02 (Indiranagar)', 'Rajeev Mittal', 'Mother', '+91 98765 10176', 'Flat 396, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2011-01-13', 'B+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-8b-09', NULL, 'SCH-8B-09', 'Madhav Patil', 'madhav.patil@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43177', 'Bus Route 03 (Jayanagar)', 'Dinesh Patil', 'Father', '+91 98765 10177', 'Flat 433, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2011-04-18', 'O+', 'Consistent academic performer with strong conceptual clarity.'),
('s-8b-10', NULL, 'SCH-8B-10', 'Kritika Iyer', 'kritika.iyer@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43178', 'Bus Route 04 (North City)', 'Mukesh Iyer', 'Father', '+91 98765 10178', 'Flat 470, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2011-07-23', 'AB+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-8b-11', NULL, 'SCH-8B-11', 'Nikhil Mehta', 'nikhil.mehta@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43179', 'Bus Route 05 (Malleshwaram)', 'Kishore Mehta', 'Father', '+91 98765 10179', 'Flat 507, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 45000.00, '2024-06-03', '2011-10-28', 'A-', 'Exemplary leadership skills, serves as student representative.'),
('s-8b-12', NULL, 'SCH-8B-12', 'Navya Sen', 'navya.sen@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43180', 'Bus Route 06 (Whitefield)', 'Santosh Sen', 'Father', '+91 98765 10180', 'Flat 544, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2011-01-05', 'B-', 'Active in co-curriculars; regular homework revision is advised.'),
('s-8b-13', NULL, 'SCH-8B-13', 'Rahul Pandey', 'rahul.pandey@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43181', 'Private / Walker', 'Ramesh Pandey', 'Father', '+91 98765 10181', 'Flat 581, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 60000.00, '2024-06-07', '2011-04-10', 'O-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-8b-14', NULL, 'SCH-8B-14', 'Pooja Bansal', 'pooja.bansal@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43182', 'Bus Route 01 (Koramangala)', 'Deepak Bansal', 'Father', '+91 98765 10182', 'Flat 618, Godrej Woodsman Estate, Hebbal, Bengaluru', 25000.00, '2024-06-09', '2011-07-15', 'A+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-8b-15', NULL, 'SCH-8B-15', 'Sachin Sharma', 'sachin.sharma@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43183', 'Bus Route 02 (Indiranagar)', 'Venkat Sharma', 'Father', '+91 98765 10183', 'Flat 655, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2011-10-20', 'B+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-8b-16', NULL, 'SCH-8B-16', 'Riya Singh', 'riya.singh@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43184', 'Bus Route 03 (Jayanagar)', 'Pranab Singh', 'Mother', '+91 98765 10184', 'Flat 692, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2011-01-25', 'O+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-8b-17', NULL, 'SCH-8B-17', 'Sohan Chopra', 'sohan.chopra@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43185', 'Bus Route 04 (North City)', 'Manoj Chopra', 'Father', '+91 98765 10185', 'Flat 729, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-15', '2011-04-02', 'AB+', 'Consistent academic performer with strong conceptual clarity.'),
('s-8b-18', NULL, 'SCH-8B-18', 'Sara Pillai', 'sara.pillai@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43186', 'Bus Route 05 (Malleshwaram)', 'Rajeev Pillai', 'Father', '+91 98765 10186', 'Flat 766, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2011-07-07', 'A-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-8b-19', NULL, 'SCH-8B-19', 'Vedant Kapoor', 'vedant.kapoor@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43187', 'Bus Route 06 (Whitefield)', 'Dinesh Kapoor', 'Father', '+91 98765 10187', 'Flat 803, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2011-10-12', 'B-', 'Exemplary leadership skills, serves as student representative.'),
('s-8b-20', NULL, 'SCH-8B-20', 'Suhani Srinivasan', 'suhani.srinivasan@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43188', 'Private / Walker', 'Mukesh Srinivasan', 'Father', '+91 98765 10188', 'Flat 840, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2011-01-17', 'O-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-8b-21', NULL, 'SCH-8B-21', 'Vivaan Patel', 'vivaan.patel@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43189', 'Bus Route 01 (Koramangala)', 'Kishore Patel', 'Father', '+91 98765 10189', 'Flat 877, Palm Residency, Indiranagar, Bengaluru', 25000.00, '2024-06-03', '2011-04-22', 'A+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-8b-22', NULL, 'SCH-8B-22', 'Aanya Joshi', 'aanya.joshi@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43190', 'Bus Route 02 (Indiranagar)', 'Santosh Joshi', 'Father', '+91 98765 10190', 'Flat 914, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 45000.00, '2024-06-05', '2011-07-27', 'B+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-8b-23', NULL, 'SCH-8B-23', 'Amit Rao', 'amit.rao@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43191', 'Bus Route 03 (Jayanagar)', 'Ramesh Rao', 'Father', '+91 98765 10191', 'Flat 951, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-07', '2011-10-04', 'O+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-8b-24', NULL, 'SCH-8B-24', 'Anika Hegde', 'anika.hegde@demo.com', 'Female', 'Class 8-B', 'B', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43192', 'Bus Route 04 (North City)', 'Deepak Hegde', 'Mother', '+91 98765 10192', 'Flat 988, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-09', '2011-01-09', 'AB+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-8b-25', NULL, 'SCH-8B-25', 'Ayush Aggarwal', 'ayush.aggarwal@demo.com', 'Male', 'Class 8-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43193', 'Bus Route 05 (Malleshwaram)', 'Venkat Aggarwal', 'Father', '+91 98765 10193', 'Flat 135, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2011-04-14', 'A-', 'Consistent academic performer with strong conceptual clarity.'),
('s-9a-01', NULL, 'SCH-9A-01', 'Manish Singh', 'manish.singh@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43194', 'Bus Route 02 (Indiranagar)', 'Sunil Singh', 'Father', '+91 98765 10194', 'Flat 137, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-03', '2010-04-06', 'B-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-9a-02', NULL, 'SCH-9A-02', 'Lavanya Chopra', 'lavanya.chopra@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43195', 'Bus Route 03 (Jayanagar)', 'Mahaveer Chopra', 'Father', '+91 98765 10195', 'Flat 174, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2010-07-11', 'O-', 'Exemplary leadership skills, serves as student representative.'),
('s-9a-03', NULL, 'SCH-9A-03', 'Omkar Pillai', 'omkar.pillai@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43196', 'Bus Route 04 (North City)', 'Gopal Pillai', 'Father', '+91 98765 10196', 'Flat 211, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2010-10-16', 'A+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-9a-04', NULL, 'SCH-9A-04', 'Neha Kapoor', 'neha.kapoor@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43197', 'Bus Route 05 (Malleshwaram)', 'Anil Kapoor', 'Father', '+91 98765 10197', 'Flat 248, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2010-01-21', 'B+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-9a-05', NULL, 'SCH-9A-05', 'Rajat Srinivasan', 'rajat.srinivasan@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43198', 'Bus Route 06 (Whitefield)', 'Vikram Srinivasan', 'Father', '+91 98765 10198', 'Flat 285, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2010-04-26', 'O+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-9a-06', NULL, 'SCH-9A-06', 'Prachi Patel', 'prachi.patel@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43199', 'Private / Walker', 'Alok Patel', 'Father', '+91 98765 10199', 'Flat 322, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2010-07-03', 'AB+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-9a-07', NULL, 'SCH-9A-07', 'Sahil Joshi', 'sahil.joshi@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43200', 'Bus Route 01 (Koramangala)', 'Sanjay Joshi', 'Father', '+91 98765 10200', 'Flat 359, Purva Venezia, Yelahanka, Bengaluru', 25000.00, '2024-06-15', '2010-10-08', 'A-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-9a-08', NULL, 'SCH-9A-08', 'Roshni Rao', 'roshni.rao@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43201', 'Bus Route 02 (Indiranagar)', 'Harish Rao', 'Mother', '+91 98765 10201', 'Flat 396, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2010-01-13', 'B-', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-9a-09', NULL, 'SCH-9A-09', 'Sparsh Hegde', 'sparsh.hegde@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43202', 'Bus Route 03 (Jayanagar)', 'Praveen Hegde', 'Father', '+91 98765 10202', 'Flat 433, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2010-04-18', 'O-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-9a-10', NULL, 'SCH-9A-10', 'Shreya Aggarwal', 'shreya.aggarwal@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43203', 'Bus Route 04 (North City)', 'Suresh Aggarwal', 'Father', '+91 98765 10203', 'Flat 470, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2010-07-23', 'A+', 'Exemplary leadership skills, serves as student representative.'),
('s-9a-11', NULL, 'SCH-9A-11', 'Vihaan Nambiar', 'vihaan.nambiar@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43204', 'Bus Route 05 (Malleshwaram)', 'Sunil Nambiar', 'Father', '+91 98765 10204', 'Flat 507, Palm Residency, Indiranagar, Bengaluru', 45000.00, '2024-06-03', '2010-10-28', 'B+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-9a-12', NULL, 'SCH-9A-12', 'Tanvi Nair', 'tanvi.nair@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43205', 'Bus Route 06 (Whitefield)', 'Mahaveer Nair', 'Father', '+91 98765 10205', 'Flat 544, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-05', '2010-01-05', 'O+', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-9a-13', NULL, 'SCH-9A-13', 'Yash Deshmukh', 'yash.deshmukh@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43206', 'Private / Walker', 'Gopal Deshmukh', 'Father', '+91 98765 10206', 'Flat 581, Shantiniketan Apartments, Whitefield, Bengaluru', 60000.00, '2024-06-07', '2010-04-10', 'AB+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-9a-14', NULL, 'SCH-9A-14', 'Aditi Das', 'aditi.das@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43207', 'Bus Route 01 (Koramangala)', 'Anil Das', 'Father', '+91 98765 10207', 'Flat 618, Ferns Habitat, Marathahalli, Bengaluru', 25000.00, '2024-06-09', '2010-07-15', 'A-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-9a-15', NULL, 'SCH-9A-15', 'Anand Mishra', 'anand.mishra@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43208', 'Bus Route 02 (Indiranagar)', 'Vikram Mishra', 'Father', '+91 98765 10208', 'Flat 655, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2010-10-20', 'B-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-9a-16', NULL, 'SCH-9A-16', 'Ankita Jain', 'ankita.jain@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43209', 'Bus Route 03 (Jayanagar)', 'Alok Jain', 'Mother', '+91 98765 10209', 'Flat 692, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2010-01-25', 'O-', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-9a-17', NULL, 'SCH-9A-17', 'Chetan Shinde', 'chetan.shinde@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43210', 'Bus Route 04 (North City)', 'Sanjay Shinde', 'Father', '+91 98765 10210', 'Flat 729, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-15', '2010-04-02', 'A+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-9a-18', NULL, 'SCH-9A-18', 'Dia Gupta', 'dia.gupta@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43211', 'Bus Route 05 (Malleshwaram)', 'Harish Gupta', 'Father', '+91 98765 10211', 'Flat 766, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2010-07-07', 'B+', 'Exemplary leadership skills, serves as student representative.'),
('s-9a-19', NULL, 'SCH-9A-19', 'Kabir Kulkarni', 'kabir.kulkarni@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43212', 'Bus Route 06 (Whitefield)', 'Praveen Kulkarni', 'Father', '+91 98765 10212', 'Flat 803, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2010-10-12', 'O+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-9a-20', NULL, 'SCH-9A-20', 'Isha Menon', 'isha.menon@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43213', 'Private / Walker', 'Suresh Menon', 'Father', '+91 98765 10213', 'Flat 840, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2010-01-17', 'AB+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-9a-21', NULL, 'SCH-9A-21', 'Manish Saxena', 'manish.saxena@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43214', 'Bus Route 01 (Koramangala)', 'Sunil Saxena', 'Father', '+91 98765 10214', 'Flat 877, Mantri Espana, Bellandur, Bengaluru', 25000.00, '2024-06-03', '2010-04-22', 'A-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-9a-22', NULL, 'SCH-9A-22', 'Lavanya Gowda', 'lavanya.gowda@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43215', 'Bus Route 02 (Indiranagar)', 'Mahaveer Gowda', 'Father', '+91 98765 10215', 'Flat 914, Purva Venezia, Yelahanka, Bengaluru', 45000.00, '2024-06-05', '2010-07-27', 'B-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-9a-23', NULL, 'SCH-9A-23', 'Omkar Verma', 'omkar.verma@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43216', 'Bus Route 03 (Jayanagar)', 'Gopal Verma', 'Father', '+91 98765 10216', 'Flat 951, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2010-10-04', 'O-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-9a-24', NULL, 'SCH-9A-24', 'Neha Kumar', 'neha.kumar@demo.com', 'Female', 'Class 9-A', 'A', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43217', 'Bus Route 04 (North City)', 'Anil Kumar', 'Mother', '+91 98765 10217', 'Flat 988, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2010-01-09', 'A+', 'Good grasp of fundamentals; recommended to focus on lab observations.'),
('s-9a-25', NULL, 'SCH-9A-25', 'Rajat Malhotra', 'rajat.malhotra@demo.com', 'Male', 'Class 9-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43218', 'Bus Route 05 (Malleshwaram)', 'Vikram Malhotra', 'Father', '+91 98765 10218', 'Flat 135, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2010-04-14', 'B+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-9b-01', NULL, 'SCH-9B-01', 'Tanmay Jain', 'tanmay.jain@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43219', 'Bus Route 02 (Indiranagar)', 'Pranab Jain', 'Father', '+91 98765 10219', 'Flat 137, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-03', '2010-04-06', 'O+', 'Exemplary leadership skills, serves as student representative.'),
('s-9b-02', NULL, 'SCH-9B-02', 'Shruti Shinde', 'shruti.shinde@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43220', 'Bus Route 03 (Jayanagar)', 'Manoj Shinde', 'Father', '+91 98765 10220', 'Flat 174, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-05', '2010-07-11', 'AB+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-9b-03', NULL, 'SCH-9B-03', 'Vijay Gupta', 'vijay.gupta@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43221', 'Bus Route 04 (North City)', 'Rajeev Gupta', 'Father', '+91 98765 10221', 'Flat 211, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-07', '2010-10-16', 'A-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-9b-04', NULL, 'SCH-9B-04', 'Tara Kulkarni', 'tara.kulkarni@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43222', 'Bus Route 05 (Malleshwaram)', 'Dinesh Kulkarni', 'Father', '+91 98765 10222', 'Flat 248, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-09', '2010-01-21', 'B-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-9b-05', NULL, 'SCH-9B-05', 'Aarav Menon', 'aarav.menon@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43223', 'Bus Route 06 (Whitefield)', 'Mukesh Menon', 'Father', '+91 98765 10223', 'Flat 285, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2010-04-26', 'O-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-9b-06', NULL, 'SCH-9B-06', 'Akshara Saxena', 'akshara.saxena@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43224', 'Private / Walker', 'Kishore Saxena', 'Father', '+91 98765 10224', 'Flat 322, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2010-07-03', 'A+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-9b-07', NULL, 'SCH-9B-07', 'Aniket Gowda', 'aniket.gowda@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43225', 'Bus Route 01 (Koramangala)', 'Santosh Gowda', 'Father', '+91 98765 10225', 'Flat 359, Sobha Forest View, Kanakapura Road, Bengaluru', 25000.00, '2024-06-15', '2010-10-08', 'B+', 'Consistent academic performer with strong conceptual clarity.'),
('s-9b-08', NULL, 'SCH-9B-08', 'Anushka Verma', 'anushka.verma@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43226', 'Bus Route 02 (Indiranagar)', 'Ramesh Verma', 'Mother', '+91 98765 10226', 'Flat 396, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2010-01-13', 'O+', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-9b-09', NULL, 'SCH-9B-09', 'Dev Kumar', 'dev.kumar@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43227', 'Bus Route 03 (Jayanagar)', 'Deepak Kumar', 'Father', '+91 98765 10227', 'Flat 433, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2010-04-18', 'AB+', 'Exemplary leadership skills, serves as student representative.'),
('s-9b-10', NULL, 'SCH-9B-10', 'Divya Malhotra', 'divya.malhotra@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43228', 'Bus Route 04 (North City)', 'Venkat Malhotra', 'Father', '+91 98765 10228', 'Flat 470, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2010-07-23', 'A-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-9b-11', NULL, 'SCH-9B-11', 'Karan Shetty', 'karan.shetty@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43229', 'Bus Route 05 (Malleshwaram)', 'Pranab Shetty', 'Father', '+91 98765 10229', 'Flat 507, Mantri Espana, Bellandur, Bengaluru', 45000.00, '2024-06-03', '2010-10-28', 'B-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-9b-12', NULL, 'SCH-9B-12', 'Ishani Khanna', 'ishani.khanna@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43230', 'Bus Route 06 (Whitefield)', 'Manoj Khanna', 'Father', '+91 98765 10230', 'Flat 544, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2010-01-05', 'O-', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-9b-13', NULL, 'SCH-9B-13', 'Mayank Krishnan', 'mayank.krishnan@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43231', 'Private / Walker', 'Rajeev Krishnan', 'Father', '+91 98765 10231', 'Flat 581, Hiranandani Glen Gate, Hebbal, Bengaluru', 60000.00, '2024-06-07', '2010-04-10', 'A+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-9b-14', NULL, 'SCH-9B-14', 'Mahika Reddy', 'mahika.reddy@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43232', 'Bus Route 01 (Koramangala)', 'Dinesh Reddy', 'Father', '+91 98765 10232', 'Flat 618, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 25000.00, '2024-06-09', '2010-07-15', 'B+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-9b-15', NULL, 'SCH-9B-15', 'Parth Bhatia', 'parth.bhatia@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43233', 'Bus Route 02 (Indiranagar)', 'Mukesh Bhatia', 'Father', '+91 98765 10233', 'Flat 655, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2010-10-20', 'O+', 'Consistent academic performer with strong conceptual clarity.'),
('s-9b-16', NULL, 'SCH-9B-16', 'Niharika Chatterjee', 'niharika.chatterjee@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43234', 'Bus Route 03 (Jayanagar)', 'Kishore Chatterjee', 'Mother', '+91 98765 10234', 'Flat 692, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2010-01-25', 'AB+', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-9b-17', NULL, 'SCH-9B-17', 'Rajesh Banerjee', 'rajesh.banerjee@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43235', 'Bus Route 04 (North City)', 'Santosh Banerjee', 'Father', '+91 98765 10235', 'Flat 729, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-15', '2010-04-02', 'A-', 'Exemplary leadership skills, serves as student representative.'),
('s-9b-18', NULL, 'SCH-9B-18', 'Priya Mittal', 'priya.mittal@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43236', 'Bus Route 05 (Malleshwaram)', 'Ramesh Mittal', 'Father', '+91 98765 10236', 'Flat 766, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2010-07-07', 'B-', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-9b-19', NULL, 'SCH-9B-19', 'Samar Patil', 'samar.patil@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43237', 'Bus Route 06 (Whitefield)', 'Deepak Patil', 'Father', '+91 98765 10237', 'Flat 803, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2010-10-12', 'O-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-9b-20', NULL, 'SCH-9B-20', 'Saanvi Iyer', 'saanvi.iyer@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43238', 'Private / Walker', 'Venkat Iyer', 'Father', '+91 98765 10238', 'Flat 840, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2010-01-17', 'A+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-9b-21', NULL, 'SCH-9B-21', 'Tanmay Mehta', 'tanmay.mehta@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43239', 'Bus Route 01 (Koramangala)', 'Pranab Mehta', 'Father', '+91 98765 10239', 'Flat 877, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 25000.00, '2024-06-03', '2010-04-22', 'B+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-9b-22', NULL, 'SCH-9B-22', 'Shruti Sen', 'shruti.sen@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43240', 'Bus Route 02 (Indiranagar)', 'Manoj Sen', 'Father', '+91 98765 10240', 'Flat 914, Sobha Forest View, Kanakapura Road, Bengaluru', 45000.00, '2024-06-05', '2010-07-27', 'O+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-9b-23', NULL, 'SCH-9B-23', 'Vijay Pandey', 'vijay.pandey@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43241', 'Bus Route 03 (Jayanagar)', 'Rajeev Pandey', 'Father', '+91 98765 10241', 'Flat 951, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2010-10-04', 'AB+', 'Consistent academic performer with strong conceptual clarity.'),
('s-9b-24', NULL, 'SCH-9B-24', 'Tara Bansal', 'tara.bansal@demo.com', 'Female', 'Class 9-B', 'B', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43242', 'Bus Route 04 (North City)', 'Dinesh Bansal', 'Mother', '+91 98765 10242', 'Flat 988, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2010-01-09', 'A-', 'Steady progress in exams; encouraged to participate more in classroom discussions.'),
('s-9b-25', NULL, 'SCH-9B-25', 'Aarav Sharma', 'aarav.sharma@demo.com', 'Male', 'Class 9-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43243', 'Bus Route 05 (Malleshwaram)', 'Mukesh Sharma', 'Father', '+91 98765 10243', 'Flat 135, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2010-04-14', 'B-', 'Exemplary leadership skills, serves as student representative.'),
('s-10a-01', NULL, 'SCH-10A-01', 'Kavita Das', 'kavita.das@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 88, 58, 66, 'A1', 89.6, '+91 98765 43208', 'Bus Route 06 (Whitefield)', 'Pranab Das', 'Father', '+91 98765 00008', '404, Whitefield Main Road, Bengaluru', 20000.00, '2024-06-14', '2009-02-03', 'O+', 'Excellent leadership in School Prefect Council and Science Olympiad.'),
('s-10a-02', NULL, 'SCH-10A-02', 'Diya Banerjee', 'diya.banerjee@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43244', 'Bus Route 03 (Jayanagar)', 'Sanjay Banerjee', 'Father', '+91 98765 10244', 'Flat 174, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-05', '2009-07-11', 'A+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-10a-03', NULL, 'SCH-10A-03', 'Kartik Mittal', 'kartik.mittal@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43245', 'Bus Route 04 (North City)', 'Harish Mittal', 'Father', '+91 98765 10245', 'Flat 211, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2009-10-16', 'B+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-10a-04', NULL, 'SCH-10A-04', 'Jhanvi Patil', 'jhanvi.patil@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43246', 'Bus Route 05 (Malleshwaram)', 'Praveen Patil', 'Father', '+91 98765 10246', 'Flat 248, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2009-01-21', 'O+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-10a-05', NULL, 'SCH-10A-05', 'Mihir Iyer', 'mihir.iyer@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43247', 'Bus Route 06 (Whitefield)', 'Suresh Iyer', 'Father', '+91 98765 10247', 'Flat 285, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2009-04-26', 'AB+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-10a-06', NULL, 'SCH-10A-06', 'Manvi Mehta', 'manvi.mehta@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43248', 'Private / Walker', 'Sunil Mehta', 'Father', '+91 98765 10248', 'Flat 322, Palm Residency, Indiranagar, Bengaluru', 0.00, '2024-06-13', '2009-07-03', 'A-', 'Consistent academic performer with strong conceptual clarity.'),
('s-10a-07', NULL, 'SCH-10A-07', 'Pranav Sen', 'pranav.sen@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43249', 'Bus Route 01 (Koramangala)', 'Mahaveer Sen', 'Father', '+91 98765 10249', 'Flat 359, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 25000.00, '2024-06-15', '2009-10-08', 'B-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-10a-08', NULL, 'SCH-10A-08', 'Nikita Pandey', 'nikita.pandey@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43250', 'Bus Route 02 (Indiranagar)', 'Gopal Pandey', 'Mother', '+91 98765 10250', 'Flat 396, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-17', '2009-01-13', 'O-', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-10a-09', NULL, 'SCH-10A-09', 'Rohan Bansal', 'rohan.bansal@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43251', 'Bus Route 03 (Jayanagar)', 'Anil Bansal', 'Father', '+91 98765 10251', 'Flat 433, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-19', '2009-04-18', 'A+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-10a-10', NULL, 'SCH-10A-10', 'Rachana Sharma', 'rachana.sharma@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43252', 'Bus Route 04 (North City)', 'Vikram Sharma', 'Father', '+91 98765 10252', 'Flat 470, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-01', '2009-07-23', 'B+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-10a-11', NULL, 'SCH-10A-11', 'Sameer Singh', 'sameer.singh@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43253', 'Bus Route 05 (Malleshwaram)', 'Alok Singh', 'Father', '+91 98765 10253', 'Flat 507, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 45000.00, '2024-06-03', '2009-10-28', 'O+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-10a-12', NULL, 'SCH-10A-12', 'Sakshi Chopra', 'sakshi.chopra@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43254', 'Bus Route 06 (Whitefield)', 'Sanjay Chopra', 'Father', '+91 98765 10254', 'Flat 544, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2009-01-05', 'AB+', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-10a-13', NULL, 'SCH-10A-13', 'Tarun Pillai', 'tarun.pillai@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43255', 'Private / Walker', 'Harish Pillai', 'Father', '+91 98765 10255', 'Flat 581, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 60000.00, '2024-06-07', '2009-04-10', 'A-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-10a-14', NULL, 'SCH-10A-14', 'Simran Kapoor', 'simran.kapoor@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43256', 'Bus Route 01 (Koramangala)', 'Praveen Kapoor', 'Father', '+91 98765 10256', 'Flat 618, Godrej Woodsman Estate, Hebbal, Bengaluru', 25000.00, '2024-06-09', '2009-07-15', 'B-', 'Consistent academic performer with strong conceptual clarity.'),
('s-10a-15', NULL, 'SCH-10A-15', 'Vikas Srinivasan', 'vikas.srinivasan@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43257', 'Bus Route 02 (Indiranagar)', 'Suresh Srinivasan', 'Father', '+91 98765 10257', 'Flat 655, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2009-10-20', 'O-', 'Active participation in science exhibitions and mathematics clubs.'),
('s-10a-16', NULL, 'SCH-10A-16', 'Trisha Patel', 'trisha.patel@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43258', 'Bus Route 03 (Jayanagar)', 'Sunil Patel', 'Mother', '+91 98765 10258', 'Flat 692, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2009-01-25', 'A+', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-10a-17', NULL, 'SCH-10A-17', 'Aditya Joshi', 'aditya.joshi@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43259', 'Bus Route 04 (North City)', 'Mahaveer Joshi', 'Father', '+91 98765 10259', 'Flat 729, Purva Venezia, Yelahanka, Bengaluru', 0.00, '2024-06-15', '2009-04-02', 'B+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-10a-18', NULL, 'SCH-10A-18', 'Alia Rao', 'alia.rao@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43260', 'Bus Route 05 (Malleshwaram)', 'Gopal Rao', 'Father', '+91 98765 10260', 'Flat 766, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2009-07-07', 'O+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-10a-19', NULL, 'SCH-10A-19', 'Anirudh Hegde', 'anirudh.hegde@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43261', 'Bus Route 06 (Whitefield)', 'Anil Hegde', 'Father', '+91 98765 10261', 'Flat 803, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2009-10-12', 'AB+', 'Creative thinker with outstanding fluency in communicative English.'),
('s-10a-20', NULL, 'SCH-10A-20', 'Avani Aggarwal', 'avani.aggarwal@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43262', 'Private / Walker', 'Vikram Aggarwal', 'Father', '+91 98765 10262', 'Flat 840, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2009-01-17', 'A-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-10a-21', NULL, 'SCH-10A-21', 'Dhruv Nambiar', 'dhruv.nambiar@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43263', 'Bus Route 01 (Koramangala)', 'Alok Nambiar', 'Father', '+91 98765 10263', 'Flat 877, Palm Residency, Indiranagar, Bengaluru', 25000.00, '2024-06-03', '2009-04-22', 'B-', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-10a-22', NULL, 'SCH-10A-22', 'Diya Nair', 'diya.nair@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43264', 'Bus Route 02 (Indiranagar)', 'Sanjay Nair', 'Father', '+91 98765 10264', 'Flat 914, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 45000.00, '2024-06-05', '2009-07-27', 'O-', 'Consistent academic performer with strong conceptual clarity.'),
('s-10a-23', NULL, 'SCH-10A-23', 'Kartik Deshmukh', 'kartik.deshmukh@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43265', 'Bus Route 03 (Jayanagar)', 'Harish Deshmukh', 'Father', '+91 98765 10265', 'Flat 951, Shantiniketan Apartments, Whitefield, Bengaluru', 0.00, '2024-06-07', '2009-10-04', 'A+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-10a-24', NULL, 'SCH-10A-24', 'Jhanvi Das', 'jhanvi.das@demo.com', 'Female', 'Class 10-A', 'A', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43266', 'Bus Route 04 (North City)', 'Praveen Das', 'Mother', '+91 98765 10266', 'Flat 988, Ferns Habitat, Marathahalli, Bengaluru', 0.00, '2024-06-09', '2009-01-09', 'B+', 'Diligent student; needs slight guidance in step-by-step math problem solving.'),
('s-10a-25', NULL, 'SCH-10A-25', 'Mihir Mishra', 'mihir.mishra@demo.com', 'Male', 'Class 10-A', 'A', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43267', 'Bus Route 05 (Malleshwaram)', 'Suresh Mishra', 'Father', '+91 98765 10267', 'Flat 135, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2009-04-14', 'O+', 'Demonstrates sharp problem-solving ability in analytical subjects.'),
('s-10b-01', NULL, 'SCH-10B-01', 'Rohit Patel', 'rohit.patel@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 79, 52, 66, 'A2', 82.9, '+91 98765 43268', 'Bus Route 02 (Indiranagar)', 'Kishore Patel', 'Father', '+91 98765 10268', 'Flat 137, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-03', '2009-04-06', 'AB+', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-10b-02', NULL, 'SCH-10B-02', 'Rhea Joshi', 'rhea.joshi@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 83.8, '+91 98765 43269', 'Bus Route 03 (Jayanagar)', 'Santosh Joshi', 'Father', '+91 98765 10269', 'Flat 174, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-05', '2009-07-11', 'A-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-10b-03', NULL, 'SCH-10B-03', 'Samarth Rao', 'samarth.rao@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 84.7, '+91 98765 43270', 'Bus Route 04 (North City)', 'Ramesh Rao', 'Father', '+91 98765 10270', 'Flat 211, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-07', '2009-10-16', 'B-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-10b-04', NULL, 'SCH-10B-04', 'Samaira Hegde', 'samaira.hegde@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 72.4, 48, 66, 'B2', 62, '+91 98765 43271', 'Bus Route 05 (Malleshwaram)', 'Deepak Hegde', 'Father', '+91 98765 10271', 'Flat 248, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-09', '2009-01-21', 'O-', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-10b-05', NULL, 'SCH-10B-05', 'Utkarsh Aggarwal', 'utkarsh.aggarwal@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 96.5, '+91 98765 43272', 'Bus Route 06 (Whitefield)', 'Venkat Aggarwal', 'Father', '+91 98765 10272', 'Flat 285, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-11', '2009-04-26', 'A+', 'Consistent academic performer with strong conceptual clarity.'),
('s-10b-06', NULL, 'SCH-10B-06', 'Sneha Nambiar', 'sneha.nambiar@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 84.3, 56, 66, 'A2', 87.4, '+91 98765 43273', 'Private / Walker', 'Pranab Nambiar', 'Father', '+91 98765 10273', 'Flat 322, Mantri Espana, Bellandur, Bengaluru', 0.00, '2024-06-13', '2009-07-03', 'B+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-10b-07', NULL, 'SCH-10B-07', 'Vikram Nair', 'vikram.nair@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 85.3, 56, 66, 'A2', 88.3, '+91 98765 43274', 'Bus Route 01 (Koramangala)', 'Manoj Nair', 'Father', '+91 98765 10274', 'Flat 359, Purva Venezia, Yelahanka, Bengaluru', 25000.00, '2024-06-15', '2009-10-08', 'O+', 'Exemplary leadership skills, serves as student representative.'),
('s-10b-08', NULL, 'SCH-10B-08', 'Vanya Deshmukh', 'vanya.deshmukh@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 86.4, 57, 66, 'B1', 75.8, '+91 98765 43275', 'Bus Route 02 (Indiranagar)', 'Rajeev Deshmukh', 'Mother', '+91 98765 10275', 'Flat 396, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-17', '2009-01-13', 'AB+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-10b-09', NULL, 'SCH-10B-09', 'Advait Das', 'advait.das@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 87.5, 58, 66, 'A2', 82.9, '+91 98765 43276', 'Bus Route 03 (Jayanagar)', 'Dinesh Das', 'Father', '+91 98765 10276', 'Flat 433, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-19', '2009-04-18', 'A-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-10b-10', NULL, 'SCH-10B-10', 'Amrita Mishra', 'amrita.mishra@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 88.5, 58, 66, 'A1', 94.7, '+91 98765 43277', 'Bus Route 04 (North City)', 'Mukesh Mishra', 'Father', '+91 98765 10277', 'Flat 470, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-01', '2009-07-23', 'B-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-10b-11', NULL, 'SCH-10B-11', 'Arjun Jain', 'arjun.jain@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 89.5, 59, 66, 'A2', 84.7, '+91 98765 43278', 'Bus Route 05 (Malleshwaram)', 'Kishore Jain', 'Father', '+91 98765 10278', 'Flat 507, Palm Residency, Indiranagar, Bengaluru', 45000.00, '2024-06-03', '2009-10-28', 'O-', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-10b-12', NULL, 'SCH-10B-12', 'Bhavna Shinde', 'bhavna.shinde@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 90.6, 60, 66, 'B1', 74, '+91 98765 43279', 'Bus Route 06 (Whitefield)', 'Santosh Shinde', 'Father', '+91 98765 10279', 'Flat 544, Jubilee Enclave, Jayanagar 4th Block, Bengaluru', 0.00, '2024-06-05', '2009-01-05', 'A+', 'Active in co-curriculars; regular homework revision is advised.'),
('s-10b-13', NULL, 'SCH-10B-13', 'Gaurav Gupta', 'gaurav.gupta@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 69.1, 46, 66, 'C1', 59, '+91 98765 43280', 'Private / Walker', 'Ramesh Gupta', 'Father', '+91 98765 10280', 'Flat 581, Shantiniketan Apartments, Whitefield, Bengaluru', 60000.00, '2024-06-07', '2009-04-10', 'B+', 'Irregular in morning sessions; remedial support scheduled to cover backlogs.'),
('s-10b-14', NULL, 'SCH-10B-14', 'Esha Kulkarni', 'esha.kulkarni@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 92.7, 61, 66, 'A2', 87.4, '+91 98765 43281', 'Bus Route 01 (Koramangala)', 'Deepak Kulkarni', 'Father', '+91 98765 10281', 'Flat 618, Ferns Habitat, Marathahalli, Bengaluru', 25000.00, '2024-06-09', '2009-07-15', 'O+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-10b-15', NULL, 'SCH-10B-15', 'Krish Menon', 'krish.menon@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 93.8, 62, 66, 'A1', 92.9, '+91 98765 43282', 'Bus Route 02 (Indiranagar)', 'Venkat Menon', 'Father', '+91 98765 10282', 'Flat 655, Brigade Millennium, JP Nagar, Bengaluru', 0.00, '2024-06-11', '2009-10-20', 'AB+', 'Exemplary leadership skills, serves as student representative.'),
('s-10b-16', NULL, 'SCH-10B-16', 'Kavita Saxena', 'kavita.saxena@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 94.8, 63, 66, 'B1', 77.6, '+91 98765 43283', 'Bus Route 03 (Jayanagar)', 'Pranab Saxena', 'Mother', '+91 98765 10283', 'Flat 692, Prestige Tech Vista, Kadubeesanahalli, Bengaluru', 0.00, '2024-06-13', '2009-01-25', 'A-', 'Active in co-curriculars; regular homework revision is advised.'),
('s-10b-17', NULL, 'SCH-10B-17', 'Nakul Gowda', 'nakul.gowda@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 95.8, 63, 66, 'A2', 82.9, '+91 98765 43284', 'Bus Route 04 (North City)', 'Manoj Gowda', 'Father', '+91 98765 10284', 'Flat 729, Sobha Forest View, Kanakapura Road, Bengaluru', 0.00, '2024-06-15', '2009-04-02', 'B-', 'Courteous, punctual, and maintains high discipline in all sessions.'),
('s-10b-18', NULL, 'SCH-10B-18', 'Meera Verma', 'meera.verma@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 96.9, 64, 66, 'A2', 83.8, '+91 98765 43285', 'Bus Route 05 (Malleshwaram)', 'Rajeev Verma', 'Father', '+91 98765 10285', 'Flat 766, Assetz Marq, Whitefield-Hoskote Rd, Bengaluru', 0.00, '2024-06-17', '2009-07-07', 'O-', 'Creative thinker with outstanding fluency in communicative English.'),
('s-10b-19', NULL, 'SCH-10B-19', 'Praneeth Kumar', 'praneeth.kumar@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 98, 65, 66, 'A2', 84.7, '+91 98765 43286', 'Bus Route 06 (Whitefield)', 'Dinesh Kumar', 'Father', '+91 98765 10286', 'Flat 803, Godrej Woodsman Estate, Hebbal, Bengaluru', 0.00, '2024-06-19', '2009-10-12', 'A+', 'Dedicated sports enthusiast; balances athletics with academics well.'),
('s-10b-20', NULL, 'SCH-10B-20', 'Nisha Malhotra', 'nisha.malhotra@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 78, 51, 66, 'A1', 97.4, '+91 98765 43287', 'Private / Walker', 'Mukesh Malhotra', 'Father', '+91 98765 10287', 'Flat 840, Salarpuria Greenage, Hosur Road, Bengaluru', 0.00, '2024-06-01', '2009-01-17', 'B+', 'Keen interest in robotics, coding, and computer laboratory sessions.'),
('s-10b-21', NULL, 'SCH-10B-21', 'Rohit Shetty', 'rohit.shetty@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 79, 52, 66, 'A2', 86.5, '+91 98765 43288', 'Bus Route 01 (Koramangala)', 'Kishore Shetty', 'Father', '+91 98765 10288', 'Flat 877, Mantri Espana, Bellandur, Bengaluru', 25000.00, '2024-06-03', '2009-04-22', 'O+', 'Consistent academic performer with strong conceptual clarity.'),
('s-10b-22', NULL, 'SCH-10B-22', 'Rhea Khanna', 'rhea.khanna@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 80.1, 53, 66, 'A2', 87.4, '+91 98765 43289', 'Bus Route 02 (Indiranagar)', 'Santosh Khanna', 'Father', '+91 98765 10289', 'Flat 914, Purva Venezia, Yelahanka, Bengaluru', 45000.00, '2024-06-05', '2009-07-27', 'AB+', 'Active participation in science exhibitions and mathematics clubs.'),
('s-10b-23', NULL, 'SCH-10B-23', 'Samarth Krishnan', 'samarth.krishnan@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 81.2, 54, 66, 'A2', 88.3, '+91 98765 43290', 'Bus Route 03 (Jayanagar)', 'Ramesh Krishnan', 'Father', '+91 98765 10290', 'Flat 951, Hiranandani Glen Gate, Hebbal, Bengaluru', 0.00, '2024-06-07', '2009-10-04', 'A-', 'Exemplary leadership skills, serves as student representative.'),
('s-10b-24', NULL, 'SCH-10B-24', 'Samaira Reddy', 'samaira.reddy@demo.com', 'Female', 'Class 10-B', 'B', '2024-2025', 82.2, 54, 66, 'B1', 74, '+91 98765 43291', 'Bus Route 04 (North City)', 'Deepak Reddy', 'Mother', '+91 98765 10291', 'Flat 988, Adarsh Palm Retreat, Outer Ring Road, Bengaluru', 0.00, '2024-06-09', '2009-01-09', 'B-', 'Active in co-curriculars; regular homework revision is advised.'),
('s-10b-25', NULL, 'SCH-10B-25', 'Utkarsh Bhatia', 'utkarsh.bhatia@demo.com', 'Male', 'Class 10-B', 'B', '2024-2025', 83.3, 55, 66, 'A1', 95.6, '+91 98765 43292', 'Bus Route 05 (Malleshwaram)', 'Venkat Bhatia', 'Father', '+91 98765 10292', 'Flat 135, Green Meadows, Outer Ring Road, Bengaluru', 0.00, '2024-06-11', '2009-04-14', 'O-', 'Courteous, punctual, and maintains high discipline in all sessions.')
ON CONFLICT (id) DO UPDATE SET
    roll_number = EXCLUDED.roll_number,
    name = EXCLUDED.name,
    class_grade = EXCLUDED.class_grade,
    attendance_pct = EXCLUDED.attendance_pct,
    classes_present = EXCLUDED.classes_present,
    overall_grade = EXCLUDED.overall_grade,
    term_percentage = EXCLUDED.term_percentage,
    dues = EXCLUDED.dues,
    remarks = EXCLUDED.remarks;

-- Parent-Child Links
INSERT INTO parent_student_links (id, parent_user_id, student_roll, relation, is_primary) VALUES
('psl-1', 'u-5', 'SCH-8A-01', 'Father', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Faculty
INSERT INTO faculty (
    id, user_id, teacher_code, name, email, department, designation, assigned_classes, subjects_taught,
    is_class_teacher_of, cabin, phone, qualification, experience_years, status
) VALUES
('f-1', 'u-3', 'TCH-MAT-01', 'Prof. Vikram Singh', 'vikram.singh@demo.com', 'Mathematics & Computing', 'Senior Faculty & Class Teacher (8-A)', ARRAY['Class 8-A', 'Class 9-B', 'Class 10-A'], ARRAY['Mathematics', 'Applied Mathematics'], 'Class 8-A', 'Staff Room Block A — Desk 04', '+91 94481 11003', 'M.Sc. Mathematics, B.Ed (Gold Medalist)', 12, 'Active'),
('f-2', NULL,  'TCH-SCI-01', 'Dr. Priya Patel', 'priya.patel@demo.com', 'Science & Technology', 'Head of Science Department', ARRAY['Class 8-A', 'Class 7-A', 'Class 10-A'], ARRAY['General Science', 'Physics & Chemistry'], NULL, 'Science Lab Annex — Cabin 02', '+91 94481 11002', 'Ph.D. in Physics, B.Ed', 14, 'Active'),
('f-3', NULL,  'TCH-ENG-01', 'Mrs. Sunita Rao', 'sunita.rao@demo.com', 'Languages & Literature', 'Senior English Teacher & Class Teacher (7-A)', ARRAY['Class 6-B', 'Class 7-A', 'Class 8-A'], ARRAY['English Language', 'English Literature'], 'Class 7-A', 'Staff Room Block B — Desk 11', '+91 94481 11005', 'M.A. English Literature, B.Ed', 10, 'Active'),
('f-4', NULL,  'TCH-SST-01', 'Mr. Arjun Verma', 'arjun.verma@demo.com', 'Social Sciences', 'Social Studies & History Teacher', ARRAY['Class 8-A', 'Class 9-A', 'Class 10-A'], ARRAY['Social Science (History & Civics)', 'Geography'], NULL, 'Staff Room Block A — Desk 09', '+91 94481 11004', 'M.A. History, B.Ed', 8, 'Active')
ON CONFLICT (id) DO NOTHING;

-- 5. Courses
INSERT INTO courses (
    id, code, name, class_grade, department, periods_per_week, type,
    faculty_in_charge, faculty_id, enrolled_students_count, syllabus_chapters_count, chapters_completed
) VALUES
('c-1', 'MTH-801', 'Mathematics (Grade 8 Core)', 'Class 8-A', 'Mathematics & Statistics', 6, 'Core Academic', 'Prof. Vikram Singh', 'f-1', 32, 14, 5),
('c-2', 'SCI-801', 'Science — Physics, Chemistry & Biology', 'Class 8-A', 'Science & Technology', 6, 'Laboratory', 'Dr. Priya Patel', 'f-2', 32, 16, 6),
('c-3', 'ENG-801', 'English Language & Communicative Arts', 'Class 8-A', 'Languages & Humanities', 5, 'Core Academic', 'Mrs. Sunita Rao', 'f-3', 32, 12, 5),
('c-4', 'SST-801', 'Social Sciences — History, Civics & Geography', 'Class 8-A', 'Social Sciences & Humanities', 5, 'Core Academic', 'Mr. Arjun Verma', 'f-4', 32, 15, 4)
ON CONFLICT (id) DO NOTHING;

-- 6. Timetable Slots
INSERT INTO timetable (id, day_of_week, period, time, subject_code, subject_name, class_grade, room, teacher, faculty_id, type) VALUES
('tt-m1', 'Monday', 'Period 1 (08:30–09:15)', '08:30–09:15', 'MTH-801', 'Mathematics', 'Class 8-A', 'Room 201 (Class 8-A)', 'Prof. Vikram Singh', 'f-1', 'Theory'),
('tt-m2', 'Monday', 'Period 2 (09:15–10:00)', '09:15–10:00', 'SCI-801', 'Science (Physics/Chemistry)', 'Class 8-A', 'Junior Science Lab', 'Dr. Priya Patel', 'f-2', 'Lab / Practical'),
('tt-m3', 'Monday', 'Period 3 (10:15–11:00)', '10:15–11:00', 'ENG-801', 'English Literature', 'Class 8-A', 'Room 201 (Class 8-A)', 'Mrs. Sunita Rao', 'f-3', 'Theory'),
('tt-m4', 'Monday', 'Period 4 (11:00–11:45)', '11:00–11:45', 'SST-801', 'Social Studies (History)', 'Class 8-A', 'Room 201 (Class 8-A)', 'Mr. Arjun Verma', 'f-4', 'Theory'),
('tt-m5', 'Monday', 'Period 5 (12:30–01:15)', '12:30–01:15', 'MTH-801', 'Computer Applications', 'Class 8-A', 'Computer Lab 01', 'Prof. Vikram Singh', 'f-1', 'Lab / Practical'),
('tt-m6', 'Monday', 'Period 6 (01:15–02:00)', '01:15–02:00', 'ENG-801', 'Hindi / Second Language', 'Class 8-A', 'Room 201 (Class 8-A)', 'Mrs. Sunita Rao', 'f-3', 'Theory'),
('tt-m7', 'Monday', 'Period 7 (02:00–02:45)', '02:00–02:45', NULL,      'Physical Education & Games', 'Class 8-A', 'School Sports Ground', 'Coach Rajesh', NULL, 'Activity')
ON CONFLICT (id) DO NOTHING;

-- 7. Exams & Marks
INSERT INTO exams (id, name, term, class_grade, subject, exam_date, max_marks, conducted_by, faculty_id, status) VALUES
('ex-1', 'Term 1 Half-Yearly Examination 2024', 'Term 1', 'Class 8-A', 'Mathematics', '2024-09-18', 100, 'Prof. Vikram Singh', 'f-1', 'Published'),
('ex-2', 'Term 1 Half-Yearly Examination 2024', 'Term 1', 'Class 8-A', 'Science (Theory + Practical)', '2024-09-20', 100, 'Dr. Priya Patel', 'f-2', 'Published'),
('ex-3', 'Term 1 Half-Yearly Examination 2024', 'Term 1', 'Class 8-A', 'English Language & Lit', '2024-09-22', 100, 'Mrs. Sunita Rao', 'f-3', 'Published'),
('ex-4', 'Term 1 Half-Yearly Examination 2024', 'Term 1', 'Class 8-A', 'Social Studies (History & Geo)', '2024-09-24', 100, 'Mr. Arjun Verma', 'f-4', 'Published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_marks (id, exam_id, student_roll, marks_obtained, grade, remarks) VALUES
('em-1', 'ex-1', 'SCH-8A-01', 88.00, 'A1', 'Strong in algebra; review geometry proofs'),
('em-2', 'ex-2', 'SCH-8A-01', 82.00, 'A2', 'Good theory concepts; improve lab observation records'),
('em-3', 'ex-3', 'SCH-8A-01', 85.00, 'A2', 'Fluent comprehension and creative writing'),
('em-4', 'ex-4', 'SCH-8A-01', 83.00, 'A2', 'Good grasp of historical timelines')
ON CONFLICT (id) DO NOTHING;

-- 8. Fee Invoices
INSERT INTO invoices (id, invoice_number, student_roll, student_name, class_grade, amount, due_date, paid_date, status, fee_type) VALUES
('inv-1', 'INV-2024-001', 'SCH-8A-01', 'Rahul Sharma', 'Class 8-A', 25000.00, '2024-09-15', NULL, 'Pending', 'Term 1 Tuition Fee'),
('inv-2', 'INV-2024-002', 'SCH-8A-02', 'Sneha Patel', 'Class 8-A', 25000.00, '2024-09-15', '2024-09-02', 'Paid', 'Term 1 Tuition Fee'),
('inv-3', 'INV-2024-003', 'SCH-8A-03', 'Amit Kumar', 'Class 8-A', 45000.00, '2024-08-30', NULL, 'Overdue', 'School Bus & Transport'),
('inv-4', 'INV-2024-004', 'SCH-8A-04', 'Pooja Gupta', 'Class 8-A', 60000.00, '2024-08-30', NULL, 'Overdue', 'Term 1 Tuition Fee'),
('inv-5', 'INV-2024-005', 'SCH-8A-05', 'Rohit Jain', 'Class 8-A', 70000.00, '2024-08-20', NULL, 'Overdue', 'Term 1 Tuition Fee'),
('inv-6', 'INV-2024-006', 'SCH-7A-01', 'Vijay Nair', 'Class 7-A', 50000.00, '2024-08-25', NULL, 'Overdue', 'Term 1 Tuition Fee'),
('inv-7', 'INV-2024-007', 'SCH-10A-01', 'Kavita Das', 'Class 10-A', 20000.00, '2024-09-20', NULL, 'Pending', 'Annual Activity & Lab')
ON CONFLICT (id) DO NOTHING;

-- 9. Transport Routes & Bus Fleet
INSERT INTO transport_routes (id, route_number, bus_number, driver_name, driver_phone, attendant_name, capacity, occupied, stops, status) VALUES
('r-1', 'Route 04 (North City)', 'KA-01-EB-4210', 'Mr. Ramesh Gowda', '+91 98860 12345', 'Mrs. Manjula', 40, 34, ARRAY['Hebbal Flyover', 'Manyata Tech Park', 'Green Meadows Gate 2', 'Campus Main Gate'], 'On Time'),
('r-2', 'Route 02 (Indiranagar & East)', 'KA-01-EB-4211', 'Mr. Suresh Babu', '+91 98860 12346', 'Mrs. Radha', 40, 38, ARRAY['Indiranagar 100ft Rd', 'Domlur Bridge', 'Marathahalli Junction', 'Campus Main Gate'], 'On Time'),
('r-3', 'Route 06 (Whitefield Corridor)', 'KA-01-EB-4212', 'Mr. Venkatesh K.', '+91 98860 12347', 'Mrs. Shanthi', 40, 36, ARRAY['ITPL Main Gate', 'Hope Farm Circle', 'Hoodi Junction', 'Campus Main Gate'], 'On Time')
ON CONFLICT (id) DO NOTHING;

-- 10. Hostel Rooms
INSERT INTO hostel_rooms (id, block, room_number, capacity, occupied, warden, status) VALUES
('h-1', 'Junior Boys Wing', '101', 4, 2, 'Mr. Gopal Sharma', 'Available'),
('h-2', 'Girls Wing', '204', 4, 1, 'Mrs. Sunita Rao', 'Available'),
('h-3', 'Senior Boys Wing', '302', 4, 4, 'Mr. Arjun Verma', 'Full')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hostel_allocations (id, room_id, student_roll, student_name, class_grade) VALUES
('ha-1', 'h-1', 'SCH-8A-01', 'Rahul Sharma', 'Class 8-A'),
('ha-2', 'h-1', 'SCH-8A-03', 'Amit Kumar', 'Class 8-A'),
('ha-3', 'h-2', 'SCH-6B-01', 'Ananya Reddy', 'Class 6-B')
ON CONFLICT (id) DO NOTHING;

-- 11. Library Books & Circulation
INSERT INTO library_books (id, isbn, title, author, category, copies_available, total_copies, shelf_location) VALUES
('bk-1', '978-0199535569', 'Oxford Illustrated Science Encyclopedia for Young Learners', 'Oxford University Press', 'Science & Nature', 5, 8, 'Science Wing / Shelf A-02'),
('bk-2', '978-0141321103', 'The Adventures of Tom Sawyer & Huckleberry Finn', 'Mark Twain', 'Literature & Fiction', 7, 10, 'Junior Classics / Shelf C-01'),
('bk-3', '978-8174508126', 'Mathematics Problem Solver & Olympiad Foundation (Class 8)', 'R.D. Sharma & Board Experts', 'Mathematics', 4, 6, 'Mathematics Stack / Shelf M-04'),
('bk-4', '978-0756698287', 'DK Eyewitness History: Ancient Civilizations to Modern World', 'Dorling Kindersley', 'History & Civics', 6, 8, 'Social Sciences / Shelf H-03')
ON CONFLICT (id) DO NOTHING;

INSERT INTO library_issues (id, book_id, book_title, isbn, student_roll, student_name, class_grade, issue_date, due_date, return_date, status, fine_amount, remarks) VALUES
('iss-1', 'bk-1', 'Oxford Illustrated Science Encyclopedia for Young Learners', '978-0199535569', 'SCH-8A-01', 'Rahul Sharma', 'Class 8-A', '2024-08-15', '2024-08-29', NULL, 'Overdue', 50.00, 'Return delayed by 9 days; fine generated.'),
('iss-2', 'bk-3', 'Mathematics Problem Solver & Olympiad Foundation (Class 8)', '978-8174508126', 'SCH-8A-02', 'Sneha Patel', 'Class 8-A', '2024-09-01', '2024-09-15', NULL, 'Issued', 0.00, 'Issued for Olympiad prep.'),
('iss-3', 'bk-2', 'The Adventures of Tom Sawyer & Huckleberry Finn', '978-0141321103', 'SCH-6B-01', 'Ananya Reddy', 'Class 6-B', '2024-08-10', '2024-08-24', '2024-08-22', 'Returned', 0.00, 'Returned in excellent condition.')
ON CONFLICT (id) DO NOTHING;

-- 12. Expenses
INSERT INTO expenses (id, expense_number, category, description, vendor, amount, approved_by, expense_date, status, payment_mode, remarks) VALUES
('exp-1', 'EXP-2024-001', 'Salaries & Staff', 'Teaching Faculty Monthly Salary — September 2024', 'Greenwood Payroll Office', 450000.00, 'Dr. Rajesh Kumar', '2024-09-30', 'Approved', 'Bank Transfer', 'Monthly payroll processed for all faculty members.'),
('exp-2', 'EXP-2024-002', 'Utilities & Bills', 'Campus Electricity & Water Supply Bill — September', 'BESCOM / BWSSB', 38500.00, 'Dr. Anita Sharma', '2024-09-25', 'Approved', 'Online Payment', 'Regular monthly utility charges for campus.'),
('exp-3', 'EXP-2024-003', 'Infrastructure & Maintenance', 'Science Laboratory Equipment Maintenance & Calibration', 'LabTech Services Pvt. Ltd.', 75000.00, 'Dr. Rajesh Kumar', '2024-09-20', 'Approved', 'Cheque', 'Annual AMC for science lab instruments.'),
('exp-4', 'EXP-2024-004', 'Stationery & Supplies', 'Academic Stationery & Classroom Supplies — Term 2 Replenishment', 'National Book Depot', 24500.00, 'Mrs. Priya Desai', '2024-09-18', 'Approved', 'Bank Transfer', 'Chalk, markers, chart papers, register notebooks.'),
('exp-5', 'EXP-2024-005', 'Transport & Fleet', 'School Bus Fleet Fuel & Driver Allowance — September', 'HP Petrol Pump', 62000.00, 'Dr. Anita Sharma', '2024-09-28', 'Approved', 'Cash', 'Fuel for 3 active school bus routes.'),
('exp-6', 'EXP-2024-006', 'Events & Activities', 'Annual Sports Day Event — Equipment & Prize Procurement', 'Sports Emporium', 45000.00, 'Dr. Rajesh Kumar', '2024-09-10', 'Pending Approval', 'Bank Transfer', 'Trophies, medals, and equipment.'),
('exp-7', 'EXP-2024-007', 'Technology & IT', 'School ERP License Renewal & Cloud Server Maintenance', 'NexusFlow Technologies', 120000.00, 'Dr. Rajesh Kumar', '2024-09-05', 'Approved', 'Bank Transfer', 'Annual SaaS license for school management platform.'),
('exp-8', 'EXP-2024-008', 'Infrastructure & Maintenance', 'Classroom Air Conditioning Units — AMC Service', 'CoolAir Appliance Services', 28000.00, 'Mrs. Priya Desai', '2024-09-12', 'Rejected', 'Cheque', 'Rejected — duplicate request.')
ON CONFLICT (id) DO NOTHING;

-- 13. Budget Allocations
INSERT INTO budget_allocations (id, category, allocated_amount, spent_amount, academic_year, color_hex) VALUES
('bgt-1', 'Salaries & Staff', 5400000.00, 4500000.00, '2024-2025', '#0e4b38'),
('bgt-2', 'Infrastructure & Maintenance', 800000.00, 480000.00, '2024-2025', '#16a34a'),
('bgt-3', 'Utilities & Bills', 480000.00, 347000.00, '2024-2025', '#2563eb'),
('bgt-4', 'Stationery & Supplies', 150000.00, 98000.00, '2024-2025', '#d97706'),
('bgt-5', 'Transport & Fleet', 750000.00, 558000.00, '2024-2025', '#7c3aed'),
('bgt-6', 'Events & Activities', 200000.00, 85000.00, '2024-2025', '#dc2626'),
('bgt-7', 'Technology & IT', 300000.00, 240000.00, '2024-2025', '#0891b2')
ON CONFLICT (id) DO NOTHING;

-- 14. Admissions
INSERT INTO admissions (id, application_number, applicant_name, applying_for_class, guardian_name, guardian_phone, application_date, status, interview_date, remarks) VALUES
('adm-1', 'ADM-2024-001', 'Aryan Mehta', 'Class 6-A', 'Mr. Sunil Mehta', '+91 98765 11001', '2024-09-05', 'Admitted', '2024-09-10', 'Strong academic record. Admitted with merit.'),
('adm-2', 'ADM-2024-002', 'Divya Krishnan', 'Class 7-A', 'Mrs. Savitha Krishnan', '+91 98765 11002', '2024-09-08', 'Shortlisted', '2024-09-15', 'Shortlisted for interview round.'),
('adm-3', 'ADM-2024-003', 'Raman Nair', 'Class 9-A', 'Mr. Vinod Nair', '+91 98765 11003', '2024-09-10', 'Under Review', NULL, 'Documents under verification.'),
('adm-4', 'ADM-2024-004', 'Nisha Joshi', 'Class 6-B', 'Mr. Tarun Joshi', '+91 98765 11004', '2024-09-12', 'Waitlisted', NULL, 'Class 6-B is at capacity. Added to waitlist.'),
('adm-5', 'ADM-2024-005', 'Karan Bhatia', 'Class 8-A', 'Mrs. Pooja Bhatia', '+91 98765 11005', '2024-09-14', 'Rejected', NULL, 'Does not meet age eligibility criteria for Class 8.')
ON CONFLICT (id) DO NOTHING;

-- 15. Role Permissions Seed
INSERT INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES
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
('Principal', 'students',               TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'faculty',                TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'courses',                TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'timetable',              TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'exams',                  TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'exam_marks',             TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'attendance',             TRUE, TRUE,  FALSE, FALSE),
('Principal', 'invoices',               TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'transport_routes',       TRUE, FALSE, FALSE, FALSE),
('Principal', 'hostel',                 TRUE, FALSE, TRUE,  FALSE),
('Principal', 'library',                TRUE, FALSE, FALSE, FALSE),
('Principal', 'expenses',               TRUE, FALSE, FALSE, FALSE),
('Principal', 'admissions',             TRUE, TRUE,  TRUE,  FALSE),
('Principal', 'users',                 TRUE, TRUE,  FALSE, FALSE),
('Principal', 'settings',              TRUE, TRUE,  FALSE, FALSE),
('Principal', 'reports',               TRUE, FALSE, FALSE, FALSE),
('Administration', 'students',          TRUE, TRUE,  FALSE, FALSE),
('Administration', 'faculty',           TRUE, FALSE, FALSE, FALSE),
('Administration', 'courses',           TRUE, FALSE, FALSE, FALSE),
('Administration', 'timetable',         TRUE, FALSE, FALSE, FALSE),
('Administration', 'exams',             TRUE, FALSE, FALSE, FALSE),
('Administration', 'exam_marks',        FALSE,FALSE, FALSE, FALSE),
('Administration', 'attendance',        TRUE, FALSE, FALSE, FALSE),
('Administration', 'invoices',          TRUE, TRUE,  TRUE,  FALSE),
('Administration', 'transport_routes',  TRUE, FALSE, FALSE, FALSE),
('Administration', 'hostel',            TRUE, TRUE,  FALSE, FALSE),
('Administration', 'library',           TRUE, FALSE, FALSE, FALSE),
('Administration', 'expenses',          TRUE, TRUE,  TRUE,  FALSE),
('Administration', 'budget_allocations',TRUE, FALSE, FALSE, FALSE),
('Administration', 'admissions',        TRUE, TRUE,  TRUE,  FALSE),
('Administration', 'users',             FALSE,FALSE, FALSE, FALSE),
('Administration', 'reports',           TRUE, FALSE, FALSE, FALSE),
('Teacher', 'students',                 TRUE, FALSE, FALSE, FALSE),
('Teacher', 'faculty',                  TRUE, FALSE, FALSE, FALSE),
('Teacher', 'courses',                  TRUE, FALSE, TRUE,  FALSE),
('Teacher', 'timetable',                TRUE, FALSE, FALSE, FALSE),
('Teacher', 'exams',                    TRUE, TRUE,  TRUE,  FALSE),
('Teacher', 'exam_marks',               TRUE, TRUE,  TRUE,  FALSE),
('Teacher', 'attendance',               TRUE, TRUE,  FALSE, FALSE),
('Teacher', 'invoices',                 FALSE,FALSE, FALSE, FALSE),
('Teacher', 'library',                  TRUE, FALSE, FALSE, FALSE),
('Teacher', 'hostel',                   FALSE,FALSE, FALSE, FALSE),
('Library Admin', 'students',           TRUE, FALSE, FALSE, FALSE),
('Library Admin', 'faculty',            TRUE, FALSE, FALSE, FALSE),
('Library Admin', 'library',            TRUE, TRUE,  TRUE,  TRUE),
('Library Admin', 'courses',            TRUE, FALSE, FALSE, FALSE),
('Student', 'students',                 TRUE, FALSE, FALSE, FALSE),
('Student', 'exams',                    TRUE, FALSE, FALSE, FALSE),
('Student', 'exam_marks',               TRUE, FALSE, FALSE, FALSE),
('Student', 'attendance',               TRUE, FALSE, FALSE, FALSE),
('Student', 'invoices',                 TRUE, FALSE, FALSE, FALSE),
('Student', 'timetable',                TRUE, FALSE, FALSE, FALSE),
('Student', 'courses',                  TRUE, FALSE, FALSE, FALSE),
('Student', 'library',                  TRUE, FALSE, FALSE, FALSE),
('Student', 'transport_routes',         TRUE, FALSE, FALSE, FALSE),
('Parent', 'students',                  TRUE, FALSE, FALSE, FALSE),
('Parent', 'exams',                     TRUE, FALSE, FALSE, FALSE),
('Parent', 'exam_marks',                TRUE, FALSE, FALSE, FALSE),
('Parent', 'attendance',                TRUE, FALSE, FALSE, FALSE),
('Parent', 'invoices',                  TRUE, FALSE, FALSE, FALSE),
('Parent', 'timetable',                 TRUE, FALSE, FALSE, FALSE),
('Parent', 'courses',                   TRUE, FALSE, FALSE, FALSE),
('Parent', 'library',                   TRUE, FALSE, FALSE, FALSE),
('Parent', 'transport_routes',          TRUE, FALSE, FALSE, FALSE)
ON CONFLICT (role, module) DO NOTHING;

-- --------------------------------------------------------------------
-- SETUP COMPLETE
-- --------------------------------------------------------------------
