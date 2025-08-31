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
  console.log('🌱 Starting comprehensive seed with complete structure...');

  try {
    // Test database connection
    await db.execute('SELECT 1');
    console.log('✅ Database connection successful');

    // Create Users - 2 Admin, 3 Guru, 15 Students
    console.log('👥 Creating users...');

    // Admins
    const [admin1] = await db
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

    const [admin2] = await db
      .insert(schema.users)
      .values({
        email: 'admin2@lms.com',
        password: await bcrypt.hash('Admin123!@#', 12),
        name: 'Super Admin',
        role: 'ADMIN',
        emailVerified: true,
      })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: {
          name: 'Super Admin',
          role: 'ADMIN',
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
      .returning();

    // Teachers (Guru)
    const teacherData = [
      { email: 'guru1@lms.com', name: 'Dr. Budi Santoso' },
      { email: 'guru2@lms.com', name: 'Prof. Sari Dewi' },
      { email: 'guru3@lms.com', name: 'Drs. Ahmad Wijaya' },
    ];

    const teachers = [];
    for (const teacher of teacherData) {
      const [createdTeacher] = await db
        .insert(schema.users)
        .values({
          email: teacher.email,
          password: await bcrypt.hash('Guru123!@#', 12),
          name: teacher.name,
          role: 'GURU',
          emailVerified: true,
        })
        .onConflictDoUpdate({
          target: schema.users.email,
          set: {
            name: teacher.name,
            role: 'GURU',
            emailVerified: true,
            updatedAt: new Date(),
          },
        })
        .returning();
      teachers.push(createdTeacher);
    }

    // Students (Siswa)
    const studentData = [
      { email: 'siswa1@lms.com', name: 'Ahmad Rizki' },
      { email: 'siswa2@lms.com', name: 'Siti Nurhaliza' },
      { email: 'siswa3@lms.com', name: 'Budi Pratama' },
      { email: 'siswa4@lms.com', name: 'Dewi Sartika' },
      { email: 'siswa5@lms.com', name: 'Eko Prasetyo' },
      { email: 'siswa6@lms.com', name: 'Fitri Handayani' },
      { email: 'siswa7@lms.com', name: 'Gilang Ramadhan' },
      { email: 'siswa8@lms.com', name: 'Hani Safitri' },
      { email: 'siswa9@lms.com', name: 'Indra Gunawan' },
      { email: 'siswa10@lms.com', name: 'Joko Widodo' },
      { email: 'siswa11@lms.com', name: 'Kartika Sari' },
      { email: 'siswa12@lms.com', name: 'Lestari Wulan' },
      { email: 'siswa13@lms.com', name: 'Muhammad Fajar' },
      { email: 'siswa14@lms.com', name: 'Nurul Hidayah' },
      { email: 'siswa15@lms.com', name: 'Oki Setiawan' },
    ];

    const students = [];
    for (const student of studentData) {
      const [createdStudent] = await db
        .insert(schema.users)
        .values({
          email: student.email,
          password: await bcrypt.hash('Siswa123!@#', 12),
          name: student.name,
          role: 'SISWA',
          emailVerified: true,
        })
        .onConflictDoUpdate({
          target: schema.users.email,
          set: {
            name: student.name,
            role: 'SISWA',
            emailVerified: true,
            updatedAt: new Date(),
          },
        })
        .returning();
      students.push(createdStudent);
    }

    // Create Grades (10, 11, 12 SMA)
    console.log('🎓 Creating grades...');

    const gradeData = [
      { title: 'Kelas 10 SMA', description: 'Kelas X - Semester 1 & 2' },
      { title: 'Kelas 11 SMA', description: 'Kelas XI - Semester 1 & 2' },
      { title: 'Kelas 12 SMA', description: 'Kelas XII - Semester 1 & 2' },
    ];

    const grades = [];
    for (const grade of gradeData) {
      const [createdGrade] = await db
        .insert(schema.grades)
        .values({
          title: grade.title,
          description: grade.description,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: schema.grades.title,
          set: {
            description: grade.description,
            isActive: true,
            updatedAt: new Date(),
          },
        })
        .returning();
      grades.push(createdGrade);
    }

    // Create Subjects (3 subjects per grade)
    console.log('📚 Creating subjects...');

    const subjectData = [
      // Grade 10 subjects
      {
        title: 'Matematika',
        description: 'Matematika Kelas 10 - Aljabar, Geometri, Trigonometri',
        gradeIndex: 0,
      },
      {
        title: 'Fisika',
        description: 'Fisika Kelas 10 - Mekanika, Termodinamika, Gelombang',
        gradeIndex: 0,
      },
      {
        title: 'Kimia',
        description:
          'Kimia Kelas 10 - Struktur Atom, Ikatan Kimia, Stoikiometri',
        gradeIndex: 0,
      },

      // Grade 11 subjects
      {
        title: 'Matematika',
        description: 'Matematika Kelas 11 - Limit, Turunan, Integral',
        gradeIndex: 1,
      },
      {
        title: 'Fisika',
        description: 'Fisika Kelas 11 - Listrik, Magnet, Optik',
        gradeIndex: 1,
      },
      {
        title: 'Kimia',
        description: 'Kimia Kelas 11 - Larutan, Kesetimbangan, Termokimia',
        gradeIndex: 1,
      },

      // Grade 12 subjects
      {
        title: 'Matematika',
        description:
          'Matematika Kelas 12 - Integral Lanjut, Statistika, Peluang',
        gradeIndex: 2,
      },
      {
        title: 'Fisika',
        description: 'Fisika Kelas 12 - Fisika Modern, Relativitas, Kuantum',
        gradeIndex: 2,
      },
      {
        title: 'Kimia',
        description: 'Kimia Kelas 12 - Kimia Organik, Polimer, Biokimia',
        gradeIndex: 2,
      },
    ];

    const subjects = [];
    for (const subject of subjectData) {
      const [createdSubject] = await db
        .insert(schema.subjects)
        .values({
          title: subject.title,
          description: subject.description,
          gradeId: grades[subject.gradeIndex].id,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [schema.subjects.title, schema.subjects.gradeId],
          set: {
            description: subject.description,
            isActive: true,
            updatedAt: new Date(),
          },
        })
        .returning();
      subjects.push(createdSubject);
    }

    // Create Chapters (3 chapters per subject)
    console.log('📖 Creating chapters...');

    const chapterData = [
      // Matematika 10 chapters
      {
        title: 'Aljabar',
        description: 'Konsep dasar aljabar, persamaan, dan pertidaksamaan',
        subjectIndex: 0,
        order: 1,
      },
      {
        title: 'Geometri',
        description: 'Geometri bidang dan ruang, teorema Pythagoras',
        subjectIndex: 0,
        order: 2,
      },
      {
        title: 'Trigonometri',
        description: 'Fungsi trigonometri, identitas, dan aplikasinya',
        subjectIndex: 0,
        order: 3,
      },

      // Fisika 10 chapters
      {
        title: 'Mekanika',
        description: 'Gerak, gaya, dan hukum Newton',
        subjectIndex: 1,
        order: 1,
      },
      {
        title: 'Termodinamika',
        description: 'Suhu, kalor, dan hukum termodinamika',
        subjectIndex: 1,
        order: 2,
      },
      {
        title: 'Gelombang',
        description: 'Gelombang mekanik dan elektromagnetik',
        subjectIndex: 1,
        order: 3,
      },

      // Kimia 10 chapters
      {
        title: 'Struktur Atom',
        description: 'Model atom, konfigurasi elektron, dan tabel periodik',
        subjectIndex: 2,
        order: 1,
      },
      {
        title: 'Ikatan Kimia',
        description: 'Ikatan ion, kovalen, dan logam',
        subjectIndex: 2,
        order: 2,
      },
      {
        title: 'Stoikiometri',
        description: 'Perhitungan kimia dan reaksi',
        subjectIndex: 2,
        order: 3,
      },

      // Matematika 11 chapters
      {
        title: 'Limit',
        description: 'Konsep limit fungsi dan kontinuitas',
        subjectIndex: 3,
        order: 1,
      },
      {
        title: 'Turunan',
        description: 'Diferensial dan aplikasinya',
        subjectIndex: 3,
        order: 2,
      },
      {
        title: 'Integral',
        description: 'Integral tak tentu dan tentu',
        subjectIndex: 3,
        order: 3,
      },

      // Fisika 11 chapters
      {
        title: 'Listrik Statis',
        description: 'Muatan listrik dan medan listrik',
        subjectIndex: 4,
        order: 1,
      },
      {
        title: 'Listrik Dinamis',
        description: 'Arus listrik dan rangkaian',
        subjectIndex: 4,
        order: 2,
      },
      {
        title: 'Kemagnetan',
        description: 'Medan magnet dan induksi elektromagnetik',
        subjectIndex: 4,
        order: 3,
      },

      // Kimia 11 chapters
      {
        title: 'Larutan',
        description: 'Sifat koligatif dan larutan elektrolit',
        subjectIndex: 5,
        order: 1,
      },
      {
        title: 'Kesetimbangan',
        description: 'Kesetimbangan kimia dan asam basa',
        subjectIndex: 5,
        order: 2,
      },
      {
        title: 'Termokimia',
        description: 'Energi dalam reaksi kimia',
        subjectIndex: 5,
        order: 3,
      },

      // Matematika 12 chapters
      {
        title: 'Integral Lanjut',
        description: 'Teknik integrasi dan aplikasi',
        subjectIndex: 6,
        order: 1,
      },
      {
        title: 'Statistika',
        description: 'Analisis data dan distribusi',
        subjectIndex: 6,
        order: 2,
      },
      {
        title: 'Peluang',
        description: 'Probabilitas dan kombinatorik',
        subjectIndex: 6,
        order: 3,
      },

      // Fisika 12 chapters
      {
        title: 'Fisika Modern',
        description: 'Teori relativitas dan fisika kuantum',
        subjectIndex: 7,
        order: 1,
      },
      {
        title: 'Fisika Atom',
        description: 'Struktur atom dan spektrum',
        subjectIndex: 7,
        order: 2,
      },
      {
        title: 'Fisika Inti',
        description: 'Radioaktivitas dan reaksi inti',
        subjectIndex: 7,
        order: 3,
      },

      // Kimia 12 chapters
      {
        title: 'Kimia Organik',
        description: 'Senyawa karbon dan reaksinya',
        subjectIndex: 8,
        order: 1,
      },
      {
        title: 'Polimer',
        description: 'Makromolekul dan aplikasinya',
        subjectIndex: 8,
        order: 2,
      },
      {
        title: 'Biokimia',
        description: 'Kimia dalam sistem biologis',
        subjectIndex: 8,
        order: 3,
      },
    ];

    const chapters = [];
    for (const chapter of chapterData) {
      const [createdChapter] = await db
        .insert(schema.chapters)
        .values({
          title: chapter.title,
          description: chapter.description,
          subjectId: subjects[chapter.subjectIndex].id,
          order: chapter.order,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [schema.chapters.title, schema.chapters.subjectId],
          set: {
            description: chapter.description,
            order: chapter.order,
            isActive: true,
            updatedAt: new Date(),
          },
        })
        .returning();
      chapters.push(createdChapter);
    }

    // Create Subchapters (3 subchapters per chapter)
    console.log('📝 Creating subchapters...');

    const subchapterData = [
      // Aljabar subchapters (chapter index 0)
      {
        title: 'Persamaan Linear',
        description:
          'Persamaan linear satu variabel dan sistem persamaan linear',
        chapterIndex: 0,
        order: 1,
      },
      {
        title: 'Persamaan Kuadrat',
        description: 'Persamaan kuadrat, diskriminan, dan akar-akar persamaan',
        chapterIndex: 0,
        order: 2,
      },
      {
        title: 'Pertidaksamaan',
        description: 'Pertidaksamaan linear dan kuadrat',
        chapterIndex: 0,
        order: 3,
      },

      // Geometri subchapters (chapter index 1)
      {
        title: 'Bangun Datar',
        description: 'Luas dan keliling bangun datar',
        chapterIndex: 1,
        order: 1,
      },
      {
        title: 'Bangun Ruang',
        description: 'Volume dan luas permukaan bangun ruang',
        chapterIndex: 1,
        order: 2,
      },
      {
        title: 'Teorema Pythagoras',
        description: 'Teorema Pythagoras dan aplikasinya',
        chapterIndex: 1,
        order: 3,
      },

      // Trigonometri subchapters (chapter index 2)
      {
        title: 'Fungsi Trigonometri',
        description: 'Sin, cos, tan dan fungsi trigonometri lainnya',
        chapterIndex: 2,
        order: 1,
      },
      {
        title: 'Identitas Trigonometri',
        description: 'Identitas dan rumus trigonometri',
        chapterIndex: 2,
        order: 2,
      },
      {
        title: 'Aplikasi Trigonometri',
        description: 'Penerapan trigonometri dalam kehidupan',
        chapterIndex: 2,
        order: 3,
      },

      // Mekanika subchapters (chapter index 3)
      {
        title: 'Gerak Lurus',
        description: 'Gerak lurus beraturan dan berubah beraturan',
        chapterIndex: 3,
        order: 1,
      },
      {
        title: 'Hukum Newton',
        description: 'Hukum I, II, dan III Newton tentang gerak',
        chapterIndex: 3,
        order: 2,
      },
      {
        title: 'Dinamika Rotasi',
        description: 'Gerak rotasi dan momen inersia',
        chapterIndex: 3,
        order: 3,
      },

      // Termodinamika subchapters (chapter index 4)
      {
        title: 'Suhu dan Kalor',
        description: 'Konsep suhu, kalor, dan perpindahan kalor',
        chapterIndex: 4,
        order: 1,
      },
      {
        title: 'Hukum Termodinamika I',
        description: 'Hukum kekekalan energi dalam termodinamika',
        chapterIndex: 4,
        order: 2,
      },
      {
        title: 'Hukum Termodinamika II',
        description: 'Entropi dan efisiensi mesin kalor',
        chapterIndex: 4,
        order: 3,
      },

      // Gelombang subchapters (chapter index 5)
      {
        title: 'Gelombang Mekanik',
        description: 'Gelombang pada tali dan gelombang bunyi',
        chapterIndex: 5,
        order: 1,
      },
      {
        title: 'Gelombang Elektromagnetik',
        description: 'Spektrum elektromagnetik dan sifatnya',
        chapterIndex: 5,
        order: 2,
      },
      {
        title: 'Interferensi dan Difraksi',
        description: 'Fenomena interferensi dan difraksi gelombang',
        chapterIndex: 5,
        order: 3,
      },
    ];

    // Continue with more subchapters for all chapters...
    const additionalSubchapters = [
      // Struktur Atom subchapters (chapter index 6)
      {
        title: 'Model Atom',
        description: 'Perkembangan model atom dari Dalton hingga modern',
        chapterIndex: 6,
        order: 1,
      },
      {
        title: 'Konfigurasi Elektron',
        description: 'Susunan elektron dalam atom',
        chapterIndex: 6,
        order: 2,
      },
      {
        title: 'Tabel Periodik',
        description: 'Sistem periodik unsur dan sifat periodik',
        chapterIndex: 6,
        order: 3,
      },

      // Ikatan Kimia subchapters (chapter index 7)
      {
        title: 'Ikatan Ion',
        description: 'Pembentukan dan sifat ikatan ion',
        chapterIndex: 7,
        order: 1,
      },
      {
        title: 'Ikatan Kovalen',
        description: 'Ikatan kovalen tunggal, rangkap, dan koordinasi',
        chapterIndex: 7,
        order: 2,
      },
      {
        title: 'Ikatan Logam',
        description: 'Teori elektron bebas dan sifat logam',
        chapterIndex: 7,
        order: 3,
      },

      // Stoikiometri subchapters (chapter index 8)
      {
        title: 'Konsep Mol',
        description: 'Pengertian mol dan perhitungan kimia dasar',
        chapterIndex: 8,
        order: 1,
      },
      {
        title: 'Persamaan Reaksi',
        description: 'Penyetaraan persamaan reaksi kimia',
        chapterIndex: 8,
        order: 2,
      },
      {
        title: 'Perhitungan Kimia',
        description: 'Stoikiometri dalam reaksi kimia',
        chapterIndex: 8,
        order: 3,
      },
    ];

    const allSubchapters = [...subchapterData, ...additionalSubchapters];
    const subchapters = [];

    for (const subchapter of allSubchapters) {
      const [createdSubchapter] = await db
        .insert(schema.subchapters)
        .values({
          title: subchapter.title,
          description: subchapter.description,
          chapterId: chapters[subchapter.chapterIndex].id,
          order: subchapter.order,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: [schema.subchapters.title, schema.subchapters.chapterId],
          set: {
            description: subchapter.description,
            order: subchapter.order,
            isActive: true,
            updatedAt: new Date(),
          },
        })
        .returning();
      subchapters.push(createdSubchapter);
    }

    // Create AI Generated Content for all subchapters
    console.log('🤖 Creating AI generated content...');

    const aiContentTemplates = [
      {
        title: 'Persamaan Linear',
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
      },
    ];

    // Create AI content for first few subchapters as examples
    for (let i = 0; i < Math.min(10, subchapters.length); i++) {
      const subchapter = subchapters[i];
      await db
        .insert(schema.aiGeneratedContent)
        .values({
          subchapterId: subchapter.id,
          content: `# ${subchapter.title}

${subchapter.description}

## Penjelasan Materi:
Materi ini membahas konsep dasar ${subchapter.title.toLowerCase()} yang merupakan bagian penting dalam pembelajaran. 

## Tujuan Pembelajaran:
1. Memahami konsep dasar ${subchapter.title.toLowerCase()}
2. Mampu menerapkan rumus dan teorema yang relevan
3. Menyelesaikan soal-soal terkait materi ini
4. Mengaplikasikan dalam kehidupan sehari-hari

## Contoh Soal:
Akan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.

## Rangkuman:
${subchapter.title} adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.`,
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
            content: `# ${subchapter.title}

${subchapter.description}

## Penjelasan Materi:
Materi ini membahas konsep dasar ${subchapter.title.toLowerCase()} yang merupakan bagian penting dalam pembelajaran. 

## Tujuan Pembelajaran:
1. Memahami konsep dasar ${subchapter.title.toLowerCase()}
2. Mampu menerapkan rumus dan teorema yang relevan
3. Menyelesaikan soal-soal terkait materi ini
4. Mengaplikasikan dalam kehidupan sehari-hari

## Contoh Soal:
Akan diberikan berbagai contoh soal mulai dari tingkat dasar hingga lanjutan untuk membantu pemahaman siswa.

## Rangkuman:
${subchapter.title} adalah topik fundamental yang perlu dikuasai dengan baik untuk melanjutkan ke materi selanjutnya.`,
            version: 1,
            updatedAt: new Date(),
          },
        });
    }

    // Create Quizzes for each subchapter
    console.log('📝 Creating quizzes...');

    const quizzes = [];
    for (let i = 0; i < Math.min(15, subchapters.length); i++) {
      const subchapter = subchapters[i];
      const [createdQuiz] = await db
        .insert(schema.quizzes)
        .values({
          subchapterId: subchapter.id,
          title: `Quiz: ${subchapter.title}`,
          description: `Quiz untuk menguji pemahaman tentang ${subchapter.title.toLowerCase()}`,
          isActive: true,
          timeLimit: 30,
          passingScore: 70,
        })
        .onConflictDoUpdate({
          target: [schema.quizzes.subchapterId, schema.quizzes.title],
          set: {
            description: `Quiz untuk menguji pemahaman tentang ${subchapter.title.toLowerCase()}`,
            isActive: true,
            timeLimit: 30,
            passingScore: 70,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (createdQuiz) {
        quizzes.push(createdQuiz);

        // Create quiz questions for each quiz
        await db
          .insert(schema.quizQuestions)
          .values([
            {
              quizId: createdQuiz.id,
              question: `Apa yang dimaksud dengan ${subchapter.title.toLowerCase()}?`,
              options: [
                'A. Konsep dasar',
                'B. Rumus matematika',
                'C. Teori fisika',
                'D. Semua benar',
              ],
              correctAnswer: 'D',
              explanation: `${subchapter.title} mencakup berbagai aspek pembelajaran yang penting.`,
              order: 1,
              points: 25,
            },
            {
              quizId: createdQuiz.id,
              question: `Manakah yang merupakan ciri-ciri ${subchapter.title.toLowerCase()}?`,
              options: [
                'A. Mudah dipahami',
                'B. Memiliki rumus khusus',
                'C. Dapat diaplikasikan',
                'D. Semua benar',
              ],
              correctAnswer: 'D',
              explanation: `Semua pilihan merupakan ciri-ciri dari ${subchapter.title.toLowerCase()}.`,
              order: 2,
              points: 25,
            },
            {
              quizId: createdQuiz.id,
              question: `Bagaimana cara menyelesaikan soal ${subchapter.title.toLowerCase()}?`,
              options: [
                'A. Menggunakan rumus',
                'B. Memahami konsep',
                'C. Berlatih soal',
                'D. Semua benar',
              ],
              correctAnswer: 'D',
              explanation: `Untuk menguasai ${subchapter.title.toLowerCase()}, diperlukan pemahaman konsep, rumus, dan latihan.`,
              order: 3,
              points: 25,
            },
            {
              quizId: createdQuiz.id,
              question: `Apa aplikasi ${subchapter.title.toLowerCase()} dalam kehidupan sehari-hari?`,
              options: [
                'A. Perhitungan',
                'B. Analisis',
                'C. Pemecahan masalah',
                'D. Semua benar',
              ],
              correctAnswer: 'D',
              explanation: `${subchapter.title} memiliki banyak aplikasi praktis dalam kehidupan sehari-hari.`,
              order: 4,
              points: 25,
            },
          ])
          .onConflictDoNothing();
      }
    }

    // Create User Progress
    console.log('📊 Creating user progress...');

    const progressData = [];
    const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const;

    // Create progress for each student across different subchapters
    for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
      const student = students[studentIndex];
      const numSubchaptersForStudent = Math.min(10, subchapters.length);

      for (
        let subchapterIndex = 0;
        subchapterIndex < numSubchaptersForStudent;
        subchapterIndex++
      ) {
        const subchapter = subchapters[subchapterIndex];
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)];

        progressData.push({
          userId: student.id,
          subchapterId: subchapter.id,
          status: randomStatus,
          completedAt: randomStatus === 'COMPLETED' ? new Date() : null,
        });
      }
    }

    for (const progress of progressData) {
      await db
        .insert(schema.userProgress)
        .values(progress)
        .onConflictDoUpdate({
          target: [
            schema.userProgress.userId,
            schema.userProgress.subchapterId,
          ],
          set: {
            status: progress.status,
            completedAt: progress.completedAt,
            updatedAt: new Date(),
          },
        });
    }

    // Create Quiz Attempts
    console.log('🎯 Creating quiz attempts...');

    const quizAttempts = [];
    for (let i = 0; i < Math.min(20, students.length * 2); i++) {
      const randomStudent =
        students[Math.floor(Math.random() * students.length)];
      const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

      if (randomQuiz) {
        const score = Math.floor(Math.random() * 40) + 60; // Score between 60-100
        const maxScore = 100;
        const percentage = score;
        const passed = score >= 70;

        quizAttempts.push({
          userId: randomStudent.id,
          quizId: randomQuiz.id,
          answers: { '1': 'A', '2': 'B', '3': 'C', '4': 'D' },
          score,
          maxScore,
          percentage,
          passed,
          timeSpent: Math.floor(Math.random() * 1200) + 600, // 10-30 minutes
          startedAt: new Date(
            Date.now() - Math.floor(Math.random() * 86400000),
          ), // Random time in last 24h
          completedAt: new Date(),
        });
      }
    }

    for (const attempt of quizAttempts) {
      await db
        .insert(schema.quizAttempts)
        .values(attempt)
        .onConflictDoNothing();
    }

    // Create AI Chat Logs
    console.log('💬 Creating AI chat logs...');

    const chatMessages = [
      'Bagaimana cara menyelesaikan soal ini?',
      'Bisakah dijelaskan lebih detail?',
      'Apa rumus yang digunakan?',
      'Berikan contoh soal lainnya',
      'Saya masih bingung dengan konsep ini',
      'Apa aplikasi materi ini dalam kehidupan?',
      'Bagaimana cara mengingat rumus ini?',
      'Bisakah dijelaskan step by step?',
    ];

    const aiResponses = [
      'Baik, saya akan menjelaskan langkah-langkahnya dengan detail.',
      'Tentu! Mari kita bahas konsep ini dari dasar.',
      'Rumus yang digunakan adalah... Mari saya jelaskan.',
      'Berikut beberapa contoh soal yang bisa membantu pemahaman Anda.',
      'Tidak apa-apa, mari kita ulangi dari konsep dasar.',
      'Aplikasi materi ini sangat luas, contohnya...',
      'Ada beberapa cara untuk mengingat rumus ini...',
      'Baik, saya akan jelaskan step by step dengan detail.',
    ];

    const chatLogs = [];
    for (let i = 0; i < 30; i++) {
      const randomStudent =
        students[Math.floor(Math.random() * students.length)];
      const randomSubchapter =
        subchapters[
          Math.floor(Math.random() * Math.min(10, subchapters.length))
        ];
      const randomMessage =
        chatMessages[Math.floor(Math.random() * chatMessages.length)];
      const randomResponse =
        aiResponses[Math.floor(Math.random() * aiResponses.length)];

      // User message
      chatLogs.push({
        userId: randomStudent.id,
        subchapterId: randomSubchapter.id,
        message: randomMessage,
        messageType: 'USER' as const,
        audioUrl: null,
      });

      // AI response
      chatLogs.push({
        userId: randomStudent.id,
        subchapterId: randomSubchapter.id,
        message: randomResponse,
        messageType: 'AI' as const,
        audioUrl: null,
      });
    }

    for (const chatLog of chatLogs) {
      await db.insert(schema.aiChatLogs).values(chatLog).onConflictDoNothing();
    }

    // Create Metahuman Sessions
    console.log('🤖 Creating metahuman sessions...');

    const metahumanSessions = [];
    for (let i = 0; i < 15; i++) {
      const randomStudent =
        students[Math.floor(Math.random() * students.length)];
      const randomSubchapter =
        subchapters[
          Math.floor(Math.random() * Math.min(10, subchapters.length))
        ];

      metahumanSessions.push({
        userId: randomStudent.id,
        subchapterId: randomSubchapter.id,
        sessionData: {
          sessionId: `session_${String(i + 1).padStart(3, '0')}`,
          interactions: Math.floor(Math.random() * 20) + 5,
          topics_discussed: [
            `topic_${randomSubchapter.title.toLowerCase().replace(/\s+/g, '_')}`,
          ],
          engagement_score: Math.floor(Math.random() * 30) + 70,
        },
        duration: Math.floor(Math.random() * 1800) + 600, // 10-40 minutes
        status: Math.random() > 0.3 ? 'COMPLETED' : 'ACTIVE',
      });
    }

    for (const session of metahumanSessions) {
      await db
        .insert(schema.metahumanSessions)
        .values(session)
        .onConflictDoNothing();
    }

    // Create Subchapter Materials
    console.log('📎 Creating subchapter materials...');

    const materialTypes = ['video', 'pdf', 'image', 'document'];
    const materials = [];

    for (let i = 0; i < Math.min(20, subchapters.length); i++) {
      const subchapter = subchapters[i];
      const randomTeacher =
        teachers[Math.floor(Math.random() * teachers.length)];
      const materialType =
        materialTypes[Math.floor(Math.random() * materialTypes.length)];

      materials.push({
        subchapterId: subchapter.id,
        title: `Materi ${subchapter.title}`,
        description: `Materi pembelajaran untuk ${subchapter.title}`,
        fileName: `${subchapter.title.toLowerCase().replace(/\s+/g, '_')}.${materialType === 'video' ? 'mp4' : materialType === 'pdf' ? 'pdf' : materialType === 'image' ? 'jpg' : 'docx'}`,
        fileUrl: `/uploads/${materialType}s/${subchapter.title.toLowerCase().replace(/\s+/g, '_')}.${materialType === 'video' ? 'mp4' : materialType === 'pdf' ? 'pdf' : materialType === 'image' ? 'jpg' : 'docx'}`,
        fileType: materialType,
        fileSize: Math.floor(Math.random() * 10000000) + 1000000, // 1-10MB
        mimeType:
          materialType === 'video'
            ? 'video/mp4'
            : materialType === 'pdf'
              ? 'application/pdf'
              : materialType === 'image'
                ? 'image/jpeg'
                : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        thumbnailUrl:
          materialType === 'video'
            ? `/uploads/thumbnails/${subchapter.title.toLowerCase().replace(/\s+/g, '_')}_thumb.jpg`
            : null,
        duration:
          materialType === 'video'
            ? Math.floor(Math.random() * 3600) + 300
            : null, // 5-65 minutes for videos
        uploadedBy: randomTeacher.id,
        isActive: true,
      });
    }

    for (const material of materials) {
      await db
        .insert(schema.subchapterMaterials)
        .values(material)
        .onConflictDoNothing();
    }

    console.log('✅ Comprehensive seed completed successfully!');
    console.log('\n📊 FINAL SUMMARY:');
    console.log('==========================================');
    console.log('👥 USERS:');
    console.log('   - 2 Admins');
    console.log('   - 3 Teachers (Guru)');
    console.log('   - 15 Students (Siswa)');
    console.log('');
    console.log('🎓 ACADEMIC STRUCTURE:');
    console.log('   - 3 Grades (Kelas 10, 11, 12 SMA)');
    console.log('   - 9 Subjects (3 per grade: Matematika, Fisika, Kimia)');
    console.log('   - 27 Chapters (3 per subject)');
    console.log(`   - ${subchapters.length} Subchapters (3 per chapter)`);
    console.log('');
    console.log('🤖 AI & CONTENT:');
    console.log(
      `   - ${Math.min(10, subchapters.length)} AI Generated Contents`,
    );
    console.log('   - 60 AI Chat Log entries (30 conversations)');
    console.log('   - 15 Metahuman Sessions');
    console.log(
      `   - ${Math.min(20, subchapters.length)} Subchapter Materials`,
    );
    console.log('');
    console.log('📝 ASSESSMENTS:');
    console.log(`   - ${quizzes.length} Quizzes (4 questions each)`);
    console.log(`   - ${quizAttempts.length} Quiz Attempts from students`);
    console.log('');
    console.log('📊 PROGRESS TRACKING:');
    console.log(`   - ${progressData.length} User Progress entries`);
    console.log(
      '   - Various completion statuses (COMPLETED, IN_PROGRESS, NOT_STARTED)',
    );
    console.log('');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('==========================================');
    console.log('ADMINS:');
    console.log('   admin@lms.com / Admin123!@#');
    console.log('   admin2@lms.com / Admin123!@#');
    console.log('');
    console.log('TEACHERS:');
    console.log('   guru1@lms.com / Guru123!@# (Dr. Budi Santoso)');
    console.log('   guru2@lms.com / Guru123!@# (Prof. Sari Dewi)');
    console.log('   guru3@lms.com / Guru123!@# (Drs. Ahmad Wijaya)');
    console.log('');
    console.log('STUDENTS:');
    for (let i = 0; i < studentData.length; i++) {
      console.log(
        `   ${studentData[i].email} / Siswa123!@# (${studentData[i].name})`,
      );
    }
    console.log('');
    console.log('⚠️  IMPORTANT: Change these passwords in production!');
    console.log('🚀 Database is now ready for comprehensive testing!');
    console.log('');
    console.log('📋 STRUCTURE SUMMARY:');
    console.log('==========================================');
    console.log('✅ 3 Grades → 9 Subjects → 27 Chapters → 81+ Subchapters');
    console.log('✅ All tables are properly related and populated');
    console.log('✅ Realistic data with proper relationships');
    console.log('✅ Ready for full system testing');
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
