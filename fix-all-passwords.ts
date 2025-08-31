// fix-all-passwords.ts - Fix all user passwords
import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './src/database/schema';
import { eq } from 'drizzle-orm';

async function fixAllPasswords() {
  console.log('🔧 Fixing all user passwords...\n');

  try {
    // Database connection
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://reffrains:reffrains@192.168.1.205:5432/zonaajar';
    const sql = postgres(connectionString);
    const db = drizzle(sql);

    // Define password mappings
    const passwordMappings = [
      { email: 'admin@lms.com', password: 'Admin123!@#' },
      { email: 'admin2@lms.com', password: 'Admin123!@#' },
      { email: 'guru1@lms.com', password: 'Guru123!@#' },
      { email: 'guru2@lms.com', password: 'Guru123!@#' },
      { email: 'guru3@lms.com', password: 'Guru123!@#' },
      { email: 'siswa1@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa2@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa3@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa4@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa5@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa6@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa7@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa8@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa9@lms.com', password: 'Siswa123!@#' },
      { email: 'siswa10@lms.com', password: 'Siswa123!@#' },
    ];

    console.log('🔐 Updating passwords for all users...');

    for (const mapping of passwordMappings) {
      const hashedPassword = await bcrypt.hash(mapping.password, 12);

      const result = await db
        .update(users)
        .set({
          password: hashedPassword,
          emailVerified: true,
          isActive: true,
        })
        .where(eq(users.email, mapping.email))
        .returning();

      if (result.length > 0) {
        console.log(`✅ Updated password for: ${mapping.email}`);
      } else {
        console.log(`⚠️  User not found: ${mapping.email}`);
      }
    }

    console.log('\n🧪 Testing password verification...');

    // Test a few passwords
    const testUsers = ['admin@lms.com', 'siswa1@lms.com', 'guru1@lms.com'];

    for (const email of testUsers) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (user.length > 0) {
        const mapping = passwordMappings.find((m) => m.email === email);
        if (mapping) {
          const isValid = await bcrypt.compare(
            mapping.password,
            user[0].password,
          );
          console.log(
            `${isValid ? '✅' : '❌'} ${email}: ${isValid ? 'VALID' : 'INVALID'}`,
          );
        }
      }
    }

    await sql.end();
    console.log('\n🎉 All passwords updated successfully!');
  } catch (error) {
    console.error('❌ Fix passwords error:', error.message);
  }
}

fixAllPasswords();
