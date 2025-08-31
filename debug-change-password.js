// Debug script untuk change-password endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function debugChangePassword() {
  console.log('🔍 Debug Change Password Endpoint\n');

  try {
    // Step 1: Gunakan token yang sudah ada
    console.log('1. Menggunakan token yang sudah ada...');
    const accessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOGNmMTBlZC02Nzk1LTQxOTAtYmZkMS00Mzc4ZDdkMThlMmIiLCJlbWFpbCI6InJlZmZyYWluc3BhZXRAZ21haWwuY29tIiwicm9sZSI6IlNJU1dBIiwidHlwZSI6ImFjY2VzcyIsImlhdCI6MTc1NTc0NDk5NiwiZXhwIjoxNzU1NzQ1ODk2fQ.1-Ja-gfeGhavhpLAWHIonO1oCI1dZP0NZB2a042YjFk';
    const tokenType = 'Bearer';
    console.log(`✅ Token siap digunakan`);
    console.log(`   Token Type: ${tokenType}`);
    console.log(`   Token Length: ${accessToken.length}`);
    console.log(`   Token Preview: ${accessToken.substring(0, 50)}...`);

    // Step 2: Decode token untuk melihat payload (tanpa verifikasi)
    console.log('\n2. Decode token payload...');
    const tokenParts = accessToken.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(
        Buffer.from(tokenParts[1], 'base64').toString(),
      );
      console.log(`   User ID: ${payload.sub}`);
      console.log(`   Email: ${payload.email}`);
      console.log(`   Role: ${payload.role}`);
      console.log(`   Token Type: ${payload.type}`);
      console.log(
        `   Issued At: ${new Date(payload.iat * 1000).toISOString()}`,
      );
      console.log(
        `   Expires At: ${new Date(payload.exp * 1000).toISOString()}`,
      );
      console.log(`   Is Expired: ${Date.now() > payload.exp * 1000}`);
    }

    // Step 3: Test change password dengan token
    console.log('\n3. Test change password...');
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const changePasswordData = {
      currentPassword: 'Jem#12345', // Password saat ini
      newPassword: 'Finka#1324', // Password baru
      confirmPassword: 'Finka#1324', // Konfirmasi password baru
    };

    const changeResponse = await axios.post(
      `${BASE_URL}/auth/change-password`,
      changePasswordData,
      { headers },
    );

    console.log('✅ Change password berhasil!');
    console.log(`   Response: ${JSON.stringify(changeResponse.data)}`);

    // Step 4: Kembalikan password ke semula
    console.log('\n4. Kembalikan password ke semula...');
    const revertData = {
      currentPassword: 'Finka#1324',
      newPassword: 'Jem#12345',
      confirmPassword: 'Jem#12345',
    };

    await axios.post(`${BASE_URL}/auth/change-password`, revertData, {
      headers,
    });
    console.log('✅ Password dikembalikan ke semula');
  } catch (error) {
    console.error('\n❌ Error occurred:');

    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      console.error(
        `   Error Data:`,
        JSON.stringify(error.response.data, null, 2),
      );

      // Analisis error 401
      if (error.response.status === 401) {
        console.error('\n🔍 Analisis Error 401:');
        console.error('   - Pastikan token valid dan belum expired');
        console.error('   - Pastikan user masih aktif di database');
        console.error('   - Pastikan token type adalah "access"');
        console.error(
          '   - Pastikan JWT_SECRET sama dengan yang digunakan saat generate token',
        );
      }
    } else {
      console.error(`   Message: ${error.message}`);
    }
  }
}

// Jalankan debug
debugChangePassword();
