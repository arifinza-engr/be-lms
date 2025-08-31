// src/content/content.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { MaterialsService } from './materials.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { UserRole } from '@/types/enums';
import { testUtils } from '@/test/test-utils';

describe('ContentController', () => {
  let controller: ContentController;
  let contentService: jest.Mocked<ContentService>;
  let materialsService: jest.Mocked<MaterialsService>;

  const mockUser = testUtils.createMockUser({ role: UserRole.ADMIN });
  const mockGrade = testUtils.createMockGrade();
  const mockSubject = testUtils.createMockSubject();
  const mockChapter = testUtils.createMockChapter();
  const mockSubchapter = testUtils.createMockSubchapter();

  beforeEach(async () => {
    const mockContentService = {
      createGrade: jest.fn(),
      getAllGrades: jest.fn(),
      getGradeById: jest.fn(),
      updateGrade: jest.fn(),
      deleteGrade: jest.fn(),
      createSubject: jest.fn(),
      getSubjectsByGrade: jest.fn(),
      getSubjectById: jest.fn(),
      updateSubject: jest.fn(),
      deleteSubject: jest.fn(),
      createChapter: jest.fn(),
      getChaptersBySubject: jest.fn(),
      getChapterById: jest.fn(),
      updateChapter: jest.fn(),
      deleteChapter: jest.fn(),
      createSubchapter: jest.fn(),
      getSubchaptersByChapter: jest.fn(),
      getSubchapterById: jest.fn(),
      updateSubchapter: jest.fn(),
      deleteSubchapter: jest.fn(),
    };

    const mockMaterialsService = {
      uploadMaterial: jest.fn(),
      getMaterialsBySubchapter: jest.fn(),
      getMaterialById: jest.fn(),
      downloadMaterial: jest.fn(),
      deleteMaterial: jest.fn(),
      updateMaterial: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: ContentService,
          useValue: mockContentService,
        },
        {
          provide: MaterialsService,
          useValue: mockMaterialsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ContentController>(ContentController);
    contentService = module.get(ContentService);
    materialsService = module.get(MaterialsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Grade Operations', () => {
    describe('createGrade', () => {
      const createGradeDto = {
        title: 'Grade 10',
        description: 'Grade 10 Description',
      };

      it('should create grade successfully', async () => {
        // Arrange
        contentService.createGrade.mockResolvedValue(mockGrade);

        // Act
        const result = await controller.createGrade(createGradeDto);

        // Assert
        expect(contentService.createGrade).toHaveBeenCalledWith(createGradeDto);
        expect(result).toEqual(mockGrade);
      });

      it('should handle service errors', async () => {
        // Arrange
        contentService.createGrade.mockRejectedValue(
          new BadRequestException('Invalid grade data'),
        );

        // Act & Assert
        await expect(controller.createGrade(createGradeDto)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('getAllGrades', () => {
      it('should return all grades', async () => {
        // Arrange
        const mockGrades = [mockGrade];
        contentService.getAllGrades.mockResolvedValue(mockGrades);

        // Act
        const result = await controller.getAllGrades();

        // Assert
        expect(contentService.getAllGrades).toHaveBeenCalled();
        expect(result).toEqual(mockGrades);
      });
    });

    describe('getGradeById', () => {
      it('should return grade by id', async () => {
        // Arrange
        contentService.getGradeById.mockResolvedValue(mockGrade);

        // Act
        const result = await controller.getGradeById('grade-id');

        // Assert
        expect(contentService.getGradeById).toHaveBeenCalledWith('grade-id');
        expect(result).toEqual(mockGrade);
      });

      it('should handle grade not found', async () => {
        // Arrange
        contentService.getGradeById.mockRejectedValue(
          new NotFoundException('Grade not found'),
        );

        // Act & Assert
        await expect(
          controller.getGradeById('non-existent-id'),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('updateGrade', () => {
      const updateGradeDto = {
        title: 'Updated Grade 10',
        description: 'Updated description',
      };

      it('should update grade successfully', async () => {
        // Arrange
        const updatedGrade = { ...mockGrade, ...updateGradeDto };
        contentService.updateGrade.mockResolvedValue(updatedGrade);

        // Act
        const result = await controller.updateGrade('grade-id', updateGradeDto);

        // Assert
        expect(contentService.updateGrade).toHaveBeenCalledWith(
          'grade-id',
          updateGradeDto,
        );
        expect(result).toEqual(updatedGrade);
      });
    });

    describe('deleteGrade', () => {
      it('should delete grade successfully', async () => {
        // Arrange
        contentService.deleteGrade.mockResolvedValue(undefined);

        // Act
        const result = await controller.deleteGrade('grade-id');

        // Assert
        expect(contentService.deleteGrade).toHaveBeenCalledWith('grade-id');
        expect(result).toEqual({
          message: 'Grade deleted successfully',
          gradeId: 'grade-id',
        });
      });
    });
  });

  describe('Subject Operations', () => {
    describe('createSubject', () => {
      const createSubjectDto = {
        title: 'Mathematics',
        description: 'Mathematics Subject',
        gradeId: 'grade-id',
      };

      it('should create subject successfully', async () => {
        // Arrange
        contentService.createSubject.mockResolvedValue(mockSubject);

        // Act
        const result = await controller.createSubject(createSubjectDto);

        // Assert
        expect(contentService.createSubject).toHaveBeenCalledWith(
          createSubjectDto,
        );
        expect(result).toEqual(mockSubject);
      });
    });

    describe('getSubjectsByGrade', () => {
      it('should return subjects by grade', async () => {
        // Arrange
        const mockSubjects = [mockSubject];
        contentService.getSubjectsByGrade.mockResolvedValue(mockSubjects);

        // Act
        const result = await controller.getSubjectsByGrade('grade-id');

        // Assert
        expect(contentService.getSubjectsByGrade).toHaveBeenCalledWith(
          'grade-id',
        );
        expect(result).toEqual(mockSubjects);
      });
    });

    describe('getSubjectById', () => {
      it('should return subject by id', async () => {
        // Arrange
        contentService.getSubjectById.mockResolvedValue(mockSubject);

        // Act
        const result = await controller.getSubjectById('subject-id');

        // Assert
        expect(contentService.getSubjectById).toHaveBeenCalledWith(
          'subject-id',
        );
        expect(result).toEqual(mockSubject);
      });
    });

    describe('updateSubject', () => {
      const updateSubjectDto = {
        title: 'Advanced Mathematics',
        description: 'Updated description',
      };

      it('should update subject successfully', async () => {
        // Arrange
        const updatedSubject = { ...mockSubject, ...updateSubjectDto };
        contentService.updateSubject.mockResolvedValue(updatedSubject);

        // Act
        const result = await controller.updateSubject(
          'subject-id',
          updateSubjectDto,
        );

        // Assert
        expect(contentService.updateSubject).toHaveBeenCalledWith(
          'subject-id',
          updateSubjectDto,
        );
        expect(result).toEqual(updatedSubject);
      });
    });

    describe('deleteSubject', () => {
      it('should delete subject successfully', async () => {
        // Arrange
        contentService.deleteSubject.mockResolvedValue(undefined);

        // Act
        const result = await controller.deleteSubject('subject-id');

        // Assert
        expect(contentService.deleteSubject).toHaveBeenCalledWith('subject-id');
        expect(result).toEqual({
          message: 'Subject deleted successfully',
          subjectId: 'subject-id',
        });
      });
    });
  });

  describe('Chapter Operations', () => {
    describe('createChapter', () => {
      const createChapterDto = {
        title: 'Algebra',
        description: 'Algebra Chapter',
        subjectId: 'subject-id',
        order: 1,
      };

      it('should create chapter successfully', async () => {
        // Arrange
        contentService.createChapter.mockResolvedValue(mockChapter);

        // Act
        const result = await controller.createChapter(createChapterDto);

        // Assert
        expect(contentService.createChapter).toHaveBeenCalledWith(
          createChapterDto,
        );
        expect(result).toEqual(mockChapter);
      });
    });

    describe('getChaptersBySubject', () => {
      it('should return chapters by subject', async () => {
        // Arrange
        const mockChapters = [mockChapter];
        contentService.getChaptersBySubject.mockResolvedValue(mockChapters);

        // Act
        const result = await controller.getChaptersBySubject('subject-id');

        // Assert
        expect(contentService.getChaptersBySubject).toHaveBeenCalledWith(
          'subject-id',
        );
        expect(result).toEqual(mockChapters);
      });
    });

    describe('getChapterById', () => {
      it('should return chapter by id', async () => {
        // Arrange
        contentService.getChapterById.mockResolvedValue(mockChapter);

        // Act
        const result = await controller.getChapterById('chapter-id');

        // Assert
        expect(contentService.getChapterById).toHaveBeenCalledWith(
          'chapter-id',
        );
        expect(result).toEqual(mockChapter);
      });
    });

    describe('updateChapter', () => {
      const updateChapterDto = {
        title: 'Advanced Algebra',
        description: 'Updated description',
        order: 2,
      };

      it('should update chapter successfully', async () => {
        // Arrange
        const updatedChapter = { ...mockChapter, ...updateChapterDto };
        contentService.updateChapter.mockResolvedValue(updatedChapter);

        // Act
        const result = await controller.updateChapter(
          'chapter-id',
          updateChapterDto,
        );

        // Assert
        expect(contentService.updateChapter).toHaveBeenCalledWith(
          'chapter-id',
          updateChapterDto,
        );
        expect(result).toEqual(updatedChapter);
      });
    });

    describe('deleteChapter', () => {
      it('should delete chapter successfully', async () => {
        // Arrange
        contentService.deleteChapter.mockResolvedValue(undefined);

        // Act
        const result = await controller.deleteChapter('chapter-id');

        // Assert
        expect(contentService.deleteChapter).toHaveBeenCalledWith('chapter-id');
        expect(result).toEqual({
          message: 'Chapter deleted successfully',
          chapterId: 'chapter-id',
        });
      });
    });
  });

  describe('Subchapter Operations', () => {
    describe('createSubchapter', () => {
      const createSubchapterDto = {
        title: 'Linear Equations',
        description: 'Linear Equations Subchapter',
        content: 'Content about linear equations',
        chapterId: 'chapter-id',
        order: 1,
      };

      it('should create subchapter successfully', async () => {
        // Arrange
        contentService.createSubchapter.mockResolvedValue(mockSubchapter);

        // Act
        const result = await controller.createSubchapter(createSubchapterDto);

        // Assert
        expect(contentService.createSubchapter).toHaveBeenCalledWith(
          createSubchapterDto,
        );
        expect(result).toEqual(mockSubchapter);
      });
    });

    describe('getSubchaptersByChapter', () => {
      it('should return subchapters by chapter', async () => {
        // Arrange
        const mockSubchapters = [mockSubchapter];
        contentService.getSubchaptersByChapter.mockResolvedValue(
          mockSubchapters,
        );

        // Act
        const result = await controller.getSubchaptersByChapter('chapter-id');

        // Assert
        expect(contentService.getSubchaptersByChapter).toHaveBeenCalledWith(
          'chapter-id',
        );
        expect(result).toEqual(mockSubchapters);
      });
    });

    describe('getSubchapterById', () => {
      it('should return subchapter by id', async () => {
        // Arrange
        contentService.getSubchapterById.mockResolvedValue(mockSubchapter);

        // Act
        const result = await controller.getSubchapterById('subchapter-id');

        // Assert
        expect(contentService.getSubchapterById).toHaveBeenCalledWith(
          'subchapter-id',
        );
        expect(result).toEqual(mockSubchapter);
      });
    });

    describe('updateSubchapter', () => {
      const updateSubchapterDto = {
        title: 'Advanced Linear Equations',
        description: 'Updated description',
        content: 'Updated content',
      };

      it('should update subchapter successfully', async () => {
        // Arrange
        const updatedSubchapter = { ...mockSubchapter, ...updateSubchapterDto };
        contentService.updateSubchapter.mockResolvedValue(updatedSubchapter);

        // Act
        const result = await controller.updateSubchapter(
          'subchapter-id',
          updateSubchapterDto,
        );

        // Assert
        expect(contentService.updateSubchapter).toHaveBeenCalledWith(
          'subchapter-id',
          updateSubchapterDto,
        );
        expect(result).toEqual(updatedSubchapter);
      });
    });

    describe('deleteSubchapter', () => {
      it('should delete subchapter successfully', async () => {
        // Arrange
        contentService.deleteSubchapter.mockResolvedValue(undefined);

        // Act
        const result = await controller.deleteSubchapter('subchapter-id');

        // Assert
        expect(contentService.deleteSubchapter).toHaveBeenCalledWith(
          'subchapter-id',
        );
        expect(result).toEqual({
          message: 'Subchapter deleted successfully',
          subchapterId: 'subchapter-id',
        });
      });
    });
  });

  describe('Material Operations', () => {
    describe('uploadMaterial', () => {
      const uploadDto = {
        title: 'Test Material',
        description: 'Test material description',
        subchapterId: 'subchapter-id',
        type: 'document' as const,
      };

      const mockFile = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('test file content'),
        size: 1024,
      } as Express.Multer.File;

      it('should upload material successfully', async () => {
        // Arrange
        const mockMaterial = {
          id: 'material-id',
          title: uploadDto.title,
          description: uploadDto.description,
          subchapterId: uploadDto.subchapterId,
          type: uploadDto.type,
          filename: 'test.pdf',
          filepath: '/uploads/documents/test.pdf',
          filesize: 1024,
          mimetype: 'application/pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        materialsService.uploadMaterial.mockResolvedValue(mockMaterial);

        // Act
        const result = await controller.uploadMaterial(uploadDto, mockFile);

        // Assert
        expect(materialsService.uploadMaterial).toHaveBeenCalledWith(
          uploadDto,
          mockFile,
        );
        expect(result).toEqual(mockMaterial);
      });

      it('should handle upload errors', async () => {
        // Arrange
        materialsService.uploadMaterial.mockRejectedValue(
          new BadRequestException('Invalid file type'),
        );

        // Act & Assert
        await expect(
          controller.uploadMaterial(uploadDto, mockFile),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('getMaterialsBySubchapter', () => {
      it('should return materials by subchapter', async () => {
        // Arrange
        const mockMaterials = [
          {
            id: 'material-1',
            title: 'Material 1',
            type: 'document',
            filename: 'doc1.pdf',
          },
        ];
        materialsService.getMaterialsBySubchapter.mockResolvedValue(
          mockMaterials,
        );

        // Act
        const result =
          await controller.getMaterialsBySubchapter('subchapter-id');

        // Assert
        expect(materialsService.getMaterialsBySubchapter).toHaveBeenCalledWith(
          'subchapter-id',
        );
        expect(result).toEqual(mockMaterials);
      });
    });

    describe('downloadMaterial', () => {
      it('should download material successfully', async () => {
        // Arrange
        const mockFileData = {
          filename: 'test.pdf',
          filepath: '/uploads/documents/test.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('test file content'),
        };
        materialsService.downloadMaterial.mockResolvedValue(mockFileData);

        const mockResponse = {
          set: jest.fn(),
          send: jest.fn(),
        } as unknown as Response;

        // Act
        await controller.downloadMaterial('material-id', mockResponse);

        // Assert
        expect(materialsService.downloadMaterial).toHaveBeenCalledWith(
          'material-id',
        );
        expect(mockResponse.set).toHaveBeenCalledWith({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="test.pdf"',
          'Content-Length': mockFileData.buffer.length,
        });
        expect(mockResponse.send).toHaveBeenCalledWith(mockFileData.buffer);
      });

      it('should handle material not found', async () => {
        // Arrange
        materialsService.downloadMaterial.mockRejectedValue(
          new NotFoundException('Material not found'),
        );

        // Act & Assert
        await expect(
          controller.downloadMaterial('non-existent-id', {} as Response),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteMaterial', () => {
      it('should delete material successfully', async () => {
        // Arrange
        materialsService.deleteMaterial.mockResolvedValue(undefined);

        // Act
        const result = await controller.deleteMaterial('material-id');

        // Assert
        expect(materialsService.deleteMaterial).toHaveBeenCalledWith(
          'material-id',
        );
        expect(result).toEqual({
          message: 'Material deleted successfully',
          materialId: 'material-id',
        });
      });
    });

    describe('updateMaterial', () => {
      const updateDto = {
        title: 'Updated Material',
        description: 'Updated description',
      };

      it('should update material successfully', async () => {
        // Arrange
        const updatedMaterial = {
          id: 'material-id',
          title: updateDto.title,
          description: updateDto.description,
          type: 'document',
          filename: 'test.pdf',
        };
        materialsService.updateMaterial.mockResolvedValue(updatedMaterial);

        // Act
        const result = await controller.updateMaterial(
          'material-id',
          updateDto,
        );

        // Assert
        expect(materialsService.updateMaterial).toHaveBeenCalledWith(
          'material-id',
          updateDto,
        );
        expect(result).toEqual(updatedMaterial);
      });
    });
  });
});
