/**
 * Build ORDER BY clause from sort string like '-created_at' or 'name'
 */
export const buildOrderBy = (sort = '-created_at') => {
  if (sort.startsWith('-')) {
    return `${sort.slice(1)} DESC`;
  }
  return `${sort} ASC`;
};

/**
 * Build WHERE clause from filter object, returns { clause, values }
 * Skips 'sort', 'limit', 'offset' keys.
 */
export const buildWhere = (filters = {}) => {
  const skip = new Set(['sort', 'limit', 'offset']);
  const conditions = [];
  const values = [];

  for (const [key, val] of Object.entries(filters)) {
    if (skip.has(key) || val === undefined || val === null || val === '') continue;
    conditions.push(`${key} = ?`);
    values.push(val);
  }

  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, values };
};
