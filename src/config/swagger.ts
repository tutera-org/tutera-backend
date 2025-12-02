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
        '- 30-day free trial\n' +
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
        url: 'https://tutera-backend.onrender.com/api/v1',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and profile management',
      },
      {
        name: 'Password',
        description: 'Password reset and change endpoints',
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
        description: 'Course creation, management, and analytics',
      },
      {
        name: 'Modules',
        description: 'Course modules management',
      },
      {
        name: 'Media',
        description: 'Media upload, management, and processing',
      },
      {
        name: 'Content',
        description: 'Video and PDF content management',
      },
      {
        name: 'Enrollments',
        description: 'Course enrollments and student progress',
      },
      {
        name: 'Progress',
        description: 'Learning progress tracking',
      },
      {
        name: 'Reviews',
        description: 'Course reviews and ratings',
      },
      {
        name: 'Payments',
        description: 'Payment history and transactions',
      },
      {
        name: 'Admin',
        description: 'Platform administration and management',
      },
      {
        name: 'Creator Dashboard',
        description: 'Creator-specific dashboard endpoints',
      },
      {
        name: 'Landing Page',
        description: 'Landing page management and customization',
      },
      {
        name: 'Public',
        description: 'Publicly accessible endpoints',
      },
      {
        name: 'Email',
        description: 'Email management and analytics',
      },
    ],
    paths: {
      '/auth/register/institution': {
        post: {
          tags: ['Authentication'],
          summary: 'Register Institution/Independent User',
          description: 'Creates new account with 30-day free trial',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password', 'role', 'tenantName'],
                  properties: {
                    email: {
                      type: 'string',
                      format: 'email',
                      example: 'admin@gmail.com',
                    },
                    password: {
                      type: 'string',
                      minLength: 8,
                      example: 'SecurePass@123',
                    },
                    role: {
                      type: 'string',
                      enum: ['institution', 'independent_user'],
                      example: 'institution',
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
                        _id: '656a1b2c3d4e5f6789012345',
                        email: 'admin@university.edu',
                        role: 'institution',
                        firstName: 'John',
                        lastName: 'Doe',
                        tenantId: '656a1b2c3d4e5f6789012346',
                        isActive: true,
                        createdAt: '2023-12-01T10:00:00.000Z',
                      },
                      tenant: {
                        _id: '656a1b2c3d4e5f6789012346',
                        name: 'University of Technology',
                        slug: 'university-of-technology',
                        type: 'institution',
                        isActive: true,
                        subscription: {
                          status: 'trial',
                          plan: 'free',
                          expiresAt: '2024-01-01T00:00:00.000Z',
                        },
                        createdAt: '2023-12-01T10:00:00.000Z',
                      },
                      tokens: {
                        accessToken:
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTZhMWIyYzNkNGU1ZjY3ODkwMTIzNDUiLCJlbWFpbCI6ImFkbWluQHVuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzAxNDM2ODAwLCJleHAiOjE3MDE0NDA0MDB9.signature',
                        refreshToken:
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTZhMWIyYzNkNGU1ZjY3ODkwMTIzNDUiLCJlbWFpbCI6ImFkbWluQHVuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzAxNDM2ODAwLCJleHAiOjE3MDE1MjMyMDB9.signature',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'email',
                        message: 'Invalid email format',
                      },
                      {
                        field: 'password',
                        message: 'Password must be at least 8 characters long',
                      },
                    ],
                  },
                },
              },
            },
            '409': {
              description: 'Email already exists',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Email already registered',
                    error: 'USER_EXISTS',
                  },
                },
              },
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
                      example: 'student@gmail.com',
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
                      example: 'user@gmail.com',
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
                    message: 'Login successful',
                    data: {
                      user: {
                        _id: '656a1b2c3d4e5f6789012345',
                        email: 'admin@university.edu',
                        role: 'institution',
                        firstName: 'John',
                        lastName: 'Doe',
                        phoneNumber: '+1234567890',
                        avatar: 'https://example.com/avatar.jpg',
                        isActive: true,
                        tenantId: '656a1b2c3d4e5f6789012346',
                        createdAt: '2023-12-01T10:00:00.000Z',
                      },
                      tenant: {
                        _id: '656a1b2c3d4e5f6789012346',
                        name: 'University of Technology',
                        slug: 'university-of-technology',
                        type: 'institution',
                        isActive: true,
                        settings: {
                          primaryColor: '#3B82F6',
                          secondaryColor: '#10B981',
                        },
                      },
                      tokens: {
                        accessToken:
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTZhMWIyYzNkNGU1ZjY3ODkwMTIzNDUiLCJlbWFpbCI6ImFkbWluQHVuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzAxNDM2ODAwLCJleHAiOjE3MDE0NDA0MDB9.signature',
                        refreshToken:
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTZhMWIyYzNkNGU1ZjY3ODkwMTIzNDUiLCJlbWFpbCI6ImFkbWluQHVuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzAxNDM2ODAwLCJleHAiOjE3MDE1MjMyMDB9.signature',
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Invalid email or password',
                    error: 'INVALID_CREDENTIALS',
                  },
                },
              },
            },
            '403': {
              description: 'Account suspended',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Your account has been suspended',
                    error: 'ACCOUNT_SUSPENDED',
                  },
                },
              },
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
              description: 'User profile retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      _id: '656a1b2c3d4e5f6789012345',
                      email: 'admin@university.edu',
                      role: 'institution',
                      firstName: 'John',
                      lastName: 'Doe',
                      phoneNumber: '+1234567890',
                      avatar: 'https://example.com/avatar.jpg',
                      isActive: true,
                      tenantId: '656a1b2c3d4e5f6789012346',
                      createdAt: '2023-12-01T10:00:00.000Z',
                      updatedAt: '2023-12-01T11:00:00.000Z',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access token is missing or invalid',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'User Logout',
          responses: {
            '200': {
              description: 'Logout successful',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Logout successful',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access token is missing or invalid',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
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
                    email: { type: 'string', example: 'user@gmail.com' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Password reset OTP sent successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Password reset OTP sent to your email',
                    data: {
                      email: 'admin@testinstitution.com',
                      otpExpiresIn: 600,
                      resetToken: 'reset_token_123456',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'email',
                        message: 'Email is required',
                      },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Email not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'No account found with this email',
                    error: 'EMAIL_NOT_FOUND',
                  },
                },
              },
            },
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
                    email: { type: 'string', example: 'user@gmail.com' },
                    otpCode: { type: 'string', example: '123456' },
                    newPassword: { type: 'string', example: 'NewSecurePass@123' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Password reset successful',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Password reset successful',
                    data: {
                      email: 'admin@testinstitution.com',
                      resetAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid or expired OTP',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Invalid or expired OTP',
                    error: 'INVALID_OTP',
                    data: {
                      attemptsRemaining: 2,
                      otpExpired: true,
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Email not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'No account found with this email',
                    error: 'EMAIL_NOT_FOUND',
                  },
                },
              },
            },
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
            '200': {
              description: 'Password changed successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Password changed successfully',
                    data: {
                      userId: '656a1b2c3d4e5f6789012345',
                      changedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid credentials or OTP',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Invalid current password or OTP',
                    error: 'INVALID_CREDENTIALS',
                    data: {
                      attemptsRemaining: 2,
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access token is missing or invalid',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
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
            '200': {
              description: 'OTP sent successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'New OTP sent to your email',
                    data: {
                      userId: '656a1b2c3d4e5f6789012345',
                      otpExpiresIn: 600,
                      sentAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'userId',
                        message: 'User ID is required',
                      },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'User not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND',
                  },
                },
              },
            },
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
              description: 'Token refreshed successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Token refreshed successfully',
                    data: {
                      accessToken:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTZhMWIyYzNkNGU1ZjY3ODkwMTIzNDUiLCJlbWFpbCI6ImFkbWluQHVuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzAxNDM2ODAwLCJleHAiOjE3MDE0NDA0MDB9.signature',
                      refreshToken:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NTZhMWIyYzNkNGU1ZjY3ODkwMTIzNDUiLCJlbWFpbCI6ImFkbWluQHVuaXZlcnNpdHkuZWR1IiwiaWF0IjoxNzAxNDM2ODAwLCJleHAiOjE3MDE1MjMyMDB9.signature',
                      expiresIn: 3600,
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Invalid refresh token',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Invalid or expired refresh token',
                    error: 'INVALID_REFRESH_TOKEN',
                  },
                },
              },
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
              description: 'Tenants list retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '656a1b2c3d4e5f6789012346',
                        name: 'University of Technology',
                        slug: 'university-of-technology',
                        type: 'institution',
                        isActive: true,
                        subscription: {
                          status: 'active',
                          plan: 'premium',
                          expiresAt: '2024-12-01T00:00:00.000Z',
                        },
                        userCount: 150,
                        courseCount: 25,
                        createdAt: '2023-12-01T10:00:00.000Z',
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: 50,
                      totalPages: 3,
                      hasNextPage: true,
                      hasPrevPage: false,
                    },
                  },
                },
              },
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
              description: 'Tenant details retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      _id: '656a1b2c3d4e5f6789012346',
                      name: 'University of Technology',
                      slug: 'university-of-technology',
                      description: 'Leading institution in technology education',
                      type: 'institution',
                      settings: {
                        primaryColor: '#3B82F6',
                        secondaryColor: '#10B981',
                        logo: 'https://example.com/logo.png',
                      },
                      subscription: {
                        status: 'active',
                        plan: 'premium',
                        expiresAt: '2024-12-01T00:00:00.000Z',
                      },
                      isActive: true,
                      userCount: 150,
                      courseCount: 25,
                      createdAt: '2023-12-01T10:00:00.000Z',
                      updatedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Tenant not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Tenant not found',
                    error: 'TENANT_NOT_FOUND',
                  },
                },
              },
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
              description: 'Tenant updated successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Tenant updated successfully',
                    data: {
                      _id: '656a1b2c3d4e5f6789012346',
                      name: 'Updated University Name',
                      slug: 'university-of-technology',
                      description: 'Updated description',
                      type: 'institution',
                      settings: {
                        primaryColor: '#3B82F6',
                        secondaryColor: '#10B981',
                        logo: 'https://example.com/logo.png',
                      },
                      updatedAt: '2023-12-01T11:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'name',
                        message: 'Name is required',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
            '404': {
              description: 'Tenant not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Tenant not found',
                    error: 'TENANT_NOT_FOUND',
                  },
                },
              },
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
              description: 'Subscription created successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Subscription created successfully',
                    data: {
                      subscriptionId: 'sub_656a1b2c3d4e5f678901234f',
                      tenantId: '656a1b2c3d4e5f6789012346',
                      subscriptionType: 'monthly',
                      status: 'active',
                      plan: 'premium',
                      nextBillingDate: '2024-01-01T00:00:00.000Z',
                      amount: 99.99,
                      currency: 'USD',
                      paymentMethodId: 'pm_1234567890',
                      createdAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'subscriptionType',
                        message: 'Subscription type is required',
                      },
                      {
                        field: 'paymentMethodId',
                        message: 'Payment method ID is required',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
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
              description: 'Courses list retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '656a1b2c3d4e5f6789012347',
                        title: 'Introduction to Web Development',
                        slug: 'intro-web-dev',
                        description: 'Learn web development from scratch',
                        level: 'beginner',
                        category: 'Programming',
                        price: 99.99,
                        currency: 'USD',
                        thumbnail: 'https://example.com/thumbnail.jpg',
                        status: 'published',
                        isPublished: true,
                        enrollmentCount: 150,
                        rating: 4.5,
                        reviewCount: 30,
                        instructorId: '656a1b2c3d4e5f6789012345',
                        instructor: {
                          firstName: 'John',
                          lastName: 'Doe',
                        },
                        createdAt: '2023-12-01T10:00:00.000Z',
                        updatedAt: '2023-12-01T10:00:00.000Z',
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 25,
                      totalPages: 3,
                      hasNextPage: true,
                      hasPrevPage: false,
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access token is missing or invalid',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
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
              description: 'Course created successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Course created successfully',
                    data: {
                      _id: '656a1b2c3d4e5f6789012348',
                      title: 'Advanced JavaScript',
                      slug: 'advanced-javascript',
                      description: 'Master advanced JavaScript concepts',
                      level: 'advanced',
                      category: 'Programming',
                      price: 149.99,
                      currency: 'USD',
                      status: 'draft',
                      isPublished: false,
                      enrollmentCount: 0,
                      rating: 0,
                      reviewCount: 0,
                      instructorId: '656a1b2c3d4e5f6789012345',
                      tenantId: '656a1b2c3d4e5f6789012346',
                      createdAt: '2023-12-01T10:00:00.000Z',
                      updatedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'title',
                        message: 'Title is required',
                      },
                      {
                        field: 'price',
                        message: 'Price must be a positive number',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access token is missing or invalid',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
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
              description: 'Search results retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '656a1b2c3d4e5f6789012347',
                        title: 'Introduction to Web Development',
                        slug: 'intro-web-dev',
                        description: 'Learn web development from scratch',
                        level: 'beginner',
                        category: 'Programming',
                        price: 99.99,
                        currency: 'USD',
                        thumbnail: 'https://example.com/thumbnail.jpg',
                        status: 'published',
                        isPublished: true,
                        enrollmentCount: 150,
                        rating: 4.5,
                        reviewCount: 30,
                        instructorId: '656a1b2c3d4e5f6789012345',
                        instructor: {
                          firstName: 'John',
                          lastName: 'Doe',
                        },
                        relevanceScore: 0.95,
                        createdAt: '2023-12-01T10:00:00.000Z',
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 5,
                      totalPages: 1,
                      hasNextPage: false,
                      hasPrevPage: false,
                    },
                    searchMeta: {
                      query: 'web development',
                      searchTime: 0.05,
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Search query is required',
                    error: 'QUERY_REQUIRED',
                  },
                },
              },
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
              description: 'Course details retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      _id: '656a1b2c3d4e5f6789012347',
                      title: 'Introduction to Web Development',
                      slug: 'intro-web-dev',
                      description:
                        'Learn web development from scratch with HTML, CSS, and JavaScript',
                      level: 'beginner',
                      category: 'Programming',
                      price: 99.99,
                      currency: 'USD',
                      thumbnail: 'https://example.com/thumbnail.jpg',
                      status: 'published',
                      isPublished: true,
                      enrollmentCount: 150,
                      rating: 4.5,
                      reviewCount: 30,
                      instructorId: '656a1b2c3d4e5f6789012345',
                      instructor: {
                        firstName: 'John',
                        lastName: 'Doe',
                        avatar: 'https://example.com/instructor-avatar.jpg',
                        bio: 'Experienced web developer with 10+ years in the industry',
                      },
                      modules: [
                        {
                          _id: '656a1b2c3d4e5f6789012349',
                          title: 'Module 1: HTML Basics',
                          order: 1,
                          lessonsCount: 5,
                          duration: 120,
                        },
                      ],
                      tags: ['web', 'html', 'css', 'javascript', 'frontend'],
                      requirements: ['Basic computer skills', 'Text editor'],
                      learningOutcomes: ['Build responsive websites', 'Understand web standards'],
                      createdAt: '2023-12-01T10:00:00.000Z',
                      updatedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Course not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Course not found',
                    error: 'COURSE_NOT_FOUND',
                  },
                },
              },
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
              description: 'Course updated successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Course updated successfully',
                    data: {
                      _id: '656a1b2c3d4e5f6789012347',
                      title: 'Updated Course Title',
                      slug: 'updated-course-title',
                      description: 'Updated course description',
                      level: 'intermediate',
                      category: 'Programming',
                      price: 149.99,
                      currency: 'USD',
                      updatedAt: '2023-12-01T11:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'title',
                        message: 'Title is required',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
            '404': {
              description: 'Course not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Course not found',
                    error: 'COURSE_NOT_FOUND',
                  },
                },
              },
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
              description: 'Course deleted successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Course deleted successfully',
                    data: {
                      courseId: '656a1b2c3d4e5f6789012347',
                      deletedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
            '404': {
              description: 'Course not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Course not found',
                    error: 'COURSE_NOT_FOUND',
                  },
                },
              },
            },
            '409': {
              description: 'Cannot delete course with active enrollments',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Cannot delete course with active enrollments',
                    error: 'COURSE_HAS_ENROLLMENTS',
                    data: {
                      enrollmentCount: 25,
                    },
                  },
                },
              },
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
              description: 'Course published successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Course published successfully',
                    data: {
                      courseId: '656a1b2c3d4e5f6789012347',
                      status: 'published',
                      isPublished: true,
                      publishedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
            '404': {
              description: 'Course not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Course not found',
                    error: 'COURSE_NOT_FOUND',
                  },
                },
              },
            },
            '400': {
              description: 'Cannot publish incomplete course',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Course must have at least one module and lesson to be published',
                    error: 'COURSE_INCOMPLETE',
                  },
                },
              },
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
              description: 'Module created successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Module created successfully',
                    data: {
                      _id: '656a1b2c3d4e5f6789012349',
                      courseId: '656a1b2c3d4e5f6789012347',
                      title: 'Module 1: Getting Started',
                      description: 'Introduction to the course basics',
                      order: 1,
                      isPublished: false,
                      createdAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'courseId',
                        message: 'Course ID is required',
                      },
                      {
                        field: 'title',
                        message: 'Module title is required',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
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
              description: 'Modules list retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '656a1b2c3d4e5f6789012349',
                        courseId: '656a1b2c3d4e5f6789012347',
                        title: 'Module 1: Getting Started',
                        description: 'Introduction to the course basics',
                        order: 1,
                        isPublished: true,
                        lessonsCount: 5,
                        totalDuration: 180,
                        createdAt: '2023-12-01T10:00:00.000Z',
                      },
                      {
                        _id: '656a1b2c3d4e5f678901234a',
                        courseId: '656a1b2c3d4e5f6789012347',
                        title: 'Module 2: Advanced Topics',
                        description: 'Deep dive into advanced concepts',
                        order: 2,
                        isPublished: false,
                        lessonsCount: 8,
                        totalDuration: 240,
                        createdAt: '2023-12-01T10:00:00.000Z',
                      },
                    ],
                  },
                },
              },
            },
            '404': {
              description: 'Course not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Course not found',
                    error: 'COURSE_NOT_FOUND',
                  },
                },
              },
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
              description: 'Media uploaded successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Media uploaded successfully',
                    data: {
                      mediaId: '656a1b2c3d4e5f678901234b',
                      fileName: 'intro-video.mp4',
                      originalName: 'course-introduction.mp4',
                      mimeType: 'video/mp4',
                      size: 52428800,
                      type: 'VIDEO',
                      s3Key:
                        'tenants/656a1b2c3d4e5f6789012346/media/1701436800000-uuid-intro-video.mp4',
                      s3Bucket: 'tutera-media',
                      signedUrl:
                        'https://s3.wasabisys.com/tutera-media/tenants/656a1b2c3d4e5f6789012346/media/1701436800000-uuid-intro-video.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...',
                      isProtected: true,
                      status: 'UPLOADING',
                      tenantId: '656a1b2c3d4e5f6789012346',
                      uploadedBy: '656a1b2c3d4e5f6789012345',
                      createdAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error (missing file/type or file too large)',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'file',
                        message: 'File is required',
                      },
                      {
                        field: 'file',
                        message: 'File size exceeds maximum limit of 2GB',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access token is missing or invalid',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
            '413': {
              description: 'Payload too large',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'File size exceeds maximum limit of 2GB',
                    error: 'FILE_TOO_LARGE',
                  },
                },
              },
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
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Enrollment successful',
                    data: {
                      enrollmentId: '656a1b2c3d4e5f678901234c',
                      courseId: '656a1b2c3d4e5f6789012347',
                      userId: '656a1b2c3d4e5f6789012345',
                      status: 'active',
                      enrolledAt: '2023-12-01T10:00:00.000Z',
                      payment: {
                        paymentId: 'pay_656a1b2c3d4e5f678901234d',
                        amount: 99.99,
                        currency: 'USD',
                        status: 'completed',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error or already enrolled',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Already enrolled in this course',
                    error: 'ALREADY_ENROLLED',
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ['Enrollments'],
          summary: 'Get My Enrollments',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Enrollments list retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '656a1b2c3d4e5f678901234c',
                        course: {
                          _id: '656a1b2c3d4e5f6789012347',
                          title: 'Introduction to Web Development',
                          thumbnail: 'https://example.com/thumbnail.jpg',
                          instructor: {
                            firstName: 'John',
                            lastName: 'Doe',
                          },
                        },
                        status: 'active',
                        progress: {
                          completedLessons: 3,
                          totalLessons: 10,
                          percentage: 30,
                        },
                        enrolledAt: '2023-12-01T10:00:00.000Z',
                        lastAccessedAt: '2023-12-01T15:30:00.000Z',
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 5,
                      totalPages: 1,
                      hasNextPage: false,
                      hasPrevPage: false,
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
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
              description: 'Progress updated successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Progress updated successfully',
                    data: {
                      progressId: '656a1b2c3d4e5f678901234e',
                      contentId: '656a1b2c3d4e5f678901234f',
                      courseId: '656a1b2c3d4e5f6789012347',
                      userId: '656a1b2c3d4e5f6789012345',
                      completed: true,
                      timeSpent: 1800,
                      lastPosition: 300,
                      completedAt: '2023-12-01T10:30:00.000Z',
                      overallProgress: {
                        completedLessons: 4,
                        totalLessons: 10,
                        percentage: 40,
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'contentId',
                        message: 'Content ID is required',
                      },
                      {
                        field: 'courseId',
                        message: 'Course ID is required',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
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
              description: 'Review created successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Review created successfully',
                    data: {
                      _id: '656a1b2c3d4e5f6789012350',
                      courseId: '656a1b2c3d4e5f6789012347',
                      userId: '656a1b2c3d4e5f6789012345',
                      rating: 5,
                      comment: 'Excellent course! Very well structured and easy to follow.',
                      isVerified: true,
                      helpfulCount: 12,
                      createdAt: '2023-12-01T10:00:00.000Z',
                      user: {
                        firstName: 'Jane',
                        lastName: 'Smith',
                        avatar: 'https://example.com/avatar.jpg',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'rating',
                        message: 'Rating must be between 1 and 5',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
            '409': {
              description: 'Review already exists',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'You have already reviewed this course',
                    error: 'REVIEW_EXISTS',
                  },
                },
              },
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
              description: 'Payment history retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '656a1b2c3d4e5f6789012351',
                        type: 'course_enrollment',
                        amount: 99.99,
                        currency: 'USD',
                        status: 'completed',
                        paymentMethod: 'card',
                        stripePaymentId: 'pay_656a1b2c3d4e5f6789012352',
                        createdAt: '2023-12-01T10:00:00.000Z',
                        course: {
                          _id: '656a1b2c3d4e5f6789012347',
                          title: 'Introduction to Web Development',
                        },
                      },
                      {
                        _id: '656a1b2c3d4e5f6789012353',
                        type: 'subscription',
                        amount: 29.99,
                        currency: 'USD',
                        status: 'completed',
                        paymentMethod: 'card',
                        stripePaymentId: 'pay_656a1b2c3d4e5f6789012354',
                        createdAt: '2023-11-01T10:00:00.000Z',
                        subscription: {
                          plan: 'monthly',
                          status: 'active',
                        },
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 15,
                      totalPages: 2,
                      hasNextPage: true,
                      hasPrevPage: false,
                    },
                    summary: {
                      totalSpent: 129.98,
                      totalPayments: 2,
                      currency: 'USD',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
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
              description: 'Users list retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      {
                        _id: '656a1b2c3d4e5f6789012345',
                        email: 'admin@university.edu',
                        firstName: 'John',
                        lastName: 'Doe',
                        role: 'institution',
                        isActive: true,
                        tenantId: '656a1b2c3d4e5f6789012346',
                        tenant: {
                          name: 'University of Technology',
                          slug: 'university-of-technology',
                        },
                        createdAt: '2023-12-01T10:00:00.000Z',
                        lastLoginAt: '2023-12-01T09:30:00.000Z',
                      },
                      {
                        _id: '656a1b2c3d4e5f6789012355',
                        email: 'learner@example.com',
                        firstName: 'Jane',
                        lastName: 'Smith',
                        role: 'learner',
                        isActive: true,
                        tenantId: '656a1b2c3d4e5f6789012346',
                        createdAt: '2023-12-01T10:00:00.000Z',
                        lastLoginAt: '2023-12-01T08:15:00.000Z',
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: 1500,
                      totalPages: 75,
                      hasNextPage: true,
                      hasPrevPage: false,
                    },
                    filters: {
                      role: 'all',
                      status: 'active',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - Super Admin access required',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Super Admin access required',
                    error: 'INSUFFICIENT_PERMISSIONS',
                  },
                },
              },
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
              description: 'Platform statistics retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      overview: {
                        totalUsers: 1500,
                        totalTenants: 50,
                        totalCourses: 200,
                        totalRevenue: 150000,
                        currency: 'USD',
                      },
                      users: {
                        institutions: 50,
                        learners: 1450,
                        activeUsers: 1200,
                        newUsersThisMonth: 150,
                      },
                      courses: {
                        publishedCourses: 180,
                        draftCourses: 20,
                        totalEnrollments: 5000,
                        averageRating: 4.3,
                      },
                      revenue: {
                        monthlyRevenue: 12500,
                        yearlyRevenue: 150000,
                        revenueGrowth: 15.5,
                        topPayingTenants: [
                          {
                            tenantName: 'University of Technology',
                            revenue: 15000,
                          },
                          {
                            tenantName: 'Tech Academy',
                            revenue: 12000,
                          },
                        ],
                      },
                      system: {
                        uptime: 99.9,
                        averageResponseTime: 150,
                        storageUsed: '2.5TB',
                        bandwidthUsed: '10TB',
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized - Super Admin access required',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Super Admin access required',
                    error: 'INSUFFICIENT_PERMISSIONS',
                  },
                },
              },
            },
          },
        },
      },
      '/courses/analytics': {
        get: {
          tags: ['Courses'],
          summary: 'Get Course Analytics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Course analytics data retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      overview: {
                        totalEnrollments: 150,
                        activeEnrollments: 120,
                        completionRate: 65.5,
                        averageRating: 4.3,
                        totalRevenue: 14985.0,
                        currency: 'USD',
                      },
                      enrollmentTrends: [
                        {
                          date: '2023-11-01',
                          enrollments: 5,
                        },
                        {
                          date: '2023-11-02',
                          enrollments: 8,
                        },
                        {
                          date: '2023-11-03',
                          enrollments: 12,
                        },
                      ],
                      progressStats: {
                        notStarted: 30,
                        inProgress: 75,
                        completed: 45,
                      },
                      demographicData: {
                        ageGroups: {
                          '18-24': 25,
                          '25-34': 60,
                          '35-44': 45,
                          '45+': 20,
                        },
                        locations: [
                          { country: 'United States', count: 80 },
                          { country: 'United Kingdom', count: 30 },
                          { country: 'Canada', count: 25 },
                          { country: 'Australia', count: 15 },
                        ],
                      },
                      engagementMetrics: {
                        averageTimeToComplete: 45, // days
                        averageSessionDuration: 25, // minutes
                        lessonsPerSession: 2.3,
                        dropoutPoints: [
                          { moduleId: '656a1b2c3d4e5f6789012349', percentage: 15 },
                          { moduleId: '656a1b2c3d4e5f678901234a', percentage: 8 },
                        ],
                      },
                      revenueMetrics: {
                        revenueByMonth: [
                          { month: '2023-10', revenue: 2997.0 },
                          { month: '2023-11', revenue: 3996.0 },
                        ],
                        refunds: {
                          count: 2,
                          amount: 199.98,
                          rate: 1.3,
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
          },
        },
      },
      '/courses/debug-enrollments': {
        get: {
          tags: ['Courses'],
          summary: 'Debug Enrollments',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Debug enrollment data retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      enrollments: [
                        {
                          _id: '656a1b2c3d4e5f678901234c',
                          userId: '656a1b2c3d4e5f6789012355',
                          courseId: '656a1b2c3d4e5f6789012347',
                          status: 'active',
                          enrolledAt: '2023-12-01T10:00:00.000Z',
                          lastAccessedAt: '2023-12-01T15:30:00.000Z',
                          progress: {
                            completedLessons: 3,
                            totalLessons: 10,
                            percentage: 30,
                          },
                          user: {
                            email: 'learner@example.com',
                            firstName: 'Jane',
                            lastName: 'Smith',
                          },
                          course: {
                            title: 'Introduction to Web Development',
                            price: 99.99,
                          },
                        },
                      ],
                      summary: {
                        totalEnrollments: 150,
                        activeEnrollments: 120,
                        completedEnrollments: 25,
                        droppedEnrollments: 5,
                      },
                      debugInfo: {
                        lastSync: '2023-12-01T16:00:00.000Z',
                        databaseStatus: 'healthy',
                        cacheStatus: 'active',
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
          },
        },
      },
      '/courses/modules': {
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
      '/courses/lessons': {
        post: {
          tags: ['Content'],
          summary: 'Create Lesson with Media',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['moduleId', 'title', 'type', 'contentId'],
                  properties: {
                    moduleId: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string', enum: ['VIDEO', 'PDF', 'AUDIO', 'TEXT'] },
                    contentId: { type: 'string' },
                    order: { type: 'integer', default: 0 },
                    isPreview: { type: 'boolean', default: false },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Lesson created',
            },
          },
        },
      },
      '/creator/dashboard': {
        get: {
          tags: ['Creator Dashboard'],
          summary: 'Get Creator Dashboard',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Creator dashboard data retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      overview: {
                        totalCourses: 8,
                        publishedCourses: 6,
                        draftCourses: 2,
                        totalStudents: 450,
                        totalRevenue: 45000.0,
                        currency: 'USD',
                      },
                      recentActivity: [
                        {
                          type: 'enrollment',
                          message: 'John Doe enrolled in "Introduction to Web Development"',
                          timestamp: '2023-12-01T10:30:00.000Z',
                        },
                        {
                          type: 'review',
                          message: 'Jane Smith left a 5-star review for "Advanced JavaScript"',
                          timestamp: '2023-12-01T09:15:00.000Z',
                        },
                        {
                          type: 'course_published',
                          message: 'Course "React Fundamentals" was published',
                          timestamp: '2023-12-01T08:00:00.000Z',
                        },
                      ],
                      topCourses: [
                        {
                          _id: '656a1b2c3d4e5f6789012347',
                          title: 'Introduction to Web Development',
                          enrollments: 150,
                          revenue: 14985.0,
                          rating: 4.5,
                        },
                        {
                          _id: '656a1b2c3d4e5f6789012348',
                          title: 'Advanced JavaScript',
                          enrollments: 120,
                          revenue: 11988.0,
                          rating: 4.7,
                        },
                      ],
                      analytics: {
                        enrollmentTrend: [
                          { date: '2023-11-01', enrollments: 5 },
                          { date: '2023-11-02', enrollments: 8 },
                          { date: '2023-11-03', enrollments: 12 },
                        ],
                        revenueTrend: [
                          { date: '2023-11-01', revenue: 499.5 },
                          { date: '2023-11-02', revenue: 799.2 },
                          { date: '2023-11-03', revenue: 1198.8 },
                        ],
                      },
                      notifications: {
                        unreadCount: 3,
                        items: [
                          {
                            type: 'info',
                            message: 'Your monthly payout of $2,500 has been processed',
                            timestamp: '2023-12-01T07:00:00.000Z',
                          },
                          {
                            type: 'warning',
                            message: 'Course "Python Basics" has low engagement',
                            timestamp: '2023-11-30T16:00:00.000Z',
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
          },
        },
      },
      '/creator/landing-page': {
        get: {
          tags: ['Landing Page'],
          summary: 'Get Landing Page',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Landing page data retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      _id: '656a1b2c3d4e5f6789012356',
                      tenantId: '656a1b2c3d4e5f6789012346',
                      title: 'University of Technology - Online Courses',
                      description: 'Transform your career with our cutting-edge online courses',
                      slug: 'university-of-technology',
                      status: 'published',
                      sections: [
                        {
                          type: 'hero',
                          content: {
                            headline: 'Learn from Industry Experts',
                            subheading: 'Join thousands of students advancing their careers',
                            backgroundImage: 'https://example.com/hero-bg.jpg',
                            ctaText: 'Explore Courses',
                            ctaLink: '/courses',
                          },
                        },
                        {
                          type: 'features',
                          content: {
                            title: 'Why Choose Us',
                            features: [
                              {
                                title: 'Expert Instructors',
                                description: 'Learn from industry professionals',
                                icon: 'users',
                              },
                              {
                                title: 'Flexible Learning',
                                description: 'Study at your own pace',
                                icon: 'clock',
                              },
                              {
                                title: 'Certified Programs',
                                description: 'Get recognized certificates',
                                icon: 'award',
                              },
                            ],
                          },
                        },
                        {
                          type: 'courses',
                          content: {
                            title: 'Popular Courses',
                            courses: [
                              {
                                _id: '656a1b2c3d4e5f6789012347',
                                title: 'Introduction to Web Development',
                                thumbnail: 'https://example.com/course1.jpg',
                                price: 99.99,
                                rating: 4.5,
                                students: 150,
                              },
                            ],
                          },
                        },
                      ],
                      seo: {
                        metaTitle: 'University of Technology - Online Courses',
                        metaDescription:
                          'Transform your career with our cutting-edge online courses',
                        keywords: ['online courses', 'technology', 'education', 'university'],
                      },
                      analytics: {
                        views: 1250,
                        uniqueVisitors: 890,
                        conversionRate: 3.2,
                        avgTimeOnPage: 180,
                      },
                      createdAt: '2023-12-01T10:00:00.000Z',
                      updatedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
            '404': {
              description: 'Landing page not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Landing page not found',
                    error: 'LANDING_PAGE_NOT_FOUND',
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Landing Page'],
          summary: 'Create Landing Page',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    sections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          content: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Landing page created successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'Landing page created successfully',
                    data: {
                      _id: '656a1b2c3d4e5f6789012356',
                      tenantId: '656a1b2c3d4e5f6789012346',
                      title: 'University of Technology - Online Courses',
                      description: 'Transform your career with our cutting-edge online courses',
                      slug: 'university-of-technology',
                      status: 'draft',
                      sections: [
                        {
                          type: 'hero',
                          content: {
                            headline: 'Learn from Industry Experts',
                            subheading: 'Join thousands of students advancing their careers',
                          },
                        },
                      ],
                      createdAt: '2023-12-01T10:00:00.000Z',
                      updatedAt: '2023-12-01T10:00:00.000Z',
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Validation failed',
                    errors: [
                      {
                        field: 'title',
                        message: 'Title is required',
                      },
                      {
                        field: 'description',
                        message: 'Description is required',
                      },
                    ],
                  },
                },
              },
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Access denied',
                    error: 'UNAUTHORIZED',
                  },
                },
              },
            },
          },
        },
        put: {
          tags: ['Landing Page'],
          summary: 'Update Landing Page',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    sections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          content: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Landing page updated',
            },
          },
        },
        patch: {
          tags: ['Landing Page'],
          summary: 'Partial Update Landing Page',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    sections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          content: { type: 'object' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Landing page updated',
            },
          },
        },
        delete: {
          tags: ['Landing Page'],
          summary: 'Delete Landing Page',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Landing page deleted',
            },
          },
        },
      },
      '/creator/landing-page/upload-image': {
        post: {
          tags: ['Landing Page'],
          summary: 'Upload Landing Page Image',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image'],
                  properties: {
                    image: {
                      type: 'string',
                      format: 'binary',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Image uploaded',
            },
          },
        },
      },
      '/creator/landing-page/status': {
        patch: {
          tags: ['Landing Page'],
          summary: 'Toggle Landing Page Status',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['active'],
                  properties: {
                    active: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Landing page status updated',
            },
          },
        },
      },
      '/public/landing-page/{tenantSlug}': {
        get: {
          tags: ['Public'],
          summary: 'Get Public Landing Page',
          parameters: [
            {
              name: 'tenantSlug',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Public landing page retrieved successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: {
                      tenant: {
                        _id: '656a1b2c3d4e5f6789012346',
                        name: 'University of Technology',
                        slug: 'university-of-technology',
                        logo: 'https://example.com/logo.png',
                        settings: {
                          primaryColor: '#3B82F6',
                          secondaryColor: '#10B981',
                        },
                      },
                      landingPage: {
                        title: 'University of Technology - Online Courses',
                        description: 'Transform your career with our cutting-edge online courses',
                        sections: [
                          {
                            type: 'hero',
                            content: {
                              headline: 'Learn from Industry Experts',
                              subheading: 'Join thousands of students advancing their careers',
                              backgroundImage: 'https://example.com/hero-bg.jpg',
                              ctaText: 'Explore Courses',
                              ctaLink: '/courses',
                            },
                          },
                          {
                            type: 'features',
                            content: {
                              title: 'Why Choose Us',
                              features: [
                                {
                                  title: 'Expert Instructors',
                                  description: 'Learn from industry professionals',
                                  icon: 'users',
                                },
                                {
                                  title: 'Flexible Learning',
                                  description: 'Study at your own pace',
                                  icon: 'clock',
                                },
                                {
                                  title: 'Certified Programs',
                                  description: 'Get recognized certificates',
                                  icon: 'award',
                                },
                              ],
                            },
                          },
                          {
                            type: 'courses',
                            content: {
                              title: 'Popular Courses',
                              courses: [
                                {
                                  _id: '656a1b2c3d4e5f6789012347',
                                  title: 'Introduction to Web Development',
                                  slug: 'intro-web-dev',
                                  thumbnail: 'https://example.com/course1.jpg',
                                  price: 99.99,
                                  currency: 'USD',
                                  rating: 4.5,
                                  students: 150,
                                  instructor: {
                                    firstName: 'John',
                                    lastName: 'Doe',
                                  },
                                  category: 'Programming',
                                  level: 'beginner',
                                },
                              ],
                            },
                          },
                        ],
                      },
                      seo: {
                        metaTitle: 'University of Technology - Online Courses',
                        metaDescription:
                          'Transform your career with our cutting-edge online courses',
                        keywords: ['online courses', 'technology', 'education', 'university'],
                      },
                    },
                  },
                },
              },
            },
            '404': {
              description: 'Landing page not found',
              content: {
                'application/json': {
                  example: {
                    success: false,
                    message: 'Landing page not found',
                    error: 'LANDING_PAGE_NOT_FOUND',
                  },
                },
              },
            },
          },
        },
      },
      '/enrollments/enroll': {
        post: {
          tags: ['Enrollments'],
          summary: 'Enroll in Course',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['courseId'],
                  properties: {
                    courseId: { type: 'string' },
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
      },
      '/enrollments/complete-lesson': {
        patch: {
          tags: ['Enrollments'],
          summary: 'Complete Lesson',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['lessonId', 'courseId'],
                  properties: {
                    lessonId: { type: 'string' },
                    courseId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Lesson marked as complete',
            },
          },
        },
      },
      '/enrollments/rate-course': {
        patch: {
          tags: ['Enrollments'],
          summary: 'Rate Course',
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
                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                    review: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Course rated',
            },
          },
        },
      },
      '/enrollments/submit-quiz': {
        post: {
          tags: ['Enrollments'],
          summary: 'Submit Quiz Attempt',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quizId', 'answers'],
                  properties: {
                    quizId: { type: 'string' },
                    answers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          questionId: { type: 'string' },
                          answer: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Quiz submitted',
            },
          },
        },
      },
      '/enrollments/{courseId}/details': {
        get: {
          tags: ['Enrollments'],
          summary: 'Get Enrollment Details',
          security: [{ bearerAuth: [] }],
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
              description: 'Enrollment details',
            },
          },
        },
      },
      '/admin/failed': {
        get: {
          tags: ['Email'],
          summary: 'Get Failed Emails',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Failed emails list',
            },
          },
        },
      },
      '/admin/stats': {
        get: {
          tags: ['Email'],
          summary: 'Get Email Statistics',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Email statistics',
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
