-- NexGen Engineering Portal Database Schema

CREATE DATABASE IF NOT EXISTS nexgen_portal;
USE nexgen_portal;

-- Students table
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    program VARCHAR(50) NOT NULL,
    application_status ENUM('submitted', 'under_review', 'interview', 'accepted', 'rejected') DEFAULT 'submitted',
    progress_percentage INT DEFAULT 0,
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

-- Insert sample departments
INSERT INTO departments (name, code, description, total_students, labs_count, hod_name, hod_email) VALUES
('Computer Science & AI', 'CS', 'Leading the future with artificial intelligence, machine learning, and cutting-edge software development.', 500, 8, 'Dr. Priya Sharma', 'priya.sharma@nexgen.edu'),
('Mechanical Engineering', 'ME', 'Innovation in manufacturing, robotics, and sustainable engineering solutions.', 400, 6, 'Prof. Amit Patel', 'amit.patel@nexgen.edu'),
('Electrical Engineering', 'EE', 'Powering the future with smart grids, IoT, and renewable energy systems.', 350, 5, 'Dr. Rajesh Kumar', 'rajesh.kumar@nexgen.edu'),
('Civil Engineering', 'CE', 'Building sustainable infrastructure for tomorrow\'s cities.', 300, 4, 'Prof. Sunita Verma', 'sunita.verma@nexgen.edu'),
('Aerospace Engineering', 'AE', 'Exploring the frontiers of flight and space technology.', 200, 3, 'Dr. Vikram Singh', 'vikram.singh@nexgen.edu');

-- Insert sample faculty
INSERT INTO faculty (name, email, department_id, position, qualifications, experience_years, research_areas) VALUES
('Dr. Priya Sharma', 'priya.sharma@nexgen.edu', 1, 'HOD & Professor', 'PhD MIT, MS Stanford', 15, 'Artificial Intelligence, Machine Learning, Computer Vision'),
('Prof. Amit Patel', 'amit.patel@nexgen.edu', 2, 'HOD & Professor', 'PhD IIT Delhi, MS BITS Pilani', 18, 'Robotics, Manufacturing Systems, Green Technology'),
('Dr. Rajesh Kumar', 'rajesh.kumar@nexgen.edu', 3, 'Principal & Professor', 'PhD MIT, MS IIT Bombay', 25, 'Power Systems, Smart Grids, Renewable Energy'),
('Prof. Sunita Verma', 'sunita.verma@nexgen.edu', 4, 'HOD & Professor', 'PhD IIT Madras, MS NIT Trichy', 20, 'Structural Engineering, Sustainable Construction'),
('Dr. Vikram Singh', 'vikram.singh@nexgen.edu', 5, 'HOD & Professor', 'PhD Caltech, MS IIT Kharagpur', 22, 'Aerospace Dynamics, Propulsion Systems');

-- Create indexes for better performance
CREATE INDEX idx_student_email ON students(email);
CREATE INDEX idx_student_program ON students(program);
CREATE INDEX idx_application_status ON students(application_status);
CREATE INDEX idx_document_student ON documents(student_id);
CREATE INDEX idx_faculty_department ON faculty(department_id);