// fix-admin.ts - Fix admin password
import * as bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './src/database/schema';
import { eq } from 'drizzle-orm';

async function fixAdmin() {
  console.log('🔧 Fixing admin password...\n');

  try {
    // Database connection
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://reffrains:reffrains@192.168.1.205:5432/zonaajar';
    const sql = postgres(connectionString);
    const db = drizzle(sql);

    // Hash the correct password
    const correctPassword = 'Admin123!@#';
    const hashedPassword = await bcrypt.hash(correctPassword, 12);

    console.log('🔐 Creating new password hash...');
    console.log('Password:', correctPassword);
    console.log('Hash:', hashedPassword.substring(0, 20) + '...');

    // Update admin user
    const result = await db
      .update(users)
      .set({
        password: hashedPassword,
        emailVerified: true,
        isActive: true,
      })
      .where(eq(users.email, 'admin@lms.com'))
      .returning();

    if (result.length > 0) {
      console.log('✅ Admin password updated successfully');

      // Test the new password
      const testResult = await bcrypt.compare(correctPassword, hashedPassword);
      console.log('🧪 Password verification test:', testResult);
    } else {
      console.log('❌ Admin user not found or not updated');
    }

    await sql.end();
  } catch (error) {
    console.error('❌ Fix admin error:', error.message);
  }
}

fixAdmin();
