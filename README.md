# Enrollment Management System

A comprehensive student enrollment and course management system built with Next.js, Prisma, and PostgreSQL. This system allows administrators to manage students, courses, and enrollments efficiently.

## Features

- 🔐 **Authentication System** - Admin and student roles with secure JWT-based authentication
- 👥 **Student Management** - Create, update, delete, and view student profiles
- 📚 **Course Management** - Manage IT courses with schedules, instructors, and capacity
- 📝 **Enrollment System** - Enroll students in courses, track grades and status
- 📊 **Dashboard** - Different dashboards for admin and student roles
- 🔍 **Search & Filter** - Search functionality across all entities
- 🎨 **Modern UI** - Built with Tailwind CSS and Shadcn UI components

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with httpOnly cookies, bcryptjs for password hashing
- **UI:** Tailwind CSS, Shadcn UI, Lucide Icons
- **Validation:** Zod
- **State Management:** React Context API

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- pnpm (or npm/yarn)
- PostgreSQL database

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd enrollment-system
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/enrollment_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

   Replace `username`, `password`, and `enrollment_db` with your PostgreSQL credentials.

4. **Run database migrations**
   ```bash
   pnpm prisma migrate dev
   ```
   
   This will create all the necessary tables in your database.

5. **Seed the database** (Optional but recommended)
   ```bash
   pnpm db:seed
   ```
   
   This will populate your database with:
   - 1 Admin account
   - 15 Students with Cambodian names
   - 10 IT Courses
   - 60 Sample enrollments

## Running the Application

### Development Mode
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Mode
```bash
pnpm build
pnpm start
```

## Default Login Credentials

After running the seed script, you can log in with:

**Admin Account:**
- Email: `admin@enrollment.edu.kh`
- Password: `admin123`

**Student Accounts:**
- Email: `sovann.pich@student.edu.kh`
- Password: `student123`

**Student Accounts:**
- Email: Any student email (e.g., `sovann.pich@student.edu.kh`)
- Password: `student123`

## Database Schema

### User
- Stores authentication credentials
- Links to Student profile (for students)
- Roles: admin, student

### Student
- Extended profile information for students
- One-to-one relationship with User
- Tracks major, year, GPA, contact info

### Course
- IT course information
- Includes code, name, credits, instructor, schedule
- Tracks capacity and current enrollment

### Enrollment
- Links students to courses
- Tracks enrollment status (active, completed, dropped)
- Stores grades

## Project Structure

```
enrollment-system/
├── app/
│   ├── api/
│   ├── courses/
│   ├── dashboard/
│   ├── enrollments/
│   ├── login/
│   ├── register/
│   └── students/
├── components/
│   ├── ui/
│   └── dashboard-layout.tsx
├── lib/
│   ├── api-client.ts
│   ├── auth-context.tsx
│   ├── db.ts
│   ├── prisma.ts
│   ├── session.ts
│   └── types.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── .env
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:seed` - Seed the database with sample data
- `pnpm prisma studio` - Open Prisma Studio (database GUI)
- `pnpm prisma migrate dev` - Create and apply migrations
- `pnpm prisma generate` - Generate Prisma Client

## Key Features Explained

### Authentication & Authorization
- JWT tokens stored in httpOnly cookies for security
- Role-based access control (Admin vs Student)
- Protected API routes with middleware

### Admin Features
- Create/update/delete students, courses, and enrollments
- View all system data
- Manage user accounts
- Access registration page to create new admin/student accounts

### Student Features
- View enrolled courses
- See personal dashboard
- View course catalog
- Check grades and enrollment status

### Cascade Delete
- When a student is deleted, their associated user account is automatically deleted
- Enrollments are automatically cleaned up when students or courses are deleted

## Database Management

### View Database with Prisma Studio
```bash
pnpm prisma studio
```

### Create a New Migration
```bash
pnpm prisma migrate dev --name your_migration_name
```

### Reset Database
```bash
pnpm prisma migrate reset
```
This will drop the database, recreate it, run all migrations, and run the seed script.

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` in `.env` is correct
- Ensure PostgreSQL is running
- Check that the database exists

### Migration Errors
- Try resetting the database: `pnpm prisma migrate reset`
- Check if there are conflicting schema changes

### Authentication Issues
- Clear browser cookies
- Verify `JWT_SECRET` is set in `.env`
- Check that bcryptjs is properly installed

## Security Considerations

⚠️ **Important for Production:**
- Change the `JWT_SECRET` to a strong, random value
- Use HTTPS in production
- Set secure cookie options
- Implement rate limiting
- Add input validation and sanitization
- Regular security audits

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

**Developed by Code4GenZ** | Enrollment Management System v1.0.0
