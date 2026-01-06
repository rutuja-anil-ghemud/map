# NexGen Engineering Portal - Setup Instructions

## 🚀 Complete Full-Stack Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server
- Git

### 1. Database Setup

#### Install MySQL
```bash
# Windows (using Chocolatey)
choco install mysql

# Or download from: https://dev.mysql.com/downloads/mysql/
```

#### Create Database
```bash
# Login to MySQL
mysql -u root -p

# Run the database.sql file
source database.sql
```

### 2. Backend Setup

#### Install Dependencies
```bash
npm install
```

#### Configure Environment
1. Copy `.env` file and update with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nexgen_portal
PORT=3000
JWT_SECRET=your_secret_key_here
```

#### Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 3. API Endpoints

#### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/:studentId` - Get application status
- `PUT /api/applications/:studentId/status` - Update status (Admin)

#### File Upload
- `POST /api/upload/:studentId` - Upload documents
- `GET /api/documents/:studentId` - Get uploaded documents

#### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:code` - Get department details

#### Statistics
- `GET /api/stats` - Get dashboard statistics
- `GET /api/students/search?query=` - Search students

### 4. Database Schema

#### Tables Created:
- `students` - Student information and application status
- `documents` - Uploaded document records
- `departments` - Engineering departments
- `faculty` - Faculty information
- `applications` - Application details and scores

### 5. Features Implemented

#### Frontend Features:
✅ Modern glassmorphism design
✅ Interactive animations
✅ Real-time form preview
✅ Drag & drop file upload
✅ Progress tracking
✅ Responsive design

#### Backend Features:
✅ RESTful API
✅ MySQL database integration
✅ File upload handling
✅ Input validation
✅ Error handling
✅ CORS enabled

#### Security Features:
✅ Input sanitization
✅ File type validation
✅ File size limits
✅ SQL injection prevention

### 6. Usage

1. **Submit Application**: Fill out the form and submit
2. **Upload Documents**: Drag & drop or select files
3. **Track Progress**: View real-time application status
4. **Department Info**: Click on department cards for details

### 7. Admin Features (Future Enhancement)

- Student management dashboard
- Application review system
- Document verification
- Status updates
- Analytics and reports

### 8. Troubleshooting

#### Common Issues:
- **Database Connection**: Check MySQL service is running
- **File Upload**: Ensure uploads/ directory exists
- **CORS Errors**: Verify frontend and backend URLs
- **Port Conflicts**: Change PORT in .env file

### 9. Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Database setup
mysql -u root -p < database.sql
```

### 10. Project Structure

```
project.html/
├── index.html          # Frontend
├── style.css           # Styles
├── script.js           # Frontend JS
├── server.js           # Backend server
├── database.sql        # Database schema
├── package.json        # Dependencies
├── .env               # Environment config
└── uploads/           # File storage
```

🎯 **Your engineering portal is now a complete full-stack application with modern UI, robust backend, and MySQL database!**