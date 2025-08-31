# 🧪 API Materials Testing Guide

## 1. **Swagger UI Testing (Recommended)**

### Akses Swagger UI:

```
http://localhost:3000/api/docs
```

### Steps untuk Test File Upload:

1. **Login dulu untuk mendapatkan JWT token:**
   - Buka section "Authentication"
   - Klik "POST /auth/login"
   - Input email dan password
   - Copy JWT token dari response

2. **Authorize di Swagger:**
   - Klik tombol "Authorize" di pojok kanan atas
   - Input: `Bearer YOUR_JWT_TOKEN`
   - Klik "Authorize"

3. **Test Upload Materials:**
   - Buka section "File Upload & Materials"
   - Klik "POST /content/subchapters/{id}/materials"
   - Input subchapter ID
   - Klik "Choose File" untuk upload
   - Input title dan description
   - Klik "Execute"

### File Types untuk Testing:

- **Video**: `.mp4`, `.avi`, `.mov` (max 100MB)
- **PDF**: `.pdf` files
- **Images**: `.jpg`, `.png`, `.gif`, `.webp`
- **Documents**: `.doc`, `.docx`, `.ppt`, `.pptx`

---

## 2. **Postman Testing**

### Setup Postman Collection:

```json
{
  "info": {
    "name": "LMS Materials API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"admin@example.com\",\n  \"password\": \"password123\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "Upload Material",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/your/file.pdf"
            },
            {
              "key": "title",
              "value": "Sample PDF Material",
              "type": "text"
            },
            {
              "key": "description",
              "value": "This is a test PDF material",
              "type": "text"
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/content/subchapters/{{subchapterId}}/materials",
          "host": ["{{baseUrl}}"],
          "path": ["content", "subchapters", "{{subchapterId}}", "materials"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "accessToken",
      "value": ""
    },
    {
      "key": "subchapterId",
      "value": ""
    }
  ]
}
```

### Postman Steps:

1. Import collection di atas
2. Set environment variables
3. Run "Login" request, copy token
4. Set `accessToken` variable
5. Run "Upload Material" dengan file attachment

---

## 3. **cURL Commands**

### Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Upload Material:

```bash
curl -X POST http://localhost:3000/api/content/subchapters/SUBCHAPTER_ID/materials \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "title=Sample PDF Material" \
  -F "description=This is a test PDF material"
```

### Get Materials:

```bash
curl -X GET http://localhost:3000/api/content/subchapters/SUBCHAPTER_ID/materials \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. **Sample Test Files**

### Buat Sample Files untuk Testing:

```bash
# Create test directory
mkdir test-files
cd test-files

# Create sample PDF (using echo to create simple text file, then rename)
echo "This is a sample PDF content for testing" > sample.txt
# You can convert this to PDF or use any existing PDF

# Create sample image (you can use any image file)
# sample.jpg, sample.png, etc.

# Create sample video (you can use any small video file)
# sample.mp4, sample.avi, etc.

# Create sample document
echo "This is a sample document for testing" > sample.doc
```

### Atau Download Sample Files:

```bash
# Download sample files for testing
wget https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf -O sample.pdf
wget https://via.placeholder.com/300x200.png -O sample.png
```

---

## 5. **Frontend Testing dengan React**

### Test Component:

```tsx
import React, { useState } from 'react';

const MaterialUploadTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('description', 'Test upload from React');

    try {
      const response = await fetch(
        '/api/content/subchapters/SUBCHAPTER_ID/materials',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: formData,
        },
      );

      const result = await response.json();
      console.log('Upload result:', result);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.jpg,.png,.mp4,.doc,.docx"
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

export default MaterialUploadTest;
```

---

## 6. **Testing dengan Jest & Supertest**

### Test File:

```typescript
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as path from 'path';

describe('Materials API', () => {
  let app;
  let accessToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.access_token;
  });

  it('should upload material', async () => {
    const testFilePath = path.join(__dirname, 'fixtures', 'sample.pdf');

    const response = await request(app.getHttpServer())
      .post('/content/subchapters/test-subchapter-id/materials')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', testFilePath)
      .field('title', 'Test PDF')
      .field('description', 'Test description')
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test PDF');
  });

  it('should get materials', async () => {
    const response = await request(app.getHttpServer())
      .get('/content/subchapters/test-subchapter-id/materials')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body.materials)).toBe(true);
  });
});
```

---

## 7. **Quick Test Script**

### Create test script:

```bash
# create-test-script.sh
#!/bin/bash

echo "🧪 Testing Materials API..."

# Login and get token
echo "1. Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.access_token')

echo "Token: $TOKEN"

# Create a simple test file
echo "2. Creating test file..."
echo "This is a test file for materials API" > test-material.txt

# Upload the file
echo "3. Uploading material..."
curl -X POST http://localhost:3000/api/content/subchapters/YOUR_SUBCHAPTER_ID/materials \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-material.txt" \
  -F "title=Test Material" \
  -F "description=This is a test material"

echo "4. Getting materials..."
curl -X GET http://localhost:3000/api/content/subchapters/YOUR_SUBCHAPTER_ID/materials \
  -H "Authorization: Bearer $TOKEN"

# Cleanup
rm test-material.txt
echo "✅ Test completed!"
```

---

## 🎯 **Recommended Testing Flow:**

1. **Start with Swagger UI** - Paling mudah dan visual
2. **Use Postman** - Untuk testing yang lebih kompleks
3. **Create automated tests** - Untuk CI/CD pipeline
4. **Test with real frontend** - Untuk integration testing

## 📝 **Tips:**

- Gunakan file kecil untuk testing (< 10MB)
- Test berbagai format file yang didukung
- Pastikan JWT token masih valid
- Check response status dan error messages
- Test dengan user roles yang berbeda (ADMIN, GURU)

Mau saya buatkan script testing yang lebih spesifik untuk kebutuhan Anda?
