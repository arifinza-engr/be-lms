# File Upload System Enhancement for Zona Ajar LMS

## 🎯 Overview

This document outlines the enhancement needed to add file upload capabilities to the existing AI-powered LMS backend.

## 📋 Current State vs Enhanced State

### Current State (AI-Only)

```typescript
// Subchapter content structure
interface CurrentContent {
  subchapter: {
    id: string;
    title: string;
    description: string;
  };
  aiContent: {
    content: string; // AI-generated text
    audioUrl: string; // ElevenLabs TTS
  };
}
```

### Enhanced State (Hybrid AI + Files)

```typescript
// Enhanced content structure
interface EnhancedContent {
  subchapter: {
    id: string;
    title: string;
    description: string;
  };
  aiContent: {
    content: string; // AI-generated text
    audioUrl: string; // ElevenLabs TTS
  };
  materials: {
    videos: VideoMaterial[];
    documents: DocumentMaterial[];
    images: ImageMaterial[];
  };
}
```

## 🗄️ Database Schema Enhancement

### New Tables to Add

```sql
-- Materials table
CREATE TABLE subchapter_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subchapter_id UUID NOT NULL REFERENCES subchapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL, -- 'video', 'pdf', 'image', 'document'
  file_size INTEGER,
  mime_type VARCHAR(100),
  thumbnail_url TEXT,
  duration INTEGER, -- for videos in seconds
  uploaded_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_materials_subchapter ON subchapter_materials(subchapter_id);
CREATE INDEX idx_materials_type ON subchapter_materials(file_type);
CREATE INDEX idx_materials_active ON subchapter_materials(is_active);
```

### Drizzle Schema Addition

```typescript
// Add to src/database/schema.ts
export const subchapterMaterials = pgTable(
  'subchapter_materials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subchapterId: uuid('subchapter_id')
      .notNull()
      .references(() => subchapters.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    fileUrl: text('file_url').notNull(),
    fileType: varchar('file_type', { length: 50 }).notNull(),
    fileSize: integer('file_size'),
    mimeType: varchar('mime_type', { length: 100 }),
    thumbnailUrl: text('thumbnail_url'),
    duration: integer('duration'), // for videos
    uploadedBy: uuid('uploaded_by')
      .notNull()
      .references(() => users.id),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    subchapterIdx: index('materials_subchapter_idx').on(table.subchapterId),
    typeIdx: index('materials_type_idx').on(table.fileType),
    activeIdx: index('materials_active_idx').on(table.isActive),
  }),
);

// Relations
export const subchapterMaterialsRelations = relations(
  subchapterMaterials,
  ({ one }) => ({
    subchapter: one(subchapters, {
      fields: [subchapterMaterials.subchapterId],
      references: [subchapters.id],
    }),
    uploadedBy: one(users, {
      fields: [subchapterMaterials.uploadedBy],
      references: [users.id],
    }),
  }),
);
```

## 🛠️ Backend Implementation

### 1. Install Required Dependencies

```bash
npm install multer @types/multer @aws-sdk/client-s3 multer-s3
```

### 2. File Upload Service

```typescript
// src/common/services/file-upload.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as multer from 'multer';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.bucketName = this.configService.get('AWS_S3_BUCKET');
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);
    return `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
  }

  validateFile(file: Express.Multer.File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.mimetype);
  }

  validateFileSize(file: Express.Multer.File, maxSize: number): boolean {
    return file.size <= maxSize;
  }
}
```

### 3. Materials Service

```typescript
// src/content/materials.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { FileUploadService } from '@/common/services/file-upload.service';
import { subchapterMaterials } from '@/database/schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class MaterialsService {
  constructor(
    private database: DatabaseService,
    private fileUploadService: FileUploadService,
  ) {}

  async uploadMaterial(
    subchapterId: string,
    file: Express.Multer.File,
    title: string,
    description: string,
    uploadedBy: string,
  ) {
    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/webm',
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ];

    if (!this.fileUploadService.validateFile(file, allowedTypes)) {
      throw new BadRequestException('File type not allowed');
    }

    // Validate file size (100MB max)
    if (!this.fileUploadService.validateFileSize(file, 100 * 1024 * 1024)) {
      throw new BadRequestException('File size too large');
    }

    // Upload to S3
    const fileUrl = await this.fileUploadService.uploadFile(
      file,
      `materials/${subchapterId}`,
    );

    // Determine file type
    let fileType = 'document';
    if (file.mimetype.startsWith('video/')) fileType = 'video';
    else if (file.mimetype.startsWith('image/')) fileType = 'image';
    else if (file.mimetype === 'application/pdf') fileType = 'pdf';

    // Save to database
    const [material] = await this.database.db
      .insert(subchapterMaterials)
      .values({
        subchapterId,
        title,
        description,
        fileUrl,
        fileType,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy,
      })
      .returning();

    return material;
  }

  async getMaterialsBySubchapter(subchapterId: string) {
    return this.database.db.query.subchapterMaterials.findMany({
      where: and(
        eq(subchapterMaterials.subchapterId, subchapterId),
        eq(subchapterMaterials.isActive, true),
      ),
      with: {
        uploadedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (materials, { desc }) => [desc(materials.createdAt)],
    });
  }

  async deleteMaterial(id: string, userId: string) {
    const material = await this.database.db.query.subchapterMaterials.findFirst(
      {
        where: eq(subchapterMaterials.id, id),
      },
    );

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    // Only admin or uploader can delete
    if (material.uploadedBy !== userId) {
      // Check if user is admin
      const user = await this.database.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (user?.role !== 'ADMIN') {
        throw new BadRequestException('Not authorized to delete this material');
      }
    }

    await this.database.db
      .update(subchapterMaterials)
      .set({ isActive: false })
      .where(eq(subchapterMaterials.id, id));

    return { message: 'Material deleted successfully' };
  }
}
```

### 4. Enhanced Content Controller

```typescript
// Add to src/content/content.controller.ts
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedFile, UseInterceptors } from '@nestjs/common';

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly materialsService: MaterialsService,
  ) {}

  // Upload material to subchapter
  @Post('subchapters/:id/materials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GURU)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload material to subchapter' })
  @ApiConsumes('multipart/form-data')
  async uploadMaterial(
    @Param('id') subchapterId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
    @Request() req,
  ) {
    return this.materialsService.uploadMaterial(
      subchapterId,
      file,
      title,
      description,
      req.user.id,
    );
  }

  // Get materials for subchapter
  @Get('subchapters/:id/materials')
  @ApiOperation({ summary: 'Get materials for subchapter' })
  async getSubchapterMaterials(@Param('id') subchapterId: string) {
    return this.materialsService.getMaterialsBySubchapter(subchapterId);
  }

  // Delete material
  @Delete('materials/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GURU)
  @ApiOperation({ summary: 'Delete material' })
  async deleteMaterial(@Param('id') id: string, @Request() req) {
    return this.materialsService.deleteMaterial(id, req.user.id);
  }
}
```

## 🎨 Frontend Enhancement

### Enhanced Learning Interface Component

```typescript
// components/learning/EnhancedLearningInterface.tsx
interface EnhancedLearningInterfaceProps {
  subchapterId: string;
}

export function EnhancedLearningInterface({ subchapterId }: EnhancedLearningInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'ai-content' | 'materials'>('ai-content');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content Area */}
      <div className="lg:col-span-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ai-content">AI Content</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-content">
            <AIContentViewer subchapterId={subchapterId} />
          </TabsContent>

          <TabsContent value="materials">
            <MaterialsViewer subchapterId={subchapterId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chat Sidebar */}
      <div className="lg:col-span-1">
        <AIChatWidget subchapterId={subchapterId} />
      </div>
    </div>
  );
}

// Materials Viewer Component
function MaterialsViewer({ subchapterId }: { subchapterId: string }) {
  const { data: materials } = useQuery({
    queryKey: ['materials', subchapterId],
    queryFn: () => api.get(`/content/subchapters/${subchapterId}/materials`),
  });

  return (
    <div className="space-y-4">
      {materials?.map((material) => (
        <MaterialCard key={material.id} material={material} />
      ))}
    </div>
  );
}

// Material Card Component
function MaterialCard({ material }: { material: Material }) {
  const renderPreview = () => {
    switch (material.fileType) {
      case 'video':
        return <VideoPlayer src={material.fileUrl} />;
      case 'pdf':
        return <PDFViewer src={material.fileUrl} />;
      case 'image':
        return <img src={material.fileUrl} alt={material.title} />;
      default:
        return <DocumentIcon />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{material.title}</CardTitle>
        <CardDescription>{material.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {renderPreview()}
      </CardContent>
    </Card>
  );
}
```

## 📊 Benefits of Adding File Upload

### 1. **Comprehensive Learning Experience**

- Visual learners: Videos, diagrams, infographics
- Traditional materials: PDF textbooks, worksheets
- Interactive content: Presentations, animations

### 2. **Teacher Flexibility**

- Upload existing teaching materials
- Share recorded lessons
- Provide supplementary resources

### 3. **Student Engagement**

- Multiple content formats
- Better understanding through visuals
- Access to official curriculum materials

### 4. **Competitive Advantage**

- Hybrid AI + traditional content
- More complete LMS solution
- Better adoption by schools

## 🚀 Implementation Priority

### Phase 1: Basic File Upload (2-3 weeks)

- PDF and image upload
- Basic file viewer
- Admin/teacher upload permissions

### Phase 2: Video Integration (2-3 weeks)

- Video upload and streaming
- Video player with controls
- Thumbnail generation

### Phase 3: Advanced Features (2-3 weeks)

- File organization and folders
- Bulk upload
- File versioning
- Advanced permissions

## 💰 Cost Considerations

### Storage Costs (AWS S3)

- ~$0.023 per GB/month
- For 1000 students with 10GB materials each = ~$230/month

### CDN Costs (CloudFront)

- ~$0.085 per GB transferred
- Video streaming costs

### Development Time

- Backend: 4-6 weeks
- Frontend: 3-4 weeks
- Testing: 1-2 weeks

## 🎯 Conclusion

**YES, file upload system should be added** because:

1. **Educational Necessity**: Visual content is crucial for effective learning
2. **Teacher Adoption**: Teachers need to upload existing materials
3. **Student Experience**: Multiple content formats improve engagement
4. **Market Competitiveness**: Complete LMS solution vs AI-only system
5. **Scalability**: Foundation for future enhancements

The hybrid approach (AI + uploaded materials) provides the best of both worlds - innovative AI-powered learning with traditional educational resources.
