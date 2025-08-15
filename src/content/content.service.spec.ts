// src/content/content.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { ContentRepository } from './repositories/content.repository';
import { TransactionService } from '@/common/services/transaction.service';
import { DatabaseService } from '@/database/database.service';
import { ResourceNotFoundException } from '@/common/exceptions/domain.exceptions';
import { testUtils } from '@/test/test-utils';

describe('ContentService', () => {
  let service: ContentService;
  let contentRepository: jest.Mocked<ContentRepository>;
  let transactionService: jest.Mocked<TransactionService>;
  let databaseService: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const mockContentRepository = {
      findAllGrades: jest.fn(),
      findGradeById: jest.fn(),
      findSubjectsByGradeId: jest.fn(),
      findSubjectById: jest.fn(),
      findChaptersBySubjectId: jest.fn(),
      findChapterById: jest.fn(),
      findSubchaptersByChapterId: jest.fn(),
      findSubchapterById: jest.fn(),
      invalidateGradeCache: jest.fn(),
      invalidateSubjectCache: jest.fn(),
      invalidateChapterCache: jest.fn(),
      invalidateSubchapterCache: jest.fn(),
    };

    const mockTransactionService = {
      executeInTransaction: jest.fn(),
    };

    const mockDatabaseService = {
      db: {
        insert: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: ContentRepository,
          useValue: mockContentRepository,
        },
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    contentRepository = module.get(ContentRepository);
    transactionService = module.get(TransactionService);
    databaseService = module.get(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Grade Operations', () => {
    describe('createGrade', () => {
      it('should create a grade successfully', async () => {
        const createGradeDto = {
          title: 'Grade 10',
          description: 'Grade 10 Description',
        };

        const mockGrade = {
          id: 'grade-id',
          ...createGradeDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        transactionService.executeInTransaction.mockImplementation(
          async (callback) => {
            return callback({
              insert: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              returning: jest.fn().mockResolvedValue([mockGrade]),
            });
          },
        );

        contentRepository.invalidateGradeCache.mockResolvedValue(undefined);

        const result = await service.createGrade(createGradeDto);

        expect(result).toEqual(mockGrade);
        expect(transactionService.executeInTransaction).toHaveBeenCalled();
        expect(contentRepository.invalidateGradeCache).toHaveBeenCalled();
      });
    });

    describe('getAllGrades', () => {
      it('should return all grades', async () => {
        const mockGrades = [
          testUtils.createMockGrade({ id: 'grade-1', title: 'Grade 10' }),
          testUtils.createMockGrade({ id: 'grade-2', title: 'Grade 11' }),
        ];

        contentRepository.findAllGrades.mockResolvedValue(mockGrades);

        const result = await service.getAllGrades();

        expect(result).toEqual(mockGrades);
        expect(contentRepository.findAllGrades).toHaveBeenCalled();
      });
    });

    describe('getGradeById', () => {
      it('should return a grade by id', async () => {
        const gradeId = 'grade-id';
        const mockGrade = testUtils.createMockGrade({ id: gradeId });

        contentRepository.findGradeById.mockResolvedValue(mockGrade);

        const result = await service.getGradeById(gradeId);

        expect(result).toEqual(mockGrade);
        expect(contentRepository.findGradeById).toHaveBeenCalledWith(gradeId);
      });

      it('should throw ResourceNotFoundException when grade not found', async () => {
        const gradeId = 'non-existent-id';

        contentRepository.findGradeById.mockRejectedValue(
          new ResourceNotFoundException('Grade', gradeId),
        );

        await expect(service.getGradeById(gradeId)).rejects.toThrow(
          ResourceNotFoundException,
        );
      });
    });
  });

  describe('Subject Operations', () => {
    describe('createSubject', () => {
      it('should create a subject successfully', async () => {
        const createSubjectDto = {
          title: 'Mathematics',
          description: 'Mathematics Subject',
          gradeId: 'grade-id',
        };

        const mockSubject = {
          id: 'subject-id',
          ...createSubjectDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockGrade = testUtils.createMockGrade({ id: 'grade-id' });

        contentRepository.findGradeById.mockResolvedValue(mockGrade);
        transactionService.executeInTransaction.mockImplementation(
          async (callback) => {
            return callback({
              insert: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              returning: jest.fn().mockResolvedValue([mockSubject]),
            });
          },
        );
        contentRepository.invalidateSubjectCache.mockResolvedValue(undefined);

        const result = await service.createSubject(createSubjectDto);

        expect(result).toEqual(mockSubject);
        expect(contentRepository.findGradeById).toHaveBeenCalledWith(
          'grade-id',
        );
        expect(contentRepository.invalidateSubjectCache).toHaveBeenCalledWith(
          undefined,
          'grade-id',
        );
      });

      it('should throw error when grade does not exist', async () => {
        const createSubjectDto = {
          title: 'Mathematics',
          description: 'Mathematics Subject',
          gradeId: 'non-existent-grade-id',
        };

        contentRepository.findGradeById.mockRejectedValue(
          new ResourceNotFoundException('Grade', 'non-existent-grade-id'),
        );

        transactionService.executeInTransaction.mockImplementation(
          async (callback) => {
            return callback({});
          },
        );

        await expect(service.createSubject(createSubjectDto)).rejects.toThrow(
          ResourceNotFoundException,
        );
      });
    });

    describe('getSubjectsByGrade', () => {
      it('should return subjects by grade id', async () => {
        const gradeId = 'grade-id';
        const mockSubjects = [
          testUtils.createMockSubject({ id: 'subject-1', gradeId }),
          testUtils.createMockSubject({ id: 'subject-2', gradeId }),
        ];

        contentRepository.findSubjectsByGradeId.mockResolvedValue(mockSubjects);

        const result = await service.getSubjectsByGrade(gradeId);

        expect(result).toEqual(mockSubjects);
        expect(contentRepository.findSubjectsByGradeId).toHaveBeenCalledWith(
          gradeId,
        );
      });
    });

    describe('getSubjectById', () => {
      it('should return a subject by id', async () => {
        const subjectId = 'subject-id';
        const mockSubject = testUtils.createMockSubject({ id: subjectId });

        contentRepository.findSubjectById.mockResolvedValue(mockSubject);

        const result = await service.getSubjectById(subjectId);

        expect(result).toEqual(mockSubject);
        expect(contentRepository.findSubjectById).toHaveBeenCalledWith(
          subjectId,
        );
      });
    });
  });

  describe('Chapter Operations', () => {
    describe('createChapter', () => {
      it('should create a chapter successfully', async () => {
        const createChapterDto = {
          title: 'Algebra',
          description: 'Algebra Chapter',
          subjectId: 'subject-id',
          order: 1,
        };

        const mockChapter = {
          id: 'chapter-id',
          ...createChapterDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockSubject = testUtils.createMockSubject({ id: 'subject-id' });

        contentRepository.findSubjectById.mockResolvedValue(mockSubject);
        transactionService.executeInTransaction.mockImplementation(
          async (callback) => {
            return callback({
              insert: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              returning: jest.fn().mockResolvedValue([mockChapter]),
            });
          },
        );
        contentRepository.invalidateChapterCache.mockResolvedValue(undefined);

        const result = await service.createChapter(createChapterDto);

        expect(result).toEqual(mockChapter);
        expect(contentRepository.findSubjectById).toHaveBeenCalledWith(
          'subject-id',
        );
        expect(contentRepository.invalidateChapterCache).toHaveBeenCalledWith(
          undefined,
          'subject-id',
        );
      });
    });

    describe('getChaptersBySubject', () => {
      it('should return chapters by subject id', async () => {
        const subjectId = 'subject-id';
        const mockChapters = [
          testUtils.createMockChapter({ id: 'chapter-1', subjectId }),
          testUtils.createMockChapter({ id: 'chapter-2', subjectId }),
        ];

        contentRepository.findChaptersBySubjectId.mockResolvedValue(
          mockChapters,
        );

        const result = await service.getChaptersBySubject(subjectId);

        expect(result).toEqual(mockChapters);
        expect(contentRepository.findChaptersBySubjectId).toHaveBeenCalledWith(
          subjectId,
        );
      });
    });

    describe('getChapterById', () => {
      it('should return a chapter by id', async () => {
        const chapterId = 'chapter-id';
        const mockChapter = testUtils.createMockChapter({ id: chapterId });

        contentRepository.findChapterById.mockResolvedValue(mockChapter);

        const result = await service.getChapterById(chapterId);

        expect(result).toEqual(mockChapter);
        expect(contentRepository.findChapterById).toHaveBeenCalledWith(
          chapterId,
        );
      });
    });
  });

  describe('Subchapter Operations', () => {
    describe('createSubchapter', () => {
      it('should create a subchapter successfully', async () => {
        const createSubchapterDto = {
          title: 'Linear Equations',
          description: 'Linear Equations Subchapter',
          content: 'Content about linear equations',
          chapterId: 'chapter-id',
          order: 1,
        };

        const mockSubchapter = {
          id: 'subchapter-id',
          ...createSubchapterDto,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const mockChapter = testUtils.createMockChapter({ id: 'chapter-id' });

        contentRepository.findChapterById.mockResolvedValue(mockChapter);
        transactionService.executeInTransaction.mockImplementation(
          async (callback) => {
            return callback({
              insert: jest.fn().mockReturnThis(),
              values: jest.fn().mockReturnThis(),
              returning: jest.fn().mockResolvedValue([mockSubchapter]),
            });
          },
        );
        contentRepository.invalidateSubchapterCache.mockResolvedValue(
          undefined,
        );

        const result = await service.createSubchapter(createSubchapterDto);

        expect(result).toEqual(mockSubchapter);
        expect(contentRepository.findChapterById).toHaveBeenCalledWith(
          'chapter-id',
        );
        expect(
          contentRepository.invalidateSubchapterCache,
        ).toHaveBeenCalledWith(undefined, 'chapter-id');
      });
    });

    describe('getSubchaptersByChapter', () => {
      it('should return subchapters by chapter id', async () => {
        const chapterId = 'chapter-id';
        const mockSubchapters = [
          testUtils.createMockSubchapter({ id: 'subchapter-1', chapterId }),
          testUtils.createMockSubchapter({ id: 'subchapter-2', chapterId }),
        ];

        contentRepository.findSubchaptersByChapterId.mockResolvedValue(
          mockSubchapters,
        );

        const result = await service.getSubchaptersByChapter(chapterId);

        expect(result).toEqual(mockSubchapters);
        expect(
          contentRepository.findSubchaptersByChapterId,
        ).toHaveBeenCalledWith(chapterId);
      });
    });

    describe('getSubchapterById', () => {
      it('should return a subchapter by id', async () => {
        const subchapterId = 'subchapter-id';
        const mockSubchapter = testUtils.createMockSubchapter({
          id: subchapterId,
        });

        contentRepository.findSubchapterById.mockResolvedValue(mockSubchapter);

        const result = await service.getSubchapterById(subchapterId);

        expect(result).toEqual(mockSubchapter);
        expect(contentRepository.findSubchapterById).toHaveBeenCalledWith(
          subchapterId,
        );
      });
    });
  });
});
