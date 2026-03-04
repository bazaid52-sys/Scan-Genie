import { z } from 'zod';
import { insertScanSchema, scans } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  scans: {
    list: {
      method: 'GET' as const,
      path: '/api/scans' as const,
      responses: {
        200: z.array(z.custom<typeof scans.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/scans' as const,
      input: insertScanSchema,
      responses: {
        201: z.custom<typeof scans.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/scans/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
