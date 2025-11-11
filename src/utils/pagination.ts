import { Model, type FilterQuery } from 'mongoose';

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

/**
 * Paginate documents for a Mongoose model.
 *
 * Generic helper that performs a paginated find on the provided Mongoose model,
 * applying sorting, field selection, and population as requested. The function
 * uses skip/limit for pagination, calls .lean() on the query, and returns the
 * result set along with pagination metadata.
 *
 * @typeParam T - The document interface/type returned by the model.
 *
 * @param model - A Mongoose Model<T> to query.
 * @param page - 1-based page number (defaults to 1).
 * Negative or zero values may produce unexpected results.
 * @param limit - Number of items per page (defaults to 20).
 * @param select - Optional fields to include in the result.
 * Accepts a comma-separated string ("a,b,c")
 * or an array of strings. Fields are converted to a space-separated list for Mongoose select.
 * @param populate - Optional population instructions.
 * Accepts a comma-separated list of populate specs.
 * Each spec may be a path or "path:fields"
 * where fields is a comma-separated list of fields to select on the populated document
 * (e.g. "author:name,email,comments:content").
 * @param query - Mongoose FilterQuery<T> used as the find filter (defaults to {}).
 * @param sortBy - Field name to sort by (defaults to "createdAt").
 * @param sortOrder - Sort direction: "asc" | "desc" (defaults to "desc").
 *
 * @returns A Promise that resolves to an object with the following shape:
 *  {
 *    total: number;        // total number of matching documents
 *    page: number;         // current page number (as passed in)
 *    limit: number;        // limit per page (as passed in)
 *    totalPages: number;   // computed as Math.ceil(total / limit)
 *    data: T[];            // array of documents for the requested page (lean objects)
 *  }
 *
 * @remarks
 * - The function applies .lean() to returned documents for better performance.
 * - Sorting is applied using the provided sortBy and sortOrder.
 * - Select and populate strings are parsed and applied to the query;
 * multiple fields/paths should be comma-separated.
 * - Any errors thrown by Mongoose operations
 * (find, countDocuments, populate, etc.) are propagated to the caller.
 */
export async function paginate<T>(
  model: Model<T>,
  page: number = 1,
  limit: number = 20,
  select?: string | string[],
  populate?: string | string[],
  query: FilterQuery<T> = {},
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}> {
  // Apply sorting
  const sort: Record<string, 1 | -1> = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  // Apply select if provided
  if (select) {
    const fields = (select as string).split(',').join(' ');
    query = query.select(fields);
  }

  // Apply populate if provided
  if (populate) {
    const refs = (populate as string).split(',');
    for (const ref of refs) {
      const [path, fields] = ref.split(':');
      query = query.populate(path, fields || '');
    }
  }

  const skip = (page - 1) * limit;
  const data = (await model.find(query).sort(sort).skip(skip).limit(limit).lean().exec()) as T[];
  const total = await model.countDocuments(query).exec();

  return { total, page, limit, totalPages: Math.ceil(total / limit), data };
}
