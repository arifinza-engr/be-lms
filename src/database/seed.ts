// ✅ Load .env terlebih dahulu
import * as dotenv from 'dotenv';
dotenv.config(); // HARUS di paling atas sebelum akses process.env

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as bcrypt from 'bcryptjs';
import * as schema from './schema';

// 💡 Cek apakah DATABASE_URL terbaca
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in .env');
  process.exit(1);
}

// Configure postgres client with better settings for production
const client = postgres(process.env.DATABASE_URL, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Disable prepared statements for better compatibility
});

const db = drizzle(client, { schema });

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // Test database connection
    await db.execute('SELECT 1');
    console.log('✅ Database connection successful');

    // Create Users
    console.log('👥 Creating users...');

    const [adminUser] = await db
      .insert(schema.users)
      .values({
        email: 'admin@lms.com',
        password: await bcrypt.hash('Admin123!@#', 12),
        name: 'Admin LMS',
        role: 'ADMIN',
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          name: 'Admin LMS',
          role: 'ADMIN',
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [guruUser] = await db
      .insert(schema.users)
      .values({
        email: 'guru@lms.com',
        password: await bcrypt.hash('Guru123!@#', 12),
        name: 'Dr. Budi Santoso',
        role: 'GURU',
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          name: 'Dr. Budi Santoso',
          role: 'GURU',
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [siswa1] = await db
      .insert(schema.users)
      .values({
        email: 'siswa1@lms.com',
        password: await bcrypt.hash('Siswa123!@#', 12),
        name: 'Ahmad Rizki',
        role: 'SISWA',
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          name: 'Ahmad Rizki',
          role: 'SISWA',
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [siswa2] = await db
      .insert(schema.users)
      .values({
        email: 'siswa2@lms.com',
        password: await bcrypt.hash('Siswa123!@#', 12),
        name: 'Siti Nurhaliza',
        role: 'SISWA',
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          name: 'Siti Nurhaliza',
          role: 'SISWA',
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Create Grades
    console.log('🎓 Creating grades...');

    const [grade10] = await db
      .insert(schema.grades)
      .values({
        title: 'Kelas 10 SMA',
        description: 'Kelas X - Semester 1 & 2',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.grades.title,
        set: {
          description: 'Kelas X - Semester 1 & 2',
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [grade11] = await db
      .insert(schema.grades)
      .values({
        title: 'Kelas 11 SMA',
        description: 'Kelas XI - Semester 1 & 2',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.grades.title,
        set: {
          description: 'Kelas XI - Semester 1 & 2',
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [grade12] = await db
      .insert(schema.grades)
      .values({
        title: 'Kelas 12 SMA',
        description: 'Kelas XII - Semester 1 & 2',
        isActive: true,
      })
      .onConflictDoUpdate({
        target: schema.grades.title,
        set: {
          description: 'Kelas XII - Semester 1 & 2',
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Create Subjects
    console.log('📚 Creating subjects...');

    const [matematika10] = await db
      .insert(schema.subjects)
      .values({
        title: 'Matematika',
        description: 'Matematika Kelas 10 - Aljabar, Geometri, Trigonometri',
        gradeId: grade10.id,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.subjects.title, schema.subjects.gradeId],
        set: {
          description: 'Matematika Kelas 10 - Aljabar, Geometri, Trigonometri',
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [fisika10] = await db
      .insert(schema.subjects)
      .values({
        title: 'Fisika',
        description: 'Fisika Kelas 10 - Mekanika, Termodinamika, Gelombang',
        gradeId: grade10.id,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.subjects.title, schema.subjects.gradeId],
        set: {
          description: 'Fisika Kelas 10 - Mekanika, Termodinamika, Gelombang',
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [kimia10] = await db
      .insert(schema.subjects)
      .values({
        title: 'Kimia',
        description:
          'Kimia Kelas 10 - Struktur Atom, Ikatan Kimia, Stoikiometri',
        gradeId: grade10.id,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.subjects.title, schema.subjects.gradeId],
        set: {
          description:
            'Kimia Kelas 10 - Struktur Atom, Ikatan Kimia, Stoikiometri',
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Create Chapters
    console.log('📖 Creating chapters...');

    const [aljabar] = await db
      .insert(schema.chapters)
      .values({
        title: 'Aljabar',
        description: 'Konsep dasar aljabar, persamaan, dan pertidaksamaan',
        subjectId: matematika10.id,
        order: 1,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.chapters.title, schema.chapters.subjectId],
        set: {
          description: 'Konsep dasar aljabar, persamaan, dan pertidaksamaan',
          order: 1,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [geometri] = await db
      .insert(schema.chapters)
      .values({
        title: 'Geometri',
        description: 'Geometri bidang dan ruang, teorema Pythagoras',
        subjectId: matematika10.id,
        order: 2,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.chapters.title, schema.chapters.subjectId],
        set: {
          description: 'Geometri bidang dan ruang, teorema Pythagoras',
          order: 2,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [trigonometri] = await db
      .insert(schema.chapters)
      .values({
        title: 'Trigonometri',
        description: 'Fungsi trigonometri, identitas, dan aplikasinya',
        subjectId: matematika10.id,
        order: 3,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.chapters.title, schema.chapters.subjectId],
        set: {
          description: 'Fungsi trigonometri, identitas, dan aplikasinya',
          order: 3,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Create Subchapters
    console.log('📝 Creating subchapters...');

    const [persamaanLinear] = await db
      .insert(schema.subchapters)
      .values({
        title: 'Persamaan Linear',
        description:
          'Persamaan linear satu variabel dan sistem persamaan linear',
        chapterId: aljabar.id,
        order: 1,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.subchapters.title, schema.subchapters.chapterId],
        set: {
          description:
            'Persamaan linear satu variabel dan sistem persamaan linear',
          order: 1,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [persamaanKuadrat] = await db
      .insert(schema.subchapters)
      .values({
        title: 'Persamaan Kuadrat',
        description: 'Persamaan kuadrat, diskriminan, dan akar-akar persamaan',
        chapterId: aljabar.id,
        order: 2,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.subchapters.title, schema.subchapters.chapterId],
        set: {
          description:
            'Persamaan kuadrat, diskriminan, dan akar-akar persamaan',
          order: 2,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    const [pertidaksamaan] = await db
      .insert(schema.subchapters)
      .values({
        title: 'Pertidaksamaan',
        description: 'Pertidaksamaan linear dan kuadrat',
        chapterId: aljabar.id,
        order: 3,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: [schema.subchapters.title, schema.subchapters.chapterId],
        set: {
          description: 'Pertidaksamaan linear dan kuadrat',
          order: 3,
          isActive: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Create AI Generated Content
    console.log('🤖 Creating sample AI content...');

    await db
      .insert(schema.aiGeneratedContent)
      .values({
        subchapterId: persamaanLinear.id,
        content: `# Persamaan Linear

Persamaan linear adalah persamaan matematika yang memiliki bentuk **ax + b = 0**, di mana:
- **a** dan **b** adalah konstanta (bilangan tetap)
- **x** adalah variabel yang dicari nilainya
- **a ≠ 0** (jika a = 0, maka bukan persamaan linear)

## Ciri-ciri Persamaan Linear:
1. **Pangkat tertinggi variabel adalah 1**
2. **Tidak ada perkalian antar variabel**
3. **Grafik berupa garis lurus**
4. **Memiliki tepat satu solusi**

## Contoh Persamaan Linear:
- 2x + 5 = 0 → x = -5/2
- 3x - 7 = 2x + 1 → x = 8
- x/2 + 3 = 8 → x = 10

## Langkah Penyelesaian:
1. Kumpulkan semua suku yang mengandung variabel di satu ruas
2. Kumpulkan semua konstanta di ruas yang lain
3. Bagi kedua ruas dengan koefisien variabel
4. Periksa jawaban dengan substitusi

## Aplikasi dalam Kehidupan:
- Menghitung keuntungan dan kerugian
- Menentukan harga jual dan beli
- Menghitung jarak, waktu, dan kecepatan`,
        audioUrl: null,
        isInitial: true,
        version: 1,
      })
      .onConflictDoUpdate({
        target: [
          schema.aiGeneratedContent.subchapterId,
          schema.aiGeneratedContent.isInitial,
        ],
        set: {
          content: `# Persamaan Linear

Persamaan linear adalah persamaan matematika yang memiliki bentuk **ax + b = 0**, di mana:
- **a** dan **b** adalah konstanta (bilangan tetap)
- **x** adalah variabel yang dicari nilainya
- **a ≠ 0** (jika a = 0, maka bukan persamaan linear)

## Ciri-ciri Persamaan Linear:
1. **Pangkat tertinggi variabel adalah 1**
2. **Tidak ada perkalian antar variabel**
3. **Grafik berupa garis lurus**
4. **Memiliki tepat satu solusi**

## Contoh Persamaan Linear:
- 2x + 5 = 0 → x = -5/2
- 3x - 7 = 2x + 1 → x = 8
- x/2 + 3 = 8 → x = 10

## Langkah Penyelesaian:
1. Kumpulkan semua suku yang mengandung variabel di satu ruas
2. Kumpulkan semua konstanta di ruas yang lain
3. Bagi kedua ruas dengan koefisien variabel
4. Periksa jawaban dengan substitusi

## Aplikasi dalam Kehidupan:
- Menghitung keuntungan dan kerugian
- Menentukan harga jual dan beli
- Menghitung jarak, waktu, dan kecepatan`,
          version: 1,
          updatedAt: new Date(),
        },
      });

    // User Progress
    console.log('📊 Creating user progress...');

    await db
      .insert(schema.userProgress)
      .values({
        userId: siswa1.id,
        subchapterId: persamaanLinear.id,
        status: 'COMPLETED',
        completedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [schema.userProgress.userId, schema.userProgress.subchapterId],
        set: {
          status: 'COMPLETED',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    await db
      .insert(schema.userProgress)
      .values({
        userId: siswa1.id,
        subchapterId: persamaanKuadrat.id,
        status: 'IN_PROGRESS',
      })
      .onConflictDoUpdate({
        target: [schema.userProgress.userId, schema.userProgress.subchapterId],
        set: {
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });

    await db
      .insert(schema.userProgress)
      .values({
        userId: siswa2.id,
        subchapterId: persamaanLinear.id,
        status: 'IN_PROGRESS',
      })
      .onConflictDoUpdate({
        target: [schema.userProgress.userId, schema.userProgress.subchapterId],
        set: {
          status: 'IN_PROGRESS',
          updatedAt: new Date(),
        },
      });

    // Create Quiz
    console.log('📝 Creating sample quiz...');

    const [quizPersamaanLinear] = await db
      .insert(schema.quizzes)
      .values({
        subchapterId: persamaanLinear.id,
        title: 'Quiz: Persamaan Linear',
        description: 'Quiz untuk menguji pemahaman tentang persamaan linear',
        isActive: true,
        timeLimit: 30, // 30 minutes
        passingScore: 75,
      })
      .onConflictDoUpdate({
        target: [schema.quizzes.subchapterId, schema.quizzes.title],
        set: {
          description: 'Quiz untuk menguji pemahaman tentang persamaan linear',
          isActive: true,
          timeLimit: 30,
          passingScore: 75,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (quizPersamaanLinear) {
      await db
        .insert(schema.quizQuestions)
        .values([
          {
            quizId: quizPersamaanLinear.id,
            question: 'Nilai x dari persamaan 3x + 7 = 22 adalah...',
            options: ['A. 5', 'B. 4', 'C. 6', 'D. 3'],
            correctAnswer: 'A',
            explanation:
              'Langkah penyelesaian:\n3x + 7 = 22\n3x = 22 - 7\n3x = 15\nx = 15 ÷ 3\nx = 5',
            order: 1,
            points: 25,
          },
          {
            quizId: quizPersamaanLinear.id,
            question: 'Persamaan manakah yang merupakan persamaan linear?',
            options: [
              'A. x² + 2x = 5',
              'B. 2x + 3 = 7',
              'C. x³ - 1 = 0',
              'D. xy + 2 = 8',
            ],
            correctAnswer: 'B',
            explanation:
              'Persamaan linear memiliki ciri:\n- Pangkat tertinggi variabel adalah 1\n- Tidak ada perkalian antar variabel\n- Bentuk umum: ax + b = 0',
            order: 2,
            points: 25,
          },
          {
            quizId: quizPersamaanLinear.id,
            question: 'Jika 2x - 5 = x + 3, maka nilai x adalah...',
            options: ['A. 8', 'B. 6', 'C. 4', 'D. 2'],
            correctAnswer: 'A',
            explanation:
              'Langkah penyelesaian:\n2x - 5 = x + 3\n2x - x = 3 + 5\nx = 8',
            order: 3,
            points: 25,
          },
          {
            quizId: quizPersamaanLinear.id,
            question:
              'Grafik persamaan linear y = 2x + 1 memotong sumbu y di titik...',
            options: ['A. (0, 1)', 'B. (0, 2)', 'C. (1, 0)', 'D. (2, 0)'],
            correctAnswer: 'A',
            explanation:
              'Grafik memotong sumbu y ketika x = 0:\ny = 2(0) + 1 = 1\nJadi titik potongnya adalah (0, 1)',
            order: 4,
            points: 25,
          },
        ])
        .onConflictDoNothing();
    }

    // Create sample quiz attempt
    console.log('🎯 Creating sample quiz attempt...');

    await db
      .insert(schema.quizAttempts)
      .values({
        userId: siswa1.id,
        quizId: quizPersamaanLinear.id,
        answers: {
          '1': 'A',
          '2': 'B',
          '3': 'A',
          '4': 'A',
        },
        score: 100,
        maxScore: 100,
        percentage: 100,
        passed: true,
        timeSpent: 1200, // 20 minutes in seconds
        startedAt: new Date(Date.now() - 1200000), // 20 minutes ago
        completedAt: new Date(),
      })
      .onConflictDoNothing();

    console.log('✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- 4 Users (1 Admin, 1 Guru, 2 Siswa)');
    console.log('- 3 Grades (Kelas 10, 11, 12)');
    console.log('- 3 Subjects (Matematika, Fisika, Kimia)');
    console.log('- 3 Chapters (Aljabar, Geometri, Trigonometri)');
    console.log('- 3 Subchapters (Persamaan Linear, Kuadrat, Pertidaksamaan)');
    console.log('- 1 AI Generated Content');
    console.log('- 3 User Progress entries');
    console.log('- 1 Quiz with 4 Questions');
    console.log('- 1 Quiz Attempt');
    console.log('\n🔐 Login Credentials:');
    console.log('Admin : admin@lms.com / Admin123!@#');
    console.log('Guru  : guru@lms.com / Guru123!@#');
    console.log('Siswa : siswa1@lms.com / Siswa123!@#');
    console.log('Siswa : siswa2@lms.com / Siswa123!@#');
    console.log('\n⚠️  IMPORTANT: Change these passwords in production!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await client.end();
  })
  .catch(async (e) => {
    console.error(e);
    await client.end();
    process.exit(1);
  });
