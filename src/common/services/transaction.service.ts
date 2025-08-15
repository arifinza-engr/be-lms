// src/common/services/transaction.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { DatabaseException } from '@/common/exceptions/domain.exceptions';

export type TransactionCallback<T> = (tx: any) => Promise<T>;

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(private readonly database: DatabaseService) {}

  async executeInTransaction<T>(
    callback: TransactionCallback<T>,
    retries: number = 3,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.debug(`Starting transaction attempt ${attempt}/${retries}`);

        const result = await this.database.transaction(async (tx) => {
          return await callback(tx);
        });

        this.logger.debug(
          `Transaction completed successfully on attempt ${attempt}`,
        );
        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Transaction failed on attempt ${attempt}/${retries}: ${error.message}`,
        );

        // Don't retry for certain types of errors
        if (this.shouldNotRetry(error)) {
          this.logger.error(
            'Transaction failed with non-retryable error',
            error.stack,
          );
          throw new DatabaseException(`Transaction failed: ${error.message}`);
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt - 1) * 100; // 100ms, 200ms, 400ms
          await this.sleep(delay);
        }
      }
    }

    this.logger.error(
      `Transaction failed after ${retries} attempts`,
      lastError.stack,
    );
    throw new DatabaseException(
      `Transaction failed after ${retries} attempts: ${lastError.message}`,
    );
  }

  async executeWithSavepoint<T>(
    callback: TransactionCallback<T>,
    savepointName: string = 'sp1',
  ): Promise<T> {
    return this.database.transaction(async (tx) => {
      try {
        // Create savepoint
        await tx.execute(`SAVEPOINT ${savepointName}`);

        const result = await callback(tx);

        // Release savepoint on success
        await tx.execute(`RELEASE SAVEPOINT ${savepointName}`);

        return result;
      } catch (error) {
        // Rollback to savepoint on error
        await tx.execute(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        throw error;
      }
    });
  }

  async batchExecute<T>(
    operations: TransactionCallback<T>[],
    batchSize: number = 10,
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);

      const batchResults = await this.executeInTransaction(async (tx) => {
        const promises = batch.map((operation) => operation(tx));
        return Promise.all(promises);
      });

      results.push(...batchResults);
    }

    return results;
  }

  private shouldNotRetry(error: Error): boolean {
    const nonRetryableErrors = [
      'unique constraint',
      'foreign key constraint',
      'check constraint',
      'not null constraint',
      'syntax error',
      'permission denied',
    ];

    const errorMessage = error.message.toLowerCase();
    return nonRetryableErrors.some((pattern) => errorMessage.includes(pattern));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
