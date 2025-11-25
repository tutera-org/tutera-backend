import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.ts';
import { apiLimiter } from './middlewares/rateLimit.middleware.ts';
//import { sanitizeData } from './middlewares/sanitize.middleware.ts';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.ts';
import { ALLOWED_ORIGINS } from './config/constants.ts';
import emailRoutes from './routes/email.routes.ts';

import authRoutes from './routes/auth.routes.ts';
import tenantRoutes from './routes/tenant.routes.ts';
import adminRoutes from './routes/admin.routes.ts';
import mediaRoutes from './routes/media.routes.ts';
import coursesRoutes from './routes/courses.routes.ts';
import enrollmentRoutes from './routes/enrollment.route.ts';
import creatorDashboardRoutes from './routes/creator-dashboard.routes.ts';

const app: Application = express();
app.use(express.json());

// Compression
app.use(compression());

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration

const allowedOrigins = ALLOWED_ORIGINS as string[];
console.log('Allowed Origins:', allowedOrigins);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow non-browser tools

      try {
        const { hostname } = new URL(origin);

        const isAllowed = allowedOrigins.some(
          (base) => hostname === base || hostname.endsWith(`.${base}`)
        );

        if (isAllowed) {
          return callback(null, true);
        }
      } catch {
        return callback(new Error('Invalid origin'));
      }

      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  })
);

// Data sanitization against NoSQL injection
//app.use(sanitizeData);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiLimiter);

// API Documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});
// API routes
app.use('/api/v1/email', emailRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenants', tenantRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/creator', creatorDashboardRoutes);
app.use('/api/v1/admin/email', adminRoutes);

// Catch-all route (for undefined endpoints)
app.all('/{*any}', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} in this server`,
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
