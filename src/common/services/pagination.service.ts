// src/common/services/pagination.service.ts
import { Injectable } from '@nestjs/common';
import { ValidationException } from '@/common/exceptions/domain.exceptions';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

@Injectable()
export class PaginationService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 10;
  private readonly MAX_LIMIT = 100;

  /**
   * Validate and normalize pagination options
   */
  validatePaginationOptions(
    options: PaginationOptions,
  ): Required<PaginationOptions> {
    const page = Math.max(1, options.page || this.DEFAULT_PAGE);
    const limit = Math.min(
      this.MAX_LIMIT,
      Math.max(1, options.limit || this.DEFAULT_LIMIT),
    );

    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder === 'desc' ? 'desc' : 'asc';

    if (page < 1) {
      throw new ValidationException('Page number must be greater than 0');
    }

    if (limit < 1 || limit > this.MAX_LIMIT) {
      throw new ValidationException(
        `Limit must be between 1 and ${this.MAX_LIMIT}`,
      );
    }

    return { page, limit, sortBy, sortOrder };
  }

  /**
   * Calculate pagination metadata
   */
  calculatePagination(
    totalItems: number,
    page: number,
    limit: number,
  ): PaginationResult<any>['pagination'] {
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
    };
  }

  /**
   * Create paginated result
   */
  createPaginatedResult<T>(
    data: T[],
    totalItems: number,
    options: Required<PaginationOptions>,
  ): PaginationResult<T> {
    const pagination = this.calculatePagination(
      totalItems,
      options.page,
      options.limit,
    );

    return {
      data,
      pagination,
      sorting: {
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
      },
    };
  }

  /**
   * Calculate offset for database queries
   */
  calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Get pagination parameters for Drizzle ORM
   */
  getDrizzlePaginationParams(options: PaginationOptions) {
    const validated = this.validatePaginationOptions(options);
    const offset = this.calculateOffset(validated.page, validated.limit);

    return {
      limit: validated.limit,
      offset,
      sortBy: validated.sortBy,
      sortOrder: validated.sortOrder,
    };
  }

  /**
   * Create pagination links for API responses
   */
  createPaginationLinks(
    baseUrl: string,
    pagination: PaginationResult<any>['pagination'],
    queryParams: Record<string, any> = {},
  ) {
    const createUrl = (page: number) => {
      const params = new URLSearchParams({
        ...queryParams,
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
      });
      return `${baseUrl}?${params.toString()}`;
    };

    const links: Record<string, string | null> = {
      self: createUrl(pagination.currentPage),
      first: createUrl(1),
      last: createUrl(pagination.totalPages),
      next: pagination.hasNextPage
        ? createUrl(pagination.currentPage + 1)
        : null,
      prev: pagination.hasPreviousPage
        ? createUrl(pagination.currentPage - 1)
        : null,
    };

    return links;
  }

  /**
   * Paginate array in memory (for small datasets)
   */
  paginateArray<T>(
    array: T[],
    options: PaginationOptions,
  ): PaginationResult<T> {
    const validated = this.validatePaginationOptions(options);
    const offset = this.calculateOffset(validated.page, validated.limit);

    // Sort array if needed
    let sortedArray = [...array];
    if (validated.sortBy && typeof array[0] === 'object') {
      sortedArray.sort((a, b) => {
        const aValue = a[validated.sortBy];
        const bValue = b[validated.sortBy];

        if (aValue < bValue) return validated.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return validated.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const paginatedData = sortedArray.slice(offset, offset + validated.limit);

    return this.createPaginatedResult(paginatedData, array.length, validated);
  }

  /**
   * Create cursor-based pagination (for real-time data)
   */
  createCursorPagination<T>(
    data: T[],
    limit: number,
    getCursor: (item: T) => string,
    hasMore: boolean,
  ) {
    const cursors = {
      before: data.length > 0 ? getCursor(data[0]) : null,
      after: data.length > 0 ? getCursor(data[data.length - 1]) : null,
    };

    return {
      data,
      pageInfo: {
        hasNextPage: hasMore,
        hasPreviousPage: false, // Would need additional logic
        startCursor: cursors.before,
        endCursor: cursors.after,
      },
      totalCount: data.length,
    };
  }

  /**
   * Validate cursor for cursor-based pagination
   */
  validateCursor(cursor: string): boolean {
    try {
      // Basic validation - in real implementation, you might decode and validate
      return cursor && cursor.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Create search pagination with highlighting
   */
  createSearchPagination<T>(
    data: T[],
    totalItems: number,
    options: Required<PaginationOptions>,
    searchQuery?: string,
    searchFields?: string[],
  ): PaginationResult<T> & { search?: any } {
    const result = this.createPaginatedResult(data, totalItems, options);

    if (searchQuery && searchFields) {
      return {
        ...result,
        search: {
          query: searchQuery,
          fields: searchFields,
          totalMatches: totalItems,
        },
      };
    }

    return result;
  }
}
