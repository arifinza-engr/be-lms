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

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
  console.log('🌱 Starting seed...');

  // Create Users
  console.log('👥 Creating users...');

  const [adminUser] = await db
    .insert(schema.users)
    .values({
      email: 'admin@lms.com',
      password: await bcrypt.hash('admin123', 12),
      name: 'Admin LMS',
      role: 'ADMIN',
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        name: 'Admin LMS',
        role: 'ADMIN',
      },
    })
    .returning();

  const [siswa1] = await db
    .insert(schema.users)
    .values({
      email: 'siswa1@lms.com',
      password: await bcrypt.hash('siswa123', 12),
      name: 'Ahmad Rizki',
      role: 'SISWA',
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        name: 'Ahmad Rizki',
        role: 'SISWA',
      },
    })
    .returning();

  const [siswa2] = await db
    .insert(schema.users)
    .values({
      email: 'siswa2@lms.com',
      password: await bcrypt.hash('siswa123', 12),
      name: 'Siti Nurhaliza',
      role: 'SISWA',
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: {
        name: 'Siti Nurhaliza',
        role: 'SISWA',
      },
    })
    .returning();

  // Create Grades
  console.log('🎓 Creating grades...');

  const [grade10] = await db
    .insert(schema.grades)
    .values({ title: 'Kelas 10 SMA' })
    .onConflictDoNothing()
    .returning();

  const [grade11] = await db
    .insert(schema.grades)
    .values({ title: 'Kelas 11 SMA' })
    .onConflictDoNothing()
    .returning();

  // Create Subjects
  console.log('📚 Creating subjects...');

  const [matematika10] = await db
    .insert(schema.subjects)
    .values({
      title: 'Matematika',
      gradeId: grade10.id,
    })
    .onConflictDoNothing()
    .returning();

  const [fisika10] = await db
    .insert(schema.subjects)
    .values({
      title: 'Fisika',
      gradeId: grade10.id,
    })
    .onConflictDoNothing()
    .returning();

  // Create Chapters
  console.log('📖 Creating chapters...');

  const [aljabar] = await db
    .insert(schema.chapters)
    .values({
      title: 'Aljabar',
      subjectId: matematika10.id,
    })
    .onConflictDoNothing()
    .returning();

  const [geometri] = await db
    .insert(schema.chapters)
    .values({
      title: 'Geometri',
      subjectId: matematika10.id,
    })
    .onConflictDoNothing()
    .returning();

  // Create Subchapters
  console.log('📝 Creating subchapters...');

  const [persamaanLinear] = await db
    .insert(schema.subchapters)
    .values({
      title: 'Persamaan Linear',
      chapterId: aljabar.id,
    })
    .onConflictDoNothing()
    .returning();

  const [persamaanKuadrat] = await db
    .insert(schema.subchapters)
    .values({
      title: 'Persamaan Kuadrat',
      chapterId: aljabar.id,
    })
    .onConflictDoNothing()
    .returning();

  // Create AI Generated Content
  console.log('🤖 Creating sample AI content...');

  await db
    .insert(schema.aiGeneratedContent)
    .values({
      subchapterId: persamaanLinear.id,
      content: `Persamaan linear adalah persamaan matematika yang memiliki bentuk ax + b = 0, di mana a dan b adalah konstanta dan x adalah variabel yang dicari nilainya.

Ciri-ciri persamaan linear:
1. Pangkat tertinggi variabel adalah 1
2. Tidak ada perkalian antar variabel
3. Grafik berupa garis lurus

Contoh:
- 2x + 5 = 0
- 3x - 7 = 2x + 1
- x/2 + 3 = 8

Gunakan operasi aljabar dasar untuk menyelesaikan.`,
      audioUrl: 'https://example.com/audio/persamaan-linear.mp3',
      isInitial: true,
    })
    .onConflictDoNothing();

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
    .onConflictDoNothing();

  // Create Quiz
  console.log('📝 Creating sample quiz...');

  const [quizPersamaanLinear] = await db
    .insert(schema.quizzes)
    .values({
      subchapterId: persamaanLinear.id,
      title: 'Quiz: Persamaan Linear',
      description: 'Quiz untuk menguji pemahaman tentang persamaan linear',
    })
    .onConflictDoNothing()
    .returning();

  if (quizPersamaanLinear) {
    await db.insert(schema.quizQuestions).values([
      {
        quizId: quizPersamaanLinear.id,
        question: 'Nilai x dari persamaan 3x + 7 = 22 adalah...',
        options: ['A. 5', 'B. 4', 'C. 6', 'D. 3'],
        correctAnswer: 'A',
        explanation: 'Langkah: 3x + 7 = 22 → 3x = 15 → x = 5',
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
          'Persamaan linear memiliki pangkat tertinggi variabel adalah 1',
      },
    ]);
  }

  // Selesai
  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- 3 Users (1 Admin, 2 Siswa)');
  console.log('- 2 Grades (Kelas 10, 11)');
  console.log('- 2 Subjects');
  console.log('- 2 Chapters');
  console.log('- 2 Subchapters');
  console.log('- 1 AI Generated Content');
  console.log('- 1 User Progress');
  console.log('- 1 Quiz with 2 Questions');
  console.log('\n🔐 Login Credentials:');
  console.log('Admin : admin@lms.com / admin123');
  console.log('Siswa : siswa1@lms.com / siswa123');
  console.log('Siswa : siswa2@lms.com / siswa123');
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
