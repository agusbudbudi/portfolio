import type { VercelRequest, VercelResponse } from '@vercel/node';

// Import all sub-handlers
import loginHandler from './_endpoints/login.js';
import usersHandler from './_endpoints/users.js';
import configHandler from './_endpoints/config.js';
import uploadHandler from './_endpoints/upload.js';
import articleMetadataHandler from './_endpoints/article-metadata.js';
import bookingsHandler from './_endpoints/bookings.js';
import mentorsHandler from './_endpoints/mentors.js';
import portfoliosHandler from './_endpoints/portfolios.js';
import adminConfigHandler from './_endpoints/admin-config.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments : typeof segments === 'string' ? segments.split('/') : [];
  const [first] = path;

  // Shift the path segment so sub-handlers receive the relative segments they expect
  req.query.path = path.slice(1);

  switch (first) {
    case 'login':
      return loginHandler(req, res);
    case 'users':
      return usersHandler(req, res);
    case 'config':
      return configHandler(req, res);
    case 'upload':
      return uploadHandler(req, res);
    case 'article-metadata':
      return articleMetadataHandler(req, res);
    case 'bookings':
      return bookingsHandler(req, res);
    case 'mentors':
      return mentorsHandler(req, res);
    case 'portfolios':
      return portfoliosHandler(req, res);
    case 'admin-config': {
      // Map the resource parameter from path for the admin-config sub-handler
      const subPath = req.query.path;
      req.query.resource = Array.isArray(subPath) ? subPath[0] : subPath;
      return adminConfigHandler(req, res);
    }
    default:
      return res.status(404).json({ error: 'not_found', message: `Route /api/${first || ''} not found` });
  }
}
