// src/content/materials.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { FileUploadService } from '@/common/services/file-upload.service';
import {
  subchapterMaterials,
  users,
  subchapters,
  aiGeneratedContent,
} from '@/database/schema';
import { eq, and } from 'drizzle-orm';
import { UserRole } from '@/types/enums';

export interface UploadMaterialDto {
  title: string;
  description?: string;
}

@Injectable()
export class MaterialsService {
  constructor(
    private database: DatabaseService,
    private fileUploadService: FileUploadService,
  ) {}

  async uploadMaterial(
    subchapterId: string,
    file: Express.Multer.File,
    uploadData: UploadMaterialDto,
    uploadedBy: string,
  ) {
    // Upload file to local storage
    const { fileUrl, fileName } = await this.fileUploadService.uploadFile(
      file,
      subchapterId,
    );

    // Determine file type
    const fileType = this.fileUploadService.getFileType(file.mimetype);

    // Save to database
    const [material] = await this.database.db
      .insert(subchapterMaterials)
      .values({
        subchapterId,
        title: uploadData.title,
        description: uploadData.description,
        fileName,
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
    const materials = await this.database.db.query.subchapterMaterials.findMany(
      {
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
              role: true,
            },
          },
        },
        orderBy: (materials, { desc }) => [desc(materials.createdAt)],
      },
    );

    return materials;
  }

  async getMaterialById(id: string) {
    const material = await this.database.db.query.subchapterMaterials.findFirst(
      {
        where: and(
          eq(subchapterMaterials.id, id),
          eq(subchapterMaterials.isActive, true),
        ),
        with: {
          uploadedBy: {
            columns: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          subchapter: {
            columns: {
              id: true,
              title: true,
            },
          },
        },
      },
    );

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async updateMaterial(
    id: string,
    updateData: Partial<UploadMaterialDto>,
    userId: string,
  ) {
    const material = await this.getMaterialById(id);

    // Check permissions
    await this.checkUpdatePermissions(material, userId);

    const [updatedMaterial] = await this.database.db
      .update(subchapterMaterials)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(subchapterMaterials.id, id))
      .returning();

    return updatedMaterial;
  }

  async deleteMaterial(id: string, userId: string) {
    const material = await this.getMaterialById(id);

    // Check permissions
    await this.checkDeletePermissions(material, userId);

    // Soft delete from database
    await this.database.db
      .update(subchapterMaterials)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(subchapterMaterials.id, id));

    // Delete physical file
    await this.fileUploadService.deleteFile(material.fileUrl);

    return { message: 'Material deleted successfully' };
  }

  async getSubchapterWithMaterials(subchapterId: string) {
    // Debug: Log the subchapter ID being searched
    console.log('Searching for subchapter with ID:', subchapterId);

    // Debug: Check if any subchapters exist
    const allSubchapters = await this.database.db.query.subchapters.findMany({
      columns: { id: true, title: true, isActive: true },
      limit: 5,
    });
    console.log('Available subchapters (first 5):', allSubchapters);

    const subchapter = await this.database.db.query.subchapters.findFirst({
      where: eq(subchapters.id, subchapterId),
      with: {
        materials: {
          where: eq(subchapterMaterials.isActive, true),
          with: {
            uploadedBy: {
              columns: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: (materials, { desc }) => [desc(materials.createdAt)],
        },
        aiGeneratedContent: {
          orderBy: (content, { desc }) => [desc(content.createdAt)],
          limit: 1,
        },
      },
    });

    if (!subchapter) {
      throw new NotFoundException('Subchapter not found');
    }

    return subchapter;
  }

  private async checkUpdatePermissions(material: any, userId: string) {
    const user = await this.database.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admin can update any material
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // Teachers can update their own materials
    if (user.role === UserRole.GURU && material.uploadedBy.id === userId) {
      return;
    }

    throw new ForbiddenException('Not authorized to update this material');
  }

  private async checkDeletePermissions(material: any, userId: string) {
    const user = await this.database.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Admin can delete any material
    if (user.role === UserRole.ADMIN) {
      return;
    }

    // Teachers can delete their own materials
    if (user.role === UserRole.GURU && material.uploadedBy.id === userId) {
      return;
    }

    throw new ForbiddenException('Not authorized to delete this material');
  }

  async getMaterialsByType(subchapterId: string, fileType: string) {
    return this.database.db.query.subchapterMaterials.findMany({
      where: and(
        eq(subchapterMaterials.subchapterId, subchapterId),
        eq(subchapterMaterials.fileType, fileType),
        eq(subchapterMaterials.isActive, true),
      ),
      with: {
        uploadedBy: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: (materials, { desc }) => [desc(materials.createdAt)],
    });
  }

  async getMaterialsStats(subchapterId?: string) {
    let whereCondition = eq(subchapterMaterials.isActive, true);

    if (subchapterId) {
      whereCondition = and(
        eq(subchapterMaterials.subchapterId, subchapterId),
        eq(subchapterMaterials.isActive, true),
      );
    }

    const materials = await this.database.db.query.subchapterMaterials.findMany(
      {
        where: whereCondition,
        columns: {
          fileType: true,
          fileSize: true,
        },
      },
    );

    const stats = materials.reduce(
      (acc, material) => {
        const type = material.fileType;
        if (!acc[type]) {
          acc[type] = { count: 0, totalSize: 0 };
        }
        acc[type].count++;
        acc[type].totalSize += material.fileSize || 0;
        return acc;
      },
      {} as Record<string, { count: number; totalSize: number }>,
    );

    return stats;
  }
}
