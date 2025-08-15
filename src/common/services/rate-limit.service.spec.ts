// src/common/services/rate-limit.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service';
import { RedisService } from './redis.service';

describe('RateLimitService', () => {
  let service: RateLimitService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      zadd: jest.fn(),
      expire: jest.fn(),
      keys: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
    redisService = module.get(RedisService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkRateLimit', () => {
    const mockKey = 'test-key';
    const mockConfigName = 'general';

    beforeEach(() => {
      // Mock current time
      jest.spyOn(Date, 'now').mockReturnValue(1000000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should allow request when under limit', async () => {
      redisService.get.mockResolvedValue(null); // No block
      redisService.zcard.mockResolvedValue(5); // Current requests under limit
      redisService.zadd.mockResolvedValue(1);
      redisService.expire.mockResolvedValue(1);

      const result = await service.checkRateLimit(mockKey, mockConfigName);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(redisService.zremrangebyscore).toHaveBeenCalled();
      expect(redisService.zadd).toHaveBeenCalled();
    });

    it('should block request when over limit', async () => {
      redisService.get.mockResolvedValue(null); // No existing block
      redisService.zcard.mockResolvedValue(100); // Over limit
      redisService.set.mockResolvedValue('OK');

      const result = await service.checkRateLimit(mockKey, mockConfigName);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(redisService.set).toHaveBeenCalled(); // Block should be set
    });

    it('should respect existing block', async () => {
      const futureTime = Date.now() + 10000;
      redisService.get.mockResolvedValue(futureTime.toString());

      const result = await service.checkRateLimit(mockKey, mockConfigName);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBe(futureTime);
      expect(redisService.zcard).not.toHaveBeenCalled();
    });

    it('should ignore expired block', async () => {
      const pastTime = Date.now() - 10000;
      redisService.get.mockResolvedValue(pastTime.toString());
      redisService.zcard.mockResolvedValue(5);
      redisService.zadd.mockResolvedValue(1);
      redisService.expire.mockResolvedValue(1);

      const result = await service.checkRateLimit(mockKey, mockConfigName);

      expect(result.allowed).toBe(true);
      expect(redisService.zcard).toHaveBeenCalled();
    });

    it('should apply custom configuration', async () => {
      const customConfig = { maxRequests: 5, windowMs: 30000 };
      redisService.get.mockResolvedValue(null);
      redisService.zcard.mockResolvedValue(6); // Over custom limit
      redisService.set.mockResolvedValue('OK');

      const result = await service.checkRateLimit(
        mockKey,
        mockConfigName,
        customConfig,
      );

      expect(result.allowed).toBe(false);
      expect(redisService.set).toHaveBeenCalled();
    });
  });

  describe('checkByIP', () => {
    it('should format IP key correctly', async () => {
      const ip = '192.168.1.1';
      redisService.get.mockResolvedValue(null);
      redisService.zcard.mockResolvedValue(5);
      redisService.zadd.mockResolvedValue(1);
      redisService.expire.mockResolvedValue(1);

      await service.checkByIP(ip, 'general');

      expect(redisService.zremrangebyscore).toHaveBeenCalledWith(
        expect.stringContaining('ip:192.168.1.1'),
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  describe('checkByUser', () => {
    it('should format user key correctly', async () => {
      const userId = 'user-123';
      redisService.get.mockResolvedValue(null);
      redisService.zcard.mockResolvedValue(5);
      redisService.zadd.mockResolvedValue(1);
      redisService.expire.mockResolvedValue(1);

      await service.checkByUser(userId, 'general');

      expect(redisService.zremrangebyscore).toHaveBeenCalledWith(
        expect.stringContaining('user:user-123'),
        expect.any(Number),
        expect.any(Number),
      );
    });
  });

  describe('checkByIPAndUser', () => {
    it('should return more restrictive result', async () => {
      const ip = '192.168.1.1';
      const userId = 'user-123';

      // Mock IP check - allowed
      redisService.get.mockResolvedValueOnce(null);
      redisService.zcard.mockResolvedValueOnce(5);
      redisService.zadd.mockResolvedValueOnce(1);
      redisService.expire.mockResolvedValueOnce(1);

      // Mock User check - blocked
      redisService.get.mockResolvedValueOnce(null);
      redisService.zcard.mockResolvedValueOnce(100);
      redisService.set.mockResolvedValueOnce('OK');

      const result = await service.checkByIPAndUser(ip, userId, 'general');

      expect(result.allowed).toBe(false); // More restrictive result
    });
  });

  describe('resetRateLimit', () => {
    it('should delete both request and block keys', async () => {
      const key = 'test-key';
      redisService.del.mockResolvedValue(1);

      await service.resetRateLimit(key);

      expect(redisService.del).toHaveBeenCalledTimes(2);
      expect(redisService.del).toHaveBeenCalledWith(
        `rate_limit:requests:${key}`,
      );
      expect(redisService.del).toHaveBeenCalledWith(`rate_limit:block:${key}`);
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return status without incrementing', async () => {
      const key = 'test-key';
      redisService.get.mockResolvedValue(null); // No block
      redisService.zcard.mockResolvedValue(5);

      const result = await service.getRateLimitStatus(key, 'general');

      expect(result.remaining).toBeGreaterThan(0);
      expect(result.totalHits).toBe(5);
      expect(redisService.zadd).not.toHaveBeenCalled(); // Should not increment
    });

    it('should return blocked status', async () => {
      const key = 'test-key';
      const blockTime = Date.now() + 10000;
      redisService.get.mockResolvedValue(blockTime.toString());

      const result = await service.getRateLimitStatus(key, 'general');

      expect(result.remaining).toBe(0);
      expect(result.resetTime).toBe(blockTime);
    });
  });

  describe('getRateLimitStats', () => {
    it('should return aggregated statistics', async () => {
      redisService.keys
        .mockResolvedValueOnce([
          'rate_limit:requests:key1',
          'rate_limit:requests:key2',
        ])
        .mockResolvedValueOnce(['rate_limit:block:key3']);

      redisService.zcard.mockResolvedValueOnce(10).mockResolvedValueOnce(15);

      const result = await service.getRateLimitStats();

      expect(result.activeWindows).toBe(2);
      expect(result.blockedKeys).toBe(1);
      expect(result.totalRequests).toBe(25);
    });

    it('should handle errors gracefully', async () => {
      redisService.keys.mockRejectedValue(new Error('Redis error'));

      const result = await service.getRateLimitStats();

      expect(result.activeWindows).toBe(0);
      expect(result.blockedKeys).toBe(0);
      expect(result.totalRequests).toBe(0);
    });
  });

  describe('cleanupExpiredData', () => {
    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1000000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should clean up expired blocks', async () => {
      const expiredTime = Date.now() - 10000;
      redisService.keys
        .mockResolvedValueOnce(['rate_limit:block:key1'])
        .mockResolvedValueOnce([]);

      redisService.get.mockResolvedValue(expiredTime.toString());
      redisService.del.mockResolvedValue(1);

      await service.cleanupExpiredData();

      expect(redisService.del).toHaveBeenCalledWith('rate_limit:block:key1');
    });

    it('should clean up empty request sets', async () => {
      redisService.keys
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['rate_limit:requests:key1']);

      redisService.zcard.mockResolvedValue(0);
      redisService.del.mockResolvedValue(1);

      await service.cleanupExpiredData();

      expect(redisService.del).toHaveBeenCalledWith('rate_limit:requests:key1');
    });

    it('should handle cleanup errors gracefully', async () => {
      redisService.keys.mockRejectedValue(new Error('Redis error'));

      await expect(service.cleanupExpiredData()).resolves.not.toThrow();
    });
  });

  describe('rate limit configurations', () => {
    it('should have correct auth configuration', async () => {
      redisService.get.mockResolvedValue(null);
      redisService.zcard.mockResolvedValue(6); // Over auth limit (5)
      redisService.set.mockResolvedValue('OK');

      const result = await service.checkRateLimit('test', 'auth');

      expect(result.allowed).toBe(false);
      expect(redisService.set).toHaveBeenCalled(); // Should block
    });

    it('should have correct password reset configuration', async () => {
      redisService.get.mockResolvedValue(null);
      redisService.zcard.mockResolvedValue(4); // Over password reset limit (3)
      redisService.set.mockResolvedValue('OK');

      const result = await service.checkRateLimit('test', 'passwordReset');

      expect(result.allowed).toBe(false);
    });

    it('should have correct AI generation configuration', async () => {
      redisService.get.mockResolvedValue(null);
      redisService.zcard.mockResolvedValue(11); // Over AI generation limit (10)
      redisService.set.mockResolvedValue('OK');

      const result = await service.checkRateLimit('test', 'aiGeneration');

      expect(result.allowed).toBe(false);
    });
  });
});
