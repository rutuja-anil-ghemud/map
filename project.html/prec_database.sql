-- PREC Engineering Portal Database Schema

CREATE DATABASE IF NOT EXISTS prec_portal;
USE prec_portal;

-- Students table with CET information
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    cet_score INT,
    cet_rank INT,
    program VARCHAR(50) NOT NULL,
    application_status ENUM('submitted', 'document_verification', 'interview', 'accepted', 'rejected') DEFAULT 'submitted',
    progress_percentage INT DEFAULT 0,
    is_eligible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    document_name VARCHAR(255) NOT NULL,
    document_path VARCHAR(500) NOT NULL,
    document_type VARCHAR(50),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Document verification table
CREATE TABLE document_verification (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    document_type ENUM('10th_marksheet', '12th_marksheet', 'cet_scorecard', 'aadhar_card', 'other') NOT NULL,
    verification_status ENUM('pending', 'ai_verified', 'manually_verified', 'rejected') DEFAULT 'pending',
    ai_confidence_score DECIMAL(5,2),
    verified_by INT,
    verification_date TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    total_students INT DEFAULT 0,
    labs_count INT DEFAULT 0,
    hod_name VARCHAR(100),
    hod_email VARCHAR(100)
);

-- Faculty table
CREATE TABLE faculty (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    department_id INT,
    position VARCHAR(50),
    qualifications TEXT,
    experience_years INT,
    research_areas TEXT,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Syllabus table
CREATE TABLE syllabus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_code VARCHAR(10),
    semester INT,
    subject_name VARCHAR(200) NOT NULL,
    subject_code VARCHAR(20),
    credits INT,
    syllabus_content TEXT,
    FOREIGN KEY (department_code) REFERENCES departments(code)
);

-- CET cutoffs table
CREATE TABLE cet_cutoffs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_code VARCHAR(10),
    academic_year VARCHAR(10),
    general_rank_cutoff INT,
    obc_rank_cutoff INT,
    sc_rank_cutoff INT,
    st_rank_cutoff INT,
    FOREIGN KEY (department_code) REFERENCES departments(code)
);

-- Helpline contacts table
CREATE TABLE helpline_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contact_type ENUM('emergency', 'admission', 'technical', 'general') NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    available_hours VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

-- Applications table
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    academic_year VARCHAR(10),
    entrance_score DECIMAL(5,2),
    interview_date DATE,
    interview_score DECIMAL(5,2),
    final_status ENUM('pending', 'accepted', 'rejected', 'waitlist') DEFAULT 'pending',
    remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Insert PREC departments
INSERT INTO departments (name, code, description, total_students, labs_count, hod_name, hod_email) VALUES
('Computer Science & AI', 'CS', 'Leading the future with artificial intelligence, machine learning, and cutting-edge software development.', 500, 8, 'Dr. Priya Sharma', 'priya.sharma@prec.ac.in'),
('Mechanical Engineering', 'ME', 'Innovation in manufacturing, robotics, and sustainable engineering solutions.', 400, 6, 'Prof. Amit Patel', 'amit.patel@prec.ac.in'),
('Electrical Engineering', 'EE', 'Powering the future with smart grids, IoT, and renewable energy systems.', 350, 5, 'Dr. Rajesh Kumar', 'rajesh.kumar@prec.ac.in'),
('Civil Engineering', 'CE', 'Building sustainable infrastructure for tomorrow\'s cities.', 300, 4, 'Prof. Sunita Verma', 'sunita.verma@prec.ac.in'),
('Aerospace Engineering', 'AE', 'Exploring the frontiers of flight and space technology.', 200, 3, 'Dr. Vikram Singh', 'vikram.singh@prec.ac.in');

-- Insert PREC faculty
INSERT INTO faculty (name, email, department_id, position, qualifications, experience_years, research_areas) VALUES
('Dr. Priya Sharma', 'priya.sharma@prec.ac.in', 1, 'HOD & Professor', 'PhD MIT, MS Stanford', 15, 'Artificial Intelligence, Machine Learning, Computer Vision'),
('Prof. Amit Patel', 'amit.patel@prec.ac.in', 2, 'HOD & Professor', 'PhD IIT Delhi, MS BITS Pilani', 18, 'Robotics, Manufacturing Systems, Green Technology'),
('Dr. Rajesh Kumar', 'rajesh.kumar@prec.ac.in', 3, 'Principal & Professor', 'PhD MIT, MS IIT Bombay', 25, 'Power Systems, Smart Grids, Renewable Energy'),
('Prof. Sunita Verma', 'sunita.verma@prec.ac.in', 4, 'HOD & Professor', 'PhD IIT Madras, MS NIT Trichy', 20, 'Structural Engineering, Sustainable Construction'),
('Dr. Vikram Singh', 'vikram.singh@prec.ac.in', 5, 'HOD & Professor', 'PhD Caltech, MS IIT Kharagpur', 22, 'Aerospace Dynamics, Propulsion Systems');

-- Insert CET cutoffs for current year
INSERT INTO cet_cutoffs (department_code, academic_year, general_rank_cutoff, obc_rank_cutoff, sc_rank_cutoff, st_rank_cutoff) VALUES
('CS', '2024-25', 5000, 7000, 15000, 20000),
('ME', '2024-25', 8000, 10000, 18000, 25000),
('EE', '2024-25', 7000, 9000, 16000, 22000),
('CE', '2024-25', 10000, 12000, 20000, 28000),
('AE', '2024-25', 6000, 8000, 14000, 18000);

-- Insert helpline contacts
INSERT INTO helpline_contacts (contact_type, phone_number, email, available_hours, is_active) VALUES
('emergency', '+91-20-2765-3168', 'emergency@prec.ac.in', '24/7', TRUE),
('admission', '+91-20-2765-3169', 'admissions@prec.ac.in', 'Mon-Sat: 9AM-6PM', TRUE),
('technical', '+91-20-2765-3170', 'tech@prec.ac.in', 'Mon-Fri: 10AM-5PM', TRUE),
('general', '+91-20-2765-3171', 'info@prec.ac.in', 'Mon-Sat: 9AM-5PM', TRUE);

-- Insert sample syllabus data
INSERT INTO syllabus (department_code, semester, subject_name, subject_code, credits) VALUES
('CS', 1, 'Programming Fundamentals', 'CS101', 4),
('CS', 1, 'Mathematics I', 'MA101', 4),
('CS', 1, 'Physics', 'PH101', 3),
('CS', 1, 'Engineering Graphics', 'EG101', 2),
('CS', 2, 'Data Structures', 'CS201', 4),
('CS', 2, 'Mathematics II', 'MA201', 4),
('CS', 2, 'Digital Electronics', 'EC201', 3),
('CS', 2, 'Computer Organization', 'CS202', 3),
('ME', 1, 'Engineering Mechanics', 'ME101', 4),
('ME', 1, 'Engineering Drawing', 'ME102', 3),
('ME', 2, 'Thermodynamics', 'ME201', 4),
('ME', 2, 'Manufacturing Processes', 'ME202', 3);

-- Create indexes for better performance
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_student_cet_rank ON students(cet_rank);
CREATE INDEX idx_student_program ON students(program);
CREATE INDEX idx_application_status ON students(application_status);
CREATE INDEX idx_document_student ON documents(student_id);
CREATE INDEX idx_faculty_department ON faculty(department_id);
CREATE INDEX idx_syllabus_dept ON syllabus(department_code);
CREATE INDEX idx_cutoff_dept ON cet_cutoffs(department_code);