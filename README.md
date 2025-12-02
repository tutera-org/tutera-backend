
<div align="center">

![Tutera Logo](./src/img/logo.jpg)

# Tutera's Backend API

**A scalable multi-tenant Learning Management System (LMS) backend built with Node.js, TypeScript, and Express**

<img src ='https://img.shields.io/badge/License-ISC-blue.svg' alt='License' />
<img src ='https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen' alt='Node.js Version' />
<img src ='https://img.shields.io/badge/TypeScript-5.9+-blue' alt='TypeScript' />
<img src ='https://img.shields.io/badge/Express-5.1+-white' alt='Express' />

</div>

##  Table of Contents

- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## About

Tutera Backend is a comprehensive, multi-tenant Learning Management System API designed to support educational institutions, independent creators, and enterprise training programs. It provides robust features for course management, user enrollment, content delivery, and administrative operations.

Built with modern web technologies and best practices, Tutera Backend offers:

- **Multi-tenant Architecture**: Support for multiple institutions with data isolation
- **Role-based Access Control**: Granular permissions for different user types
- **Secure Content Delivery**: Protected media streaming with signed URLs
- **Scalable Design**: Built to handle growing user bases and content libraries
- **Developer-friendly**: Comprehensive API documentation and testing tools

## Features

### Multi-Tenant System
- **Institution Management**: Create and manage educational institutions
- **Independent Creators**: Support for solo educators and content creators
- **Data Isolation**: Complete separation of tenant data
- **Custom Branding**: Tenant-specific customization options

### User Management
- **Authentication & Authorization**: JWT-based secure authentication
- **Multiple User Roles**: Super Admin, Institution Admin, Creator, Learner
- **Profile Management**: Comprehensive user profile system
- **Password Security**: OTP-based password reset and change flows

### Course Management
- **Course Creation**: Rich course creation with metadata
- **Module Organization**: Structured content with modules and lessons
- **Content Types**: Support for video, PDF, audio, and text content
- **Publishing Control**: Draft and published course states
- **Course Analytics**: Detailed engagement and performance metrics

### Media Management
- **Secure Upload**: Direct multipart upload to cloud storage
- **Media Processing**: Automatic transcoding and optimization
- **Streaming Support**: Secure video streaming with signed URLs
- **File Management**: Complete CRUD operations for media assets
- **Content Protection**: Prevent unauthorized downloads

### Learning Experience
- **Course Enrollment**: Seamless enrollment process
- **Progress Tracking**: Real-time learning progress monitoring
- **Interactive Content**: Support for quizzes and assessments
- **Reviews & Ratings**: Student feedback system
- **Certificates**: Automated certificate generation

### Administration
- **Admin Dashboard**: Comprehensive platform management
- **User Management**: User activation, suspension, and moderation
- **Tenant Management**: Institution oversight and support
- **Analytics & Reporting**: Detailed platform insights
- **Audit Logging**: Complete activity tracking

### Landing Pages
- **Custom Landing Pages**: Tenant-specific public pages
- **Brand Customization**: Tailored visual identity
- **Public Course Catalog**: Discoverable course listings
- **SEO Optimization**: Search engine friendly pages

### Email System
- **Transactional Emails**: Automated email notifications
- **Email Templates**: Customizable email designs
- **Delivery Analytics**: Email performance tracking
- **Failed Email Handling: Retry mechanisms and error logging

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
├──────────────────────────────────────────────────────────────┤
│                Authentication & Authorization                │
├──────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   Courses   │ │    Users    │ │    Media    │ │  Admin  │ │
│  │   Service   │ │   Service   │ │   Service   │ │ Service │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
├──────────────────────────────────────────────────────────────┤
│                    Data Access Layer                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐ │
│  │   MongoDB   │ │    Redis    │ │   S3/Cloud  │ │  Email  │ │
│  │  Database   │ │    Cache    │ │   Storage   │ │ Service │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Design Principles

- **Microservice-ready**: Modular architecture for future microservice migration
- **Event-driven**: Async processing for media and email operations
- **Secure by Default**: Security-first approach to all implementations
- **Scalable**: Horizontal scaling capabilities
- **Maintainable**: Clean code with comprehensive testing

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.9+
- **Framework**: Express.js 5.1+
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session and data caching

### Development Tools
- **Package Manager**: npm
- **Build Tool**: tsx for TypeScript execution
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier
- **Git Hooks**: Husky for pre-commit checks
- **Testing**: Jest with TypeScript support

### Security & Performance
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Zod schemas for request validation
- **Sanitization**: Express-mongo-sanitize
- **Compression**: Response compression middleware

### Storage & Media
- **Cloud Storage**: AWS S3 / Wasabi
- **Media Processing**: FFmpeg for video transcoding
- **File Uploads**: Multer for multipart uploads
- **Image Processing**: Sharp for image optimization

### Communication
- **Email**: SendGrid / Nodemailer
- **Real-time**: Socket.io for WebSocket connections
- **Queue**: BullMQ for background job processing
- **Logging**: Winston with daily rotate files

### Documentation & Testing
- **API Docs**: [Swagger/OpenAPI 3.0](https://tutera-backend.onrender.com/api/v1/docs)
- **Interactive Docs**: Swagger UI
- **API Testing**: [Postman collections](https://documenter.getpostman.com/view/14719733/2sB3dLUrqD)
- **Documentation**: Comprehensive inline documentation

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- MongoDB 5.0 or higher
- Redis 6.0 or higher
- AWS S3 or Wasabi bucket (for media storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tutera-org/tutera-backend.git
   cd tutera-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

### Quick Start Commands

```bash
# Development
npm run dev          # Start development server with hot reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier

# Documentation
npm run swagger      # Generate Swagger documentation
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Core Configuration
```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/tutera
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Cloud Storage
```env
# AWS S3 / Wasabi
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
S3_ENDPOINT=https://s3.wasabisys.com  # For Wasabi
```

### Email Configuration
```env
# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@tutera.com
FROM_NAME=Tutera Platform

# SMTP Alternative
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Security
```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload Limits
MAX_UPLOAD_SIZE=2147483648  # 2GB in bytes
```

## API Documentation

### Interactive Documentation

Visit the interactive Swagger UI documentation:
- **Development**: `http://localhost:5000/api/v1/docs`
- **Production**: `https://tutera-backend.onrender.com/api/v1/docs`

### API Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://tutera-backend.onrender.com/api/v1`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

#### Getting a Token

1. **Register an institution/independent creator**
   ```http
   POST /auth/register/institution
   ```

2. **Login to get tokens**
   ```http
   POST /auth/login
   ```

3. **Use the access token** in subsequent requests

### API Endpoints Overview

#### Authentication
- `POST /auth/register/institution` - Register institution/independent creator
- `POST /auth/register/learner` - Register student
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `GET /auth/me` - Get current user profile
- `PATCH /auth/users/update` - Update user profile
- `POST /auth/logout` - User logout

#### Password Management
- `POST /auth/request-password-reset` - Request password reset OTP
- `PATCH /auth/reset-password` - Reset password with OTP
- `PATCH /auth/change-password` - Change password (logged in user)
- `POST /auth/refresh-otp` - Get new OTP

#### Tenant Management
- `GET /tenants/:id` - Get tenant details
- `PUT /tenants/:id` - Update tenant information

#### Course Management
- `GET /courses` - Get all courses (tenant-scoped)
- `POST /courses` - Create new course
- `GET /courses/:courseId/details` - Get course with full details
- `PUT /courses/:courseId` - Update course
- `DELETE /courses/:courseId` - Delete course
- `PATCH /courses/:courseId/publish` - Publish/unpublish course
- `GET /courses/analytics` - Get course analytics
- `GET /courses/debug-enrollments` - Debug enrollment data

#### Module Management
- `POST /courses/modules` - Create module
- `GET /modules/course/:courseId` - Get course modules

#### Media Management
- `POST /media/upload` - Upload media file
- `GET /media` - List media (paginated)
- `GET /media/:id` - Get media details
- `PUT /media/:id` - Update media
- `DELETE /media/:id` - Delete media

#### Enrollment Management
- `GET /enrollments` - Get user enrollments
- `POST /enrollments/enroll` - Enroll in course
- `PATCH /enrollments/complete-lesson` - Mark lesson complete
- `PATCH /enrollments/rate-course` - Rate a course
- `POST /enrollments/submit-quiz` - Submit quiz attempt
- `GET /enrollments/:courseId/details` - Get enrollment details

#### Progress & Reviews
- `POST /progress` - Update learning progress
- `POST /reviews` - Create course review

#### Payments
- `GET /payments` - Get payment history

#### Admin Management
- `GET /admin/users` - Get all users (super admin)
- `POST /admin/users/:id/suspend` - Suspend user
- `POST /admin/users/:id/activate` - Activate user
- `GET /admin/tenants` - Get all tenants
- `POST /admin/tenants/:id/suspend` - Suspend tenant
- `POST /admin/tenants/:id/activate` - Activate tenant
- `GET /admin/audit-logs` - Get audit logs
- `GET /admin/statistics` - Get platform statistics

#### Creator Dashboard
- `GET /creator/dashboard` - Get creator dashboard data

#### Landing Pages
- `GET /creator/landing-page` - Get landing page
- `POST /creator/landing-page` - Create landing page
- `PUT /creator/landing-page` - Update landing page
- `PATCH /creator/landing-page` - Partial update
- `DELETE /creator/landing-page` - Delete landing page
- `POST /creator/landing-page/upload-image` - Upload landing page image
- `PATCH /creator/landing-page/status` - Toggle landing page status

#### Public Endpoints
- `GET /public/landing-page/:tenantSlug` - Get public landing page

#### Email Management
- `GET /admin/failed` - Get failed emails
- `GET /admin/stats` - Get email statistics

### Response Format

All API responses follow a consistent format:

#### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {  // For paginated endpoints
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request data
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `409` - Conflict: Resource conflict
- `422` - Unprocessable Entity: Validation failed
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Database Schema

### Core Collections

#### Users
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // Hashed
  firstName: String,
  lastName: String,
  role: String, // super_admin, institution, independent_creator, learner
  tenantId: ObjectId,
  isActive: Boolean,
  avatar: String,
  phoneNumber: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tenants
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  type: String, // institution, independent_creator
  settings: {
    primaryColor: String,
    secondaryColor: String,
    logo: String,
    customDomain: String
  },
  subscription: {
    status: String, // trial, active, expired, suspended
    plan: String,
    expiresAt: Date
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Courses
```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,
  description: String,
  tenantId: ObjectId,
  instructorId: ObjectId,
  price: Number,
  currency: String,
  level: String, // beginner, intermediate, advanced
  category: String,
  tags: [String],
  thumbnail: String,
  status: String, // draft, published, archived
  isPublished: Boolean,
  enrollmentCount: Number,
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Modules
```javascript
{
  _id: ObjectId,
  courseId: ObjectId,
  title: String,
  description: String,
  order: Number,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Lessons
```javascript
{
  _id: ObjectId,
  moduleId: ObjectId,
  title: String,
  description: String,
  type: String, // video, pdf, audio, text
  contentId: ObjectId, // Reference to Media
  order: Number,
  isPreview: Boolean,
  isPublished: Boolean,
  duration: Number, // In seconds
  createdAt: Date,
  updatedAt: Date
}
```

#### Media
```javascript
{
  _id: ObjectId,
  fileName: String,
  originalName: String,
  mimeType: String,
  size: Number,
  type: String, // VIDEO, IMAGE, DOCUMENT, AUDIO
  s3Key: String,
  s3Bucket: String,
  tenantId: ObjectId,
  uploadedBy: ObjectId,
  isProtected: Boolean,
  status: String, // UPLOADING, PROCESSING, READY, FAILED
  metadata: {
    duration: Number, // For videos
    dimensions: { width: Number, height: Number }, // For images/videos
    thumbnails: [String] // Generated thumbnails
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Enrollments
```javascript
{
  _id: ObjectId,
  courseId: ObjectId,
  studentId: ObjectId,
  tenantId: ObjectId,
  status: String, // active, completed, suspended
  enrolledAt: Date,
  completedAt: Date,
  progress: {
    completedLessons: [ObjectId],
    totalLessons: Number,
    percentage: Number,
    timeSpent: Number // In seconds
  },
  rating: Number,
  review: String,
  certificate: {
    issued: Boolean,
    issuedAt: Date,
    certificateUrl: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Security

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Long-lived refresh token mechanism
- **Role-based Access**: Granular permission system
- **Password Security**: Bcrypt hashing with salt rounds

### Data Protection

- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: MongoDB sanitization
- **XSS Protection**: Helmet security headers
- **Rate Limiting**: Configurable rate limits per endpoint

### Secure Headers

```javascript
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
}
```

### CORS Configuration

Configurable CORS policy with allowed origins whitelist and credential support.

### Media Security

- **Signed URLs**: Temporary access URLs for protected content
- **Content Protection**: Prevention of unauthorized downloads
- **File Type Validation**: Strict file type checking
- **Size Limits**: Configurable upload size restrictions

### Monitoring & Logging

- **Winston Logging**: Structured logging with daily rotation
- **Health Check**: `/health` endpoint for monitoring
- **Error Tracking**: Comprehensive error handling and logging
- **Performance Metrics**: Request timing and response monitoring

### Scaling Considerations

- **Horizontal Scaling**: Stateless design for easy scaling
- **Database Indexing**: Optimized queries with proper indexing
- **Caching Strategy**: Redis caching for frequently accessed data
- **CDN Integration**: Static assets served via CDN

## Contributing

We welcome contributions to the Tutera Backend project! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Follow the existing code style
- Use TypeScript for all new code
- Add appropriate tests for new features
- Update documentation for API changes

### Commit Message Format

Follow the Conventional Commits specification:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build process or auxiliary tool changes

### Pull Request Process

1. Update the README.md with details of changes if applicable
2. Update the documentation for API changes
3. Ensure all tests pass
4. Request code review from team members

## Postman Collections

Comprehensive Postman collections are available for testing all API endpoints:

### Available Collections

- **[Tutera Complete API Collection](./src/collections/Tutera-Complete-API.postman_collection.json)** - All API endpoints
- **[Media Upload Flow](./src/collections/Tutera_Media_Upload_Flow.postman_collection.json)** - Media upload and processing workflow

### Setting Up Postman

1. **Import the collection**
   - Open Postman
   - Click "Import"
   - Select the collection file

2. **Configure environment variables**
   ```json
   {
     "baseUrl": "http://localhost:5000/api/v1",
     "token": "",
     "tenantId": "",
     "userId": ""
   }
   ```

3. **Run the collection**
   - Use the "Run" button to execute the entire collection
   - Individual endpoints can be tested separately

## Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Swagger](https://swagger.io/) - API documentation
- [SendGrid](https://sendgrid.com/) - Email service
- [AWS S3](https://aws.amazon.com/s3/) - Cloud storage

## 📞 Support

- **Documentation**: [API Docs](https://tutera-backend.onrender.com/api/v1/docs)
- **Issues**: [GitHub Issues](https://github.com/tutera-org/tutera-backend/issues)
- **Email**: tuteralms@gmail.com


---

<div align="center">

**Built with ❤️ by the Tutera Team**

[⬆ Back to top](#tutera-backend-api)

</div>
