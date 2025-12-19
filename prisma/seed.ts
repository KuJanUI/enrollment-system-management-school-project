import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  await prisma.enrollment.deleteMany()
  await prisma.student.deleteMany()
  await prisma.course.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@enrollment.edu.kh',
      password: adminPassword,
      name: 'Sopheak Chea',
      role: 'admin',
    },
  })
  console.log('Created admin user')

  // Create Student Users
  const studentNames = [
    { name: 'Sovann Pich', email: 'sovann.pich@student.edu.kh' },
    { name: 'Sreymom Hem', email: 'sreymom.hem@student.edu.kh' },
    { name: 'Dara Kong', email: 'dara.kong@student.edu.kh' },
    { name: 'Sophea Lim', email: 'sophea.lim@student.edu.kh' },
    { name: 'Veasna Chann', email: 'veasna.chann@student.edu.kh' },
    { name: 'Bopha Sam', email: 'bopha.sam@student.edu.kh' },
    { name: 'Piseth Sok', email: 'piseth.sok@student.edu.kh' },
    { name: 'Channthy Ouk', email: 'channthy.ouk@student.edu.kh' },
    { name: 'Kosal Meas', email: 'kosal.meas@student.edu.kh' },
    { name: 'Sreypov Yun', email: 'sreypov.yun@student.edu.kh' },
    { name: 'Ratana Keo', email: 'ratana.keo@student.edu.kh' },
    { name: 'Chanmony Chea', email: 'chanmony.chea@student.edu.kh' },
    { name: 'Vibol Heng', email: 'vibol.heng@student.edu.kh' },
    { name: 'Sothea Rath', email: 'sothea.rath@student.edu.kh' },
    { name: 'Kunthea Chum', email: 'kunthea.chum@student.edu.kh' },
  ]

  const studentPassword = await bcrypt.hash('student123', 10)
  const students = []

  for (let i = 0; i < studentNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        email: studentNames[i].email,
        password: studentPassword,
        name: studentNames[i].name,
        role: 'student',
      },
    })

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        studentId: `STU${String(i + 1).padStart(4, '0')}`,
        year: Math.floor(Math.random() * 4) + 1,
        phone: `+855 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
        dateOfBirth: `${1998 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        address: 'Phnom Penh, Cambodia',
        status: 'active',
      },
    })

    students.push(student)
  }

  console.log(`Created ${students.length} student users`)

  // Create IT Courses
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        code: 'CS101',
        name: 'Introduction to Programming',
        description: 'Fundamental concepts of programming using Python. Learn variables, loops, functions, and basic algorithms.',
        credits: 3,
        instructor: 'Prof. Sokha Tan',
        maxCapacity: 35,
        schedule: 'Mon/Wed 8:00-9:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS102',
        name: 'Data Structures and Algorithms',
        description: 'Study of fundamental data structures and algorithms. Covers arrays, linked lists, trees, graphs, sorting, and searching.',
        credits: 4,
        instructor: 'Dr. Vireak Nhem',
        maxCapacity: 30,
        schedule: 'Tue/Thu 10:00-11:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS201',
        name: 'Web Development',
        description: 'Modern web development using HTML, CSS, JavaScript, React, and Node.js. Build full-stack web applications.',
        credits: 4,
        instructor: 'Prof. Sreyleak Prak',
        maxCapacity: 30,
        schedule: 'Mon/Wed 14:00-15:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS202',
        name: 'Database Management Systems',
        description: 'Design and implementation of database systems. SQL, normalization, transactions, and database optimization.',
        credits: 3,
        instructor: 'Dr. Chamroeun Mao',
        maxCapacity: 32,
        schedule: 'Tue/Thu 13:00-14:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS301',
        name: 'Software Engineering',
        description: 'Software development lifecycle, design patterns, agile methodologies, testing, and project management.',
        credits: 4,
        instructor: 'Prof. Ratha Seng',
        maxCapacity: 28,
        schedule: 'Mon/Wed 10:00-11:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS302',
        name: 'Mobile App Development',
        description: 'Build native and cross-platform mobile applications using React Native and Flutter.',
        credits: 3,
        instructor: 'Prof. Sovannarith Chhay',
        maxCapacity: 25,
        schedule: 'Tue/Thu 15:00-16:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS303',
        name: 'Artificial Intelligence',
        description: 'Introduction to AI concepts including machine learning, neural networks, and natural language processing.',
        credits: 4,
        instructor: 'Dr. Phearum Meng',
        maxCapacity: 30,
        schedule: 'Mon/Fri 9:00-10:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS304',
        name: 'Cybersecurity Fundamentals',
        description: 'Network security, cryptography, ethical hacking, and security best practices for applications.',
        credits: 3,
        instructor: 'Prof. Makara Vong',
        maxCapacity: 28,
        schedule: 'Wed/Fri 14:00-15:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS401',
        name: 'Cloud Computing',
        description: 'Cloud infrastructure, AWS, Azure, Docker, Kubernetes, and microservices architecture.',
        credits: 3,
        instructor: 'Dr. Rithy Chann',
        maxCapacity: 25,
        schedule: 'Tue/Thu 8:00-9:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
    prisma.course.create({
      data: {
        code: 'CS402',
        name: 'DevOps and Automation',
        description: 'CI/CD pipelines, infrastructure as code, automated testing, and deployment strategies.',
        credits: 3,
        instructor: 'Prof. Sophy Noun',
        maxCapacity: 26,
        schedule: 'Mon/Wed 11:00-12:30',
        semester: 'Fall 2025',
        status: 'active',
      },
    }),
  ])

  console.log(`Created ${courses.length} IT courses`)

  // Create Enrollments (random enrollments for students)
  const enrollments = []
  for (const student of students) {
    // Each student enrolls in 3-5 random courses
    const numCourses = Math.floor(Math.random() * 3) + 3
    const shuffledCourses = [...courses].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < numCourses; i++) {
      const course = shuffledCourses[i]
      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          status: ['active', 'active', 'active', 'completed'][Math.floor(Math.random() * 4)],
          grade: Math.random() > 0.3 ? ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C'][Math.floor(Math.random() * 7)] : null,
        },
      })
      enrollments.push(enrollment)

      // Update course current enrollment count
      await prisma.course.update({
        where: { id: course.id },
        data: {
          currentEnrollment: {
            increment: 1,
          },
        },
      })
    }
  }

  console.log(`Created ${enrollments.length} enrollments`)

  console.log('Seed completed successfully!')
  console.log('\nLogin credentials:')
  console.log('Admin: admin@enrollment.edu.kh / admin123')
  console.log('Students: Any student email / student123')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
