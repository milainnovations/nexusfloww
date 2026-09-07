-- ====================================================================
-- DEDICATED SINGLE-SCHOOL ERP DATABASE SCHEMA
-- Target Architecture: Single-Tenant Custom Database (No school_id columns needed)
-- Compatible with PostgreSQL / MySQL / SQLite
-- ====================================================================

-- 1. INSTITUTION METADATA & CONFIGURATION
CREATE TABLE IF NOT EXISTS institution_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'inst_config_01',
    institution_name VARCHAR(255) NOT NULL DEFAULT 'Greenwood International School',
    campus_code VARCHAR(50) NOT NULL DEFAULT 'GWIS',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    academic_year VARCHAR(50) NOT NULL DEFAULT '2024-2025',
    principal_name VARCHAR(100),
    managing_director VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS & SYSTEM ROLES
-- Roles: Super Admin, Principal, Teacher, Library Admin, Student, Parent
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT 'pbkdf2:sha256:...',
    role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'Principal', 'Teacher', 'Library Admin', 'Student', 'Parent')),
    designation VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Invited', 'Suspended')),
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STUDENTS DIRECTORY
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    class_grade VARCHAR(50) NOT NULL, -- e.g. 'Class 8-A'
    section VARCHAR(10) NOT NULL DEFAULT 'A',
    academic_year VARCHAR(50) NOT NULL DEFAULT '2024-2025',
    attendance_pct DECIMAL(5, 2) DEFAULT 100.00,
    classes_present INT DEFAULT 0,
    total_classes INT DEFAULT 0,
    overall_grade VARCHAR(10) DEFAULT 'A1',
    term_percentage DECIMAL(5, 2) DEFAULT 0.00,
    phone VARCHAR(50),
    bus_route VARCHAR(255),
    guardian_name VARCHAR(255),
    guardian_relation VARCHAR(50),
    guardian_phone VARCHAR(50),
    address TEXT,
    dues DECIMAL(10, 2) DEFAULT 0.00,
    admission_date DATE,
    date_of_birth DATE,
    blood_group VARCHAR(10),
    remarks TEXT
);

-- 4. FACULTY & TEACHING STAFF
CREATE TABLE IF NOT EXISTS faculty (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    teacher_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    is_class_teacher_of VARCHAR(50),
    cabin VARCHAR(100),
    phone VARCHAR(50),
    qualification VARCHAR(255),
    experience_years INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave'))
);

-- 5. COURSES & ACADEMIC SUBJECTS
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    class_grade VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    periods_per_week INT DEFAULT 5,
    type VARCHAR(50) CHECK (type IN ('Core Academic', 'Co-Curricular', 'Laboratory')),
    faculty_in_charge_id VARCHAR(50) REFERENCES faculty(id) ON DELETE SET NULL,
    syllabus_chapters_count INT DEFAULT 15,
    chapters_completed INT DEFAULT 0
);

-- 6. CLASS TIMETABLE SLOTS
CREATE TABLE IF NOT EXISTS timetable (
    id VARCHAR(50) PRIMARY KEY,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    period_name VARCHAR(50) NOT NULL, -- e.g. 'Period 1 (08:30-09:15)'
    time_slot VARCHAR(50) NOT NULL,
    subject_code VARCHAR(50) REFERENCES courses(code) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    class_grade VARCHAR(50) NOT NULL,
    room VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'Theory'
);

-- 7. EXAMINATIONS & ASSESSMENT SCHEDULE
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    term VARCHAR(50) CHECK (term IN ('Term 1', 'Term 2', 'Unit Assessment')),
    class_grade VARCHAR(50) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    exam_date DATE NOT NULL,
    max_marks INT DEFAULT 100,
    conducted_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Conducted', 'Evaluated', 'Published'))
);

-- 8. STUDENT MARKS LEDGER
CREATE TABLE IF NOT EXISTS exam_marks (
    id VARCHAR(50) PRIMARY KEY,
    exam_id VARCHAR(50) REFERENCES exams(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) REFERENCES students(roll_number) ON DELETE CASCADE,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    grade VARCHAR(10),
    remarks TEXT,
    UNIQUE(exam_id, student_roll)
);

-- 9. FEES & INVOICING
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    student_roll VARCHAR(50) REFERENCES students(roll_number) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    class_grade VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue')),
    fee_type VARCHAR(100) NOT NULL
);

-- 10. HOSTEL ROOMS & ALLOCATIONS
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id VARCHAR(50) PRIMARY KEY,
    block VARCHAR(100) NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    capacity INT DEFAULT 4,
    occupied INT DEFAULT 0,
    warden VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Available' CHECK (status IN ('Available', 'Full', 'Maintenance'))
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
    id VARCHAR(50) PRIMARY KEY,
    room_id VARCHAR(50) REFERENCES hostel_rooms(id) ON DELETE CASCADE,
    student_roll VARCHAR(50) REFERENCES students(roll_number) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    class_grade VARCHAR(50) NOT NULL,
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. LIBRARY BOOK CATALOG
CREATE TABLE IF NOT EXISTS library_books (
    id VARCHAR(50) PRIMARY KEY,
    isbn VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_copies INT DEFAULT 1,
    copies_available INT DEFAULT 1,
    shelf_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. LIBRARY BOOK ISSUES & RETURN LEDGER (Managed by Library Admin)
CREATE TABLE IF NOT EXISTS library_issues (
    id VARCHAR(50) PRIMARY KEY,
    book_id VARCHAR(50) REFERENCES library_books(id) ON DELETE CASCADE,
    book_title VARCHAR(255) NOT NULL,
    isbn VARCHAR(50) NOT NULL,
    student_roll VARCHAR(50) REFERENCES students(roll_number) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    class_grade VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(20) DEFAULT 'Issued' CHECK (status IN ('Issued', 'Returned', 'Overdue')),
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_grade);
CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_timetable_class ON timetable(class_grade, day_of_week);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_library_books_isbn ON library_books(isbn);
CREATE INDEX IF NOT EXISTS idx_library_issues_status ON library_issues(status);
CREATE INDEX IF NOT EXISTS idx_library_issues_student ON library_issues(student_roll);
