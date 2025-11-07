export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const getPaginationParams = (
  page: number = 1,
  limit: number = 20
): { skip: number; limit: number } => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

export const getSortParams = (
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'desc'
): Record<string, 1 | -1> => {
  if (!sortBy) return { createdAt: -1 };
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
};
