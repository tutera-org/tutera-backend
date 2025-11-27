/**
 * Builds a MongoDB-compatible query filter object from a plain key/value input map.
 *
 * This helper converts specially suffixed keys to MongoDB query operators:
 * - "<field>_min"  -> { <field>: { $gte: <value> } }
 * - "<field>_max"  -> { <field>: { $lte: <value> } }
 * - "<field>_like" -> { <field>: { $regex: <value>, $options: 'i' } }
 *
 * Keys without those suffixes are copied through as-is (equality match).
 * Empty values (undefined, null, or empty string) are ignored and not included
 * in the resulting filter. If both a "<field>_min" and "<field>_max" are
 * provided, they are merged into a single object for the same field (e.g.
 * { field: { $gte: minValue, $lte: maxValue } }).
 *
 * Notes and expectations:
 * - The function does not mutate the input object; it returns a new object.
 * - Values for "_min" / "_max" are typically numbers or Date objects but any
 *   value that MongoDB accepts for comparison can be used.
 * - The value for "_like" is treated as a regex pattern (string or RegExp-like
 *   value). The regex is applied case-insensitively via $options: 'i'.
 * - Suffix removal is performed via simple string replacement of the suffix;
 *   if your field names may contain these suffixes as part of the name, adjust
 *   accordingly.
 *
 * @param input - A plain object whose keys may contain filter suffixes
 *                ('_min', '_max', '_like') or be direct field names.
 * @returns A new object shaped for use as a MongoDB query filter.
 *
 * @example
 * // Input:
 * // { age_min: 18, age_max: 30, name_like: 'doe', active: true }
 * //
 * // Output:
 * // {
 * //   age: { $gte: 18, $lte: 30 },
 * //   name: { $regex: 'doe', $options: 'i' },
 * //   active: true
 * // }
 */
export function buildMongoFilter(input: Record<string, unknown>): Record<string, unknown> {
  const filter: Record<string, unknown> = {};

  for (const key in input) {
    const value = input[key];

    if (value === undefined || value === null || value === '') continue;

    if (key.endsWith('_min')) {
      const field = key.replace('_min', '');
      const existing = (filter[field] as Record<string, unknown>) || {};
      filter[field] = { ...existing, $gte: value };
    } else if (key.endsWith('_max')) {
      const field = key.replace('_max', '');
      const existing = (filter[field] as Record<string, unknown>) || {};
      filter[field] = { ...existing, $lte: value };
    } else if (key.endsWith('_like')) {
      const field = key.replace('_like', '');
      filter[field] = { $regex: value, $options: 'i' };
    } else {
      filter[key] = value;
    }
  }

  return filter;
}
