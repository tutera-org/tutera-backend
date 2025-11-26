# Landing Page Customization API Documentation

## Overview

The Landing Page Customization feature allows creators and institutions to create and manage their public landing pages with 5 customizable sections. The system handles image uploads, generates fresh signed URLs, and provides both authenticated and public endpoints.

## Table of Contents

1. [Features](#features)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Testing Guide](#testing-guide)
5. [Frontend Integration](#frontend-integration)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)

## Features

- **5 Customizable Sections**: Logo, Hero banner, About us, Why choose us, and Testimonials
- **Image Upload**: Automatic S3 upload with fresh signed URL generation
- **Role-based Access**: Only creators and institutions can manage landing pages
- **Public Endpoint**: Fetch landing pages without authentication
- **Automatic URL Refresh**: Signed URLs are regenerated on each fetch (5-minute expiry)
- **Atomic Operations**: Image upload + landing page update in single request

## Authentication

All protected endpoints require a valid JWT token:

```
Authorization: Bearer <your_jwt_token>
```

**Required Roles**: `INDEPENDENT_CREATOR` or `INSTITUTION`

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

---

### 1. Get Landing Page (Authenticated)

**Endpoint**: `GET /creator/landing-page`

**Description**: Fetch current tenant's landing page (creates default if none exists)

**Headers**:
```
Authorization: Bearer <token>
```

**Response Example**:
```json
{
  "success": true,
  "message": "Landing page fetched successfully",
  "data": {
    "_id": "69262c56c00396cbf47c6056",
    "tenantId": "692579de00a606524105887c",
    "logo": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/logo.jpg?X-Amz-Signature=abc123",
    "sections": {
      "section1": {
        "image": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/hero.jpg?X-Amz-Signature=def456"
      },
      "section2": {
        "description": "Welcome to our amazing learning platform!",
        "image": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/about.jpg?X-Amz-Signature=ghi789"
      },
      "section3": {
        "description": "Our expert instructors bring years of experience.",
        "image": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/instructors.jpg?X-Amz-Signature=jkl012"
      },
      "section4": {
        "title": "Why Choose Us?",
        "description": "Join thousands of successful learners.",
        "image": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/features.jpg?X-Amz-Signature=mno345"
      },
      "section5": {
        "testimonials": [
          {
            "image": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/student1.jpg?X-Amz-Signature=pqr678",
            "name": "Sarah Johnson",
            "jobTitle": "Software Developer",
            "remark": "This platform completely changed my career!"
          },
          {
            "image": "https://example.com/student2.jpg",
            "name": "Michael Chen",
            "jobTitle": "Data Scientist",
            "remark": "The quality of content is unmatched."
          }
        ]
      }
    },
    "isActive": true,
    "createdAt": "2025-11-25T22:23:18.432Z",
    "updatedAt": "2025-11-25T23:51:16.856Z"
  }
}
```

---

### 2. Upload Image (Enhanced)

**Endpoint**: `POST /creator/landing-page/upload-image`

**Description**: Upload image and automatically update landing page section

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
- `image`: File (required)
- `section`: `"logo" | "section1" | "section2" | "section3" | "section4" | "section5"` (required)
- `testimonialIndex`: `number` (only required for section5)

**Response Example**:
```json
{
  "success": true,
  "message": "Image uploaded and section1 updated successfully",
  "data": {
    "url": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/new-image.jpg?X-Amz-Signature=abc123",
    "mediaId": "692640f38c1244f2d16df2b0",
    "fileName": "hero-banner.jpg",
    "s3Key": "tenants/tenant123/media/1764113720561-e9709703-6640-4d65-9d2f-d399f31ff1a7-hero-banner.jpg",
    "updatedSection": "section1",
    "fullLandingPage": {
      "_id": "69262c56c00396cbf47c6056",
      "sections": {
        "section1": {
          "image": "https://s3.us-west-1.wasabisys.com/tutera/tenants/tenant123/media/new-image.jpg?X-Amz-Signature=def456"
        }
      }
    }
  }
}
```

---

### 3. Create Landing Page

**Endpoint**: `POST /creator/landing-page`

**Description**: Create new landing page (only if none exists)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "logo": "https://example.com/logo.png",
  "sections": {
    "section1": {
      "image": "https://example.com/hero-banner.jpg"
    },
    "section2": {
      "description": "Welcome to our amazing learning platform! We offer comprehensive courses designed to transform your career.",
      "image": "https://example.com/about-us.jpg"
    },
    "section3": {
      "description": "Our expert instructors bring years of industry experience to provide you with practical, real-world knowledge.",
      "image": "https://example.com/instructors.jpg"
    },
    "section4": {
      "title": "Why Choose Us?",
      "description": "Join thousands of successful learners who have transformed their careers with our cutting-edge courses and personalized support.",
      "image": "https://example.com/features.jpg"
    },
    "section5": {
      "testimonials": [
        {
          "image": "https://example.com/student1.jpg",
          "name": "Sarah Johnson",
          "jobTitle": "Software Developer at Tech Corp",
          "remark": "This platform completely changed my career trajectory. The courses are practical and the instructors are amazing!"
        },
        {
          "image": "https://example.com/student2.jpg",
          "name": "Michael Chen",
          "jobTitle": "Data Scientist",
          "remark": "I've tried many online learning platforms, but this one stands out. The quality of content and support is unmatched."
        }
      ]
    }
  }
}
```

**Response Example**:
```json
{
  "success": true,
  "message": "Landing page created successfully",
  "data": {
    "_id": "69262c56c00396cbf47c6056",
    "tenantId": "692579de00a606524105887c",
    "logo": "https://example.com/logo.png",
    "sections": { /* same as request */ },
    "isActive": true,
    "createdAt": "2025-11-25T22:23:18.432Z",
    "updatedAt": "2025-11-25T22:23:18.432Z"
  }
}
```

---

### 4. Update Landing Page

**Endpoint**: `PUT /creator/landing-page`

**Description**: Update entire landing page (replaces all sections)

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**: Same structure as create endpoint (partial updates allowed)

**Response Example**:
```json
{
  "success": true,
  "message": "Landing page updated successfully",
  "data": {
    "_id": "69262c56c00396cbf47c6056",
    "sections": { /* updated sections */ },
    "updatedAt": "2025-11-25T23:51:16.856Z"
  }
}
```

---

### 5. Delete Landing Page

**Endpoint**: `DELETE /creator/landing-page`

**Description**: Delete entire landing page

**Headers**:
```
Authorization: Bearer <token>
```

**Response Example**:
```json
{
  "success": true,
  "message": "Landing page deleted successfully"
}
```

---

### 6. Toggle Landing Page Status

**Endpoint**: `PATCH /creator/landing-page/status`

**Description**: Enable/disable landing page visibility

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "isActive": false
}
```

**Response Example**:
```json
{
  "success": true,
  "message": "Landing page status updated successfully",
  "data": {
    "isActive": false,
    "updatedAt": "2025-11-25T23:51:16.856Z"
  }
}
```

---

### 7. Get Public Landing Page

**Endpoint**: `GET /public/landing-page/:tenantSlug`

**Description**: Public endpoint to fetch landing page by tenant slug

**URL Parameters**:
- `tenantSlug`: Tenant's unique slug identifier

**Response Example**:
```json
{
  "success": true,
  "message": "Landing page fetched successfully",
  "data": {
    "sections": { /* landing page sections */ },
    "tenant": {
      "name": "Tech Academy",
      "logo": "https://example.com/tenant-logo.png",
      "website": "https://techacademy.com"
    }
  }
}
```

## Testing Guide

### Prerequisites

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Get JWT Token**:
   ```bash
   curl -X POST http://localhost:5000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "creator@example.com", "password": "password123"}'
   ```

3. **Extract token** from response and use in subsequent requests.

### Step-by-Step Testing

#### 1. Get Landing Page (Creates Default)
```bash
curl -X GET http://localhost:5000/api/v1/creator/landing-page \
  -H "Authorization: Bearer <your_token>"
```

#### 2. Upload Logo Image
```bash
curl -X POST http://localhost:5000/api/v1/creator/landing-page/upload-image \
  -H "Authorization: Bearer <your_token>" \
  -F "section=logo" \
  -F "image=@/path/to/logo.png"
```

#### 3. Upload Section Images
```bash
# Section 1 (Hero)
curl -X POST http://localhost:5000/api/v1/creator/landing-page/upload-image \
  -H "Authorization: Bearer <your_token>" \
  -F "section=section1" \
  -F "image=@/path/to/hero.jpg"

# Section 5 Testimonial
curl -X POST http://localhost:5000/api/v1/creator/landing-page/upload-image \
  -H "Authorization: Bearer <your_token>" \
  -F "section=section5" \
  -F "testimonialIndex=0" \
  -F "image=@/path/to/student.jpg"
```

#### 4. Update Text Content
```bash
curl -X PUT http://localhost:5000/api/v1/creator/landing-page \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sections": {
      "section4": {
        "title": "New Title",
        "description": "Updated description for our amazing platform."
      }
    }
  }'
```

#### 5. Test Public Endpoint
```bash
curl -X GET http://localhost:5000/api/v1/public/landing-page/tech-academy
```

#### 6. Test URL Refresh (Wait 6 minutes)
```bash
# Wait for URLs to expire (5+ minutes)
curl -X GET http://localhost:5000/api/v1/creator/landing-page \
  -H "Authorization: Bearer <your_token>"
# URLs should be refreshed with new signatures
```

### Expected Behaviors

- ✅ **Fresh URLs**: Every fetch returns new signed URLs
- ✅ **Atomic Uploads**: Image upload + landing page update in one request
- ✅ **Role Validation**: Only creators/institutions can manage pages
- ✅ **Public Access**: Anyone can view active landing pages
- ✅ **Error Handling**: Proper validation and error messages

## Frontend Integration

### React Component Example

```typescript
import React, { useState, useEffect } from 'react';

interface LandingPageData {
  logo?: string;
  sections: {
    section1?: { image?: string };
    section2?: { description?: string; image?: string };
    section3?: { description?: string; image?: string };
    section4?: { title?: string; description?: string; image?: string };
    section5?: { testimonials?: Array<{
      image?: string;
      name?: string;
      jobTitle?: string;
      remark?: string;
    }> };
  };
  isActive: boolean;
}

const LandingPageManager: React.FC = () => {
  const [landingPage, setLandingPage] = useState<LandingPageData | null>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('jwt_token');

  // Fetch landing page
  const fetchLandingPage = async () => {
    try {
      const response = await fetch('/api/v1/creator/landing-page', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setLandingPage(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch landing page:', error);
    }
  };

  // Upload image for section
  const uploadImage = async (file: File, section: string, testimonialIndex?: number) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('section', section);
      if (testimonialIndex !== undefined) {
        formData.append('testimonialIndex', testimonialIndex.toString());
      }

      const response = await fetch('/api/v1/creator/landing-page/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        // Landing page is automatically updated!
        setLandingPage(result.data.fullLandingPage);
        return result.data.url;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update text content
  const updateContent = async (updates: Partial<LandingPageData>) => {
    try {
      const response = await fetch('/api/v1/creator/landing-page', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result = await response.json();
      if (result.success) {
        setLandingPage(result.data);
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  useEffect(() => {
    fetchLandingPage();
  }, []);

  return (
    <div className="landing-page-manager">
      <h2>Landing Page Customization</h2>
      
      {/* Logo Upload */}
      <div className="section">
        <h3>Logo</h3>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, 'logo');
          }}
        />
        {landingPage?.logo && (
          <img src={landingPage.logo} alt="Logo" style={{maxWidth: '200px'}} />
        )}
      </div>

      {/* Section 1 - Hero Image */}
      <div className="section">
        <h3>Hero Banner</h3>
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, 'section1');
          }}
        />
        {landingPage?.sections?.section1?.image && (
          <img src={landingPage.sections.section1.image} alt="Hero" style={{maxWidth: '100%'}} />
        )}
      </div>

      {/* Section 2 - About */}
      <div className="section">
        <h3>About Section</h3>
        <textarea
          placeholder="Description"
          value={landingPage?.sections?.section2?.description || ''}
          onChange={(e) => updateContent({
            sections: {
              ...landingPage?.sections,
              section2: {
                ...landingPage?.sections?.section2,
                description: e.target.value
              }
            }
          })}
        />
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file, 'section2');
          }}
        />
        {landingPage?.sections?.section2?.image && (
          <img src={landingPage.sections.section2.image} alt="About" style={{maxWidth: '300px'}} />
        )}
      </div>

      {/* Section 5 - Testimonials */}
      <div className="section">
        <h3>Testimonials</h3>
        {landingPage?.sections?.section5?.testimonials?.map((testimonial, index) => (
          <div key={index} className="testimonial">
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file, 'section5', index);
              }}
            />
            {testimonial.image && (
              <img src={testimonial.image} alt={testimonial.name} style={{width: '100px', height: '100px'}} />
            )}
            <input
              placeholder="Name"
              value={testimonial.name || ''}
              onChange={(e) => {
                const updatedTestimonials = [...(landingPage?.sections?.section5?.testimonials || [])];
                updatedTestimonials[index] = {...testimonial, name: e.target.value};
                updateContent({
                  sections: {
                    ...landingPage?.sections,
                    section5: { testimonials: updatedTestimonials }
                  }
                });
              }}
            />
            <input
              placeholder="Job Title"
              value={testimonial.jobTitle || ''}
              onChange={(e) => {
                const updatedTestimonials = [...(landingPage?.sections?.section5?.testimonials || [])];
                updatedTestimonials[index] = {...testimonial, jobTitle: e.target.value};
                updateContent({
                  sections: {
                    ...landingPage?.sections,
                    section5: { testimonials: updatedTestimonials }
                  }
                });
              }}
            />
            <textarea
              placeholder="Remark"
              value={testimonial.remark || ''}
              onChange={(e) => {
                const updatedTestimonials = [...(landingPage?.sections?.section5?.testimonials || [])];
                updatedTestimonials[index] = {...testimonial, remark: e.target.value};
                updateContent({
                  sections: {
                    ...landingPage?.sections,
                    section5: { testimonials: updatedTestimonials }
                  }
                });
              }}
            />
          </div>
        ))}
      </div>

      {/* Status Toggle */}
      <div className="section">
        <h3>Status</h3>
        <label>
          <input
            type="checkbox"
            checked={landingPage?.isActive || false}
            onChange={(e) => {
              fetch('/api/v1/creator/landing-page/status', {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: e.target.checked })
              }).then(() => fetchLandingPage());
            }}
          />
          Landing Page Active
        </label>
      </div>
    </div>
  );
};

export default LandingPageManager;
```

### Public Landing Page Display

```typescript
const PublicLandingPage: React.FC<{tenantSlug: string}> = ({ tenantSlug }) => {
  const [landingPage, setLandingPage] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/v1/public/landing-page/${tenantSlug}`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setLandingPage(result.data);
        }
      });
  }, [tenantSlug]);

  if (!landingPage) return <div>Loading...</div>;

  return (
    <div className="public-landing-page">
      {/* Logo */}
      {landingPage.logo && (
        <img src={landingPage.logo} alt="Company Logo" className="logo" />
      )}

      {/* Section 1 - Hero */}
      {landingPage.sections?.section1?.image && (
        <section className="hero">
          <img src={landingPage.sections.section1.image} alt="Hero" />
        </section>
      )}

      {/* Section 2 - About */}
      {landingPage.sections?.section2 && (
        <section className="about">
          {landingPage.sections.section2.image && (
            <img src={landingPage.sections.section2.image} alt="About" />
          )}
          <p>{landingPage.sections.section2.description}</p>
        </section>
      )}

      {/* Section 5 - Testimonials */}
      {landingPage.sections?.section5?.testimonials && (
        <section className="testimonials">
          <h2>What Our Students Say</h2>
          {landingPage.sections.section5.testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial">
              {testimonial.image && (
                <img src={testimonial.image} alt={testimonial.name} />
              )}
              <blockquote>"{testimonial.remark}"</blockquote>
              <cite>- {testimonial.name}, {testimonial.jobTitle}</cite>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
```

## Data Models

### Landing Page Structure

```typescript
interface ILandingPage {
  _id: string;
  tenantId: string;
  logo?: string; // S3 key or URL
  sections: {
    section1?: { image?: string };
    section2?: { description?: string; image?: string };
    section3?: { description?: string; image?: string };
    section4?: { title?: string; description?: string; image?: string };
    section5?: { testimonials?: Array<{
      image?: string;
      name?: string;
      jobTitle?: string;
      remark?: string;
    }>};
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Create/Update Payload

```typescript
interface CreateLandingPageDto {
  logo?: string;
  sections?: {
    section1?: { image?: string };
    section2?: { description?: string; image?: string };
    section3?: { description?: string; image?: string };
    section4?: { title?: string; description?: string; image?: string };
    section5?: { testimonials?: Array<{
      image?: string;
      name: string;
      jobTitle: string;
      remark: string;
    }>};
  };
}
```

## Error Handling

### Common Error Responses

#### Authentication Errors
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "Unauthorized"
}
```

#### Validation Errors
```json
{
  "success": false,
  "errors": [
    {
      "field": "sections.section5.testimonials.0.name",
      "message": "Name is required"
    }
  ]
}
```

#### Permission Errors
```json
{
  "success": false,
  "message": "Access denied. Creator role required.",
  "error": "Forbidden"
}
```

#### File Upload Errors
```json
{
  "success": false,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token)
- `403` - Forbidden (wrong role)
- `404` - Not Found
- `500` - Internal Server Error

## Best Practices

### Frontend

1. **Handle URL Expiry**: Refresh landing page data periodically to ensure valid image URLs
2. **Error Handling**: Show user-friendly messages for upload failures
3. **Loading States**: Show loading indicators during uploads
4. **Image Previews**: Display uploaded images immediately after successful upload

### Backend

1. **Atomic Operations**: Use the enhanced upload endpoint for image + page updates
2. **Validation**: Always validate input data before processing
3. **Error Logging**: Log errors for debugging but don't expose sensitive information
4. **Rate Limiting**: Consider rate limiting upload endpoints

### Security

1. **File Validation**: Validate file types and sizes on both client and server
2. **JWT Expiry**: Handle token refresh for long-running sessions
3. **Role Verification**: Always verify user roles before allowing operations
4. **Input Sanitization**: Sanitize all user inputs to prevent XSS attacks

This comprehensive API provides everything needed for a robust landing page customization system with automatic image management and fresh URL generation!
