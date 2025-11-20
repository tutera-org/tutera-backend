import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tutera LMS API Documentation',
      version: '1.0.0',
      description:
        'Comprehensive API documentation for Tutera Learning Management System \n\n ' +
        '## Quick Start\n' +
        '1. Register an account using /auth/register/institution or /auth/register/learner\n' +
        '2. Login using /auth/login to get JWT token\n' +
        '3. Use the token in Authorization header: Bearer YOUR_TOKEN\n\n' +
        '4. User password RequestPasswordReset, ResetPassword, Update password\n\n' +
        '5. Use one time OTP to change password auth/refresh-otp\n\n' +
        '## Key Features\n' +
        '- Multi tenant architecture\n' +
        '- 60-day free trial\n' +
        '- Secure content delivery (no downloads)\n' +
        '- Transzakt payment integration\n' +
        '- Role-based access control',
      contact: {
        name: 'Tutera Support',
        email: 'support@tutera.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.tutera.com/api/v1',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration and login',
      },
      {
        name: 'Password',
        description: 'Password reset/change endpoints',
      },
      {
        name: 'OTP',
        description: 'One-time password endpoints',
      },
      {
        name: 'Tenants',
        description: 'Institution/Independent user management',
      },
      {
        name: 'Courses',
        description: 'Course operations',
      },
      {
        name: 'Modules',
        description: 'Course modules',
      },
      {
        name: 'Content',
        description: 'Video and PDF content',
      },
      {
        name: 'Enrollments',
        description: 'Course enrollments',
      },
      {
        name: 'Progress',
        description: 'Learning progress',
      },
      {
        name: 'Reviews',
        description: 'Course reviews',
      },
      {
        name: 'Payments',
        description: 'Payment history',
      },
      {
        name: 'Admin',
        description: 'Platform administration',
      },
    ],
    paths: {
      '/auth/register/institution': {
        post: {
          tags: ['Authentication'],
          summary: 'Register Institution/Independent User',
          description: 'Creates new account with 60-day free trial',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'firstName', 'lastName', 'role'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'admin@university.com',
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                      example: 'SecurePass@123',
                    },
                    firstName: {
                      type: 'string',
                      example: 'John',
                    },
                    lastName: {
                      type: 'string',
                      example: 'Doe',
                    },
                    role: {
                      type: 'string',
                      enum: ['institution', 'independent_user'],
                      example: 'institution',
                    },
                    phoneNumber: {
                      type: 'string',
                      example: '+1234567890',
                    },
                    tenantName: {
                      type: 'string',
                      example: 'My University',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Registration successful',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Registration successful',
                    data: {
                      user: {
                        id: '507f1f77bcf86cd799439011',
                        email: 'admin@university.com',
                        firstName: 'John',
                        lastName: 'Doe',
                        role: 'institution',
                      },
                      tokens: {
                        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
            },
            '409': {
              description: 'Email already exists',
            },
          },
        },
      },
      '/auth/users/update': {
        patch: {
          tags: ['Authentication'],
          summary: 'Update User Details',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: {
                      type: 'string',
                      example: 'John',
                    },
                    lastName: {
                      type: 'string',
                      example: 'Doe',
                    },
                    phoneNumber: {
                      type: 'string',
                      example: '08034567890',
                    },
                    avatar: {
                      type: 'string',
                      format: 'url',
                      example: 'https://example.com/avatar.jpg',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'User details updated successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'User details updated successfully',
                    data: {
                      id: '507f1f77bcf86cd799439011',
                      email: 'exampl@emil.com',
                      firstName: 'John',
                      lastName: 'Doe',
                      phoneNumber: '+2348034567890',
                      avatar: 'https://example.com/avatar.jpg',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/auth/register/learner': {
        post: {
          tags: ['Authentication'],
          summary: 'Register Learner (Student)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'firstName', 'lastName', 'tenantId'],
                  properties: {
                    email: {
                      type: 'string',
                      example: 'student@example.com',
                    },
                    password: {
                      type: 'string',
                      example: 'SecurePass@123',
                    },
                    firstName: {
                      type: 'string',
                      example: 'Jane',
                    },
                    lastName: {
                      type: 'string',
                      example: 'Smith',
                    },
                    tenantId: {
                      type: 'string',
                      example: '507f1f77bcf86cd799439011',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Registration successful',
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'User Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: {
                      type: 'string',
                      example: 'user@example.com',
                    },
                    password: {
                      type: 'string',
                      example: 'SecurePass@123',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Login successful',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      user: {
                        id: '507f1f77bcf86cd799439011',
                        email: 'user@example.com',
                        role: 'learner',
                      },
                      tokens: {
                        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
            },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Authentication'],
          summary: 'Get Current User',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'User profile',
            },
            '401': {
              description: 'Unauthorized',
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'User Logout',
          responses: {
            '200': { description: 'Logout successful' },
          },
        },
      },
      '/auth/request-password-reset': {
        post: {
          tags: ['Password'],
          summary: 'Request Password Reset',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Password reset OTP sent' },
          },
        },
      },
      '/auth/reset-password': {
        patch: {
          tags: ['Password'],
          summary: 'Reset Password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'otpCode', 'newPassword'],
                  properties: {
                    email: { type: 'string', example: 'user@example.com' },
                    otpCode: { type: 'string', example: '123456' },
                    newPassword: { type: 'string', example: 'NewSecurePass@123' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Password reset successful' },
            '400': { description: 'Invalid or expired OTP' },
          },
        },
      },
      '/auth/change-password': {
        patch: {
          tags: ['Password'],
          summary: 'Change Password (Logged-in User)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'currentPassword', 'otpCode', 'newPassword'],
                  properties: {
                    userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    currentPassword: { type: 'string', example: 'OldPass@123' },
                    otpCode: { type: 'string', example: '654321' },
                    newPassword: { type: 'string', example: 'NewPass@456' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Password changed successfully' },
            '400': { description: 'Invalid credentials or OTP' },
          },
        },
      },
      '/auth/refresh-otp': {
        post: {
          tags: ['OTP'],
          summary: 'Refresh OTP',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: {
                    userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'OTP sent successfully' },
          },
        },
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh Access Token',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    refreshToken: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Token refreshed',
            },
          },
        },
      },
      '/tenants': {
        get: {
          tags: ['Tenants'],
          summary: 'Get All Tenants',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20 },
            },
          ],
          responses: {
            '200': {
              description: 'Tenants list',
            },
          },
        },
      },
      '/tenants/{id}': {
        get: {
          tags: ['Tenants'],
          summary: 'Get Tenant by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Tenant details',
            },
          },
        },
        put: {
          tags: ['Tenants'],
          summary: 'Update Tenant',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    settings: {
                      type: 'object',
                      properties: {
                        primaryColor: { type: 'string', example: '#3B82F6' },
                        secondaryColor: { type: 'string', example: '#10B981' },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Tenant updated',
            },
          },
        },
      },
      '/tenants/{id}/subscribe': {
        post: {
          tags: ['Tenants'],
          summary: 'Subscribe to Plan',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['subscriptionType', 'paymentMethodId'],
                  properties: {
                    subscriptionType: {
                      type: 'string',
                      enum: ['monthly', 'quarterly', 'semi_annual', 'annual'],
                      example: 'monthly',
                    },
                    paymentMethodId: {
                      type: 'string',
                      example: 'pm_1234567890',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Subscription created',
            },
          },
        },
      },
      '/courses': {
        get: {
          tags: ['Courses'],
          summary: 'Get All Courses',
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1 },
            },
            {
              name: 'category',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'level',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['beginner', 'intermediate', 'advanced'],
              },
            },
          ],
          responses: {
            '200': {
              description: 'Courses list',
            },
          },
        },
        post: {
          tags: ['Courses'],
          summary: 'Create Course',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'price', 'category'],
                  properties: {
                    title: {
                      type: 'string',
                      example: 'Introduction to Python',
                    },
                    description: {
                      type: 'string',
                      example: 'Learn Python from scratch',
                    },
                    price: {
                      type: 'number',
                      example: 49.99,
                    },
                    category: {
                      type: 'string',
                      example: 'Programming',
                    },
                    level: {
                      type: 'string',
                      enum: ['beginner', 'intermediate', 'advanced'],
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Course created',
            },
          },
        },
      },
      '/courses/search': {
        get: {
          tags: ['Courses'],
          summary: 'Search Courses',
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: 'Search query',
            },
          ],
          responses: {
            '200': {
              description: 'Search results',
            },
          },
        },
      },
      '/courses/{id}': {
        get: {
          tags: ['Courses'],
          summary: 'Get Course Details',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Course details',
            },
          },
        },
        put: {
          tags: ['Courses'],
          summary: 'Update Course',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Course updated',
            },
          },
        },
        delete: {
          tags: ['Courses'],
          summary: 'Delete Course',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Course deleted',
            },
          },
        },
      },
      '/courses/{id}/publish': {
        post: {
          tags: ['Courses'],
          summary: 'Publish Course',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Course published',
            },
          },
        },
      },
      '/modules': {
        post: {
          tags: ['Modules'],
          summary: 'Create Module',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['courseId', 'title'],
                  properties: {
                    courseId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    order: { type: 'integer', default: 0 },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Module created',
            },
          },
        },
      },
      '/modules/course/{courseId}': {
        get: {
          tags: ['Modules'],
          summary: 'Get Course Modules',
          parameters: [
            {
              name: 'courseId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Modules list',
            },
          },
        },
      },
      '/media/upload': {
        post: {
          tags: ['Content'],
          summary: 'Upload Media',
          description:
            'Direct multipart upload handled entirely by the backend.' +
            ' Default limit is 2GB unless MAX_UPLOAD_SIZE overrides it.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Media file to upload',
                    },
                    type: {
                      type: 'string',
                      enum: ['VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO'],
                      description: 'Optional override. Backend auto-detects using MIME/extension.',
                    },
                    isProtected: {
                      type: 'boolean',
                      description: 'If true, responses include temporary signed URLs only',
                      default: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Media uploaded',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      mediaId: '507f1f77bcf86cd799439011',
                      signedUrl: 'https://s3.wasabisys.com/.../media.mp4?X-Amz-Algorithm=...',
                      s3Key: 'tenants/<tenantId>/media/<timestamp>-<uuid>-file.mp4',
                      status: 'UPLOADED',
                      fileName: 'file.mp4',
                      type: 'VIDEO',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error (missing file/type or file too large)',
            },
          },
        },
      },
      '/media': {
        get: {
          tags: ['Content'],
          summary: 'List Media',
          description: 'Returns paginated media for the authenticated tenant.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', minimum: 1, default: 1 },
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            '200': {
              description: 'Media list retrieved',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '507f1f77bcf86cd799439011',
                        fileName: 'intro.mp4',
                        type: 'VIDEO',
                        status: 'READY',
                        createdAt: '2025-11-17T10:00:00.000Z',
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 1,
                      totalPages: 1,
                      hasNextPage: false,
                      hasPrevPage: false,
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/media/{id}': {
        get: {
          tags: ['Content'],
          summary: 'Get Media',
          description: 'Returns a single media record plus signed URL (for protected assets).',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Media retrieved',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      _id: '507f1f77bcf86cd799439011',
                      fileName: 'intro.mp4',
                      type: 'VIDEO',
                      status: 'READY',
                      signedUrl: 'https://s3.wasabisys.com/.../media.mp4?X-Amz-Algorithm=...',
                    },
                  },
                },
              },
            },
            '404': { description: 'Media not found' },
          },
        },
        put: {
          tags: ['Content'],
          summary: 'Update Media',
          description:
            'Replace the underlying file (multipart optional) and/or update metadata.' +
            ' Use this to adjust type or protection status.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: false,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'Optional new file to upload and replace the existing object',
                    },
                    type: {
                      type: 'string',
                      enum: ['VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO'],
                    },
                    isProtected: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Media updated',
            },
            '404': { description: 'Media not found' },
          },
        },
        delete: {
          tags: ['Content'],
          summary: 'Delete Media',
          description: 'Removes the media record and associated S3 objects.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Media deleted',
            },
            '404': { description: 'Media not found' },
          },
        },
      },
      '/contents/upload-pdf': {
        post: {
          tags: ['Content'],
          summary: 'Upload PDF',
          description: 'Upload PDF document (max 50MB)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['pdf', 'moduleId', 'courseId', 'title'],
                  properties: {
                    pdf: {
                      type: 'string',
                      format: 'binary',
                    },
                    moduleId: { type: 'string' },
                    courseId: { type: 'string' },
                    title: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'PDF uploaded',
            },
          },
        },
      },
      '/contents/{id}/access': {
        get: {
          tags: ['Content'],
          summary: 'Get Content Access URL',
          description: 'Returns signed URL (1-hour expiration, no download)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Access URL generated',
              content: {
                'application/json': {
                  example: {
                    accessUrl: 'https://cloudfront.net/video.mp4?signature=...',
                    expiresIn: 3600,
                  },
                },
              },
            },
          },
        },
      },
      '/enrollments': {
        post: {
          tags: ['Enrollments'],
          summary: 'Enroll in Course',
          description: 'Enroll with payment processing',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['courseId', 'paymentMethodId'],
                  properties: {
                    courseId: { type: 'string' },
                    paymentMethodId: {
                      type: 'string',
                      description: 'Stripe payment method ID',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Enrollment successful',
            },
          },
        },
        get: {
          tags: ['Enrollments'],
          summary: 'Get My Enrollments',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Enrollments list',
            },
          },
        },
      },
      '/progress': {
        post: {
          tags: ['Progress'],
          summary: 'Update Progress',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['contentId', 'courseId'],
                  properties: {
                    contentId: { type: 'string' },
                    courseId: { type: 'string' },
                    completed: { type: 'boolean' },
                    timeSpent: { type: 'number' },
                    lastPosition: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Progress updated',
            },
          },
        },
      },
      '/reviews': {
        post: {
          tags: ['Reviews'],
          summary: 'Create Review',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['courseId', 'rating'],
                  properties: {
                    courseId: { type: 'string' },
                    rating: {
                      type: 'integer',
                      minimum: 1,
                      maximum: 5,
                    },
                    comment: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Review created',
            },
          },
        },
      },
      '/payments': {
        get: {
          tags: ['Payments'],
          summary: 'Get Payment History',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Payment history',
            },
          },
        },
      },
      '/admin/users': {
        get: {
          tags: ['Admin'],
          summary: 'Get All Users (Super Admin)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'role',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Users list',
            },
          },
        },
      },
      '/admin/statistics': {
        get: {
          tags: ['Admin'],
          summary: 'Platform Statistics (Super Admin)',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Platform statistics',
              content: {
                'application/json': {
                  example: {
                    overview: {
                      totalUsers: 1500,
                      totalTenants: 50,
                      totalCourses: 200,
                      totalRevenue: 150000,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/.ts', './src/controllers/.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
