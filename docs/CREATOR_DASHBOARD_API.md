# Creator Dashboard API Documentation

## Overview

The Creator Dashboard API provides comprehensive analytics and activity data for course creators to track their platform performance. This endpoint returns real-time data including course statistics, revenue analytics, student enrollment trends, and recent platform activities.

## Base Endpoint

```
GET /api/v1/creator/dashboard
```

## Authentication

This endpoint requires authentication with a valid JWT token. The user must have creator/admin privileges to access their dashboard data.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Dashboard data fetched successfully",
  "data": {
    "totalEnrolledLearners": number,
    "courses": Course[],
    "totalEarnings": number,
    "overallAnalysis": {
      "daily": AnalyticsPeriod[],
      "weekly": AnalyticsPeriod[], 
      "monthly": AnalyticsPeriod[]
    },
    "recentActivity": RecentActivity[],
    "courseOverview": CourseOverview[]
  }
}
```

### Error Response (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

## Data Models

### Course
```typescript
interface Course {
  _id: string;
  title: string;
  price: number;
  studentCount: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}
```

### CourseOverview
```typescript
interface CourseOverview {
  _id: string;
  title: string;
  price: number;
  studentCount: number;
  enrolledStudents: string[]; // Array of student names
  status: string;
}
```

### AnalyticsPeriod
```typescript
interface AnalyticsPeriod {
  date: string;           // YYYY-MM-DD format
  label: string;         // Human-readable time label
  coursesSold: number;   // Number of course enrollments
  revenue: number;       // Total revenue in currency units
  studentsEnrolled: number; // New student onboardings
  completionRate: number; // Course completion percentage
}
```

### RecentActivity
```typescript
interface RecentActivity {
  type: "enrollment" | "course_created" | "onboarding" | "online";
  message: string;
  timestamp: string;     // ISO datetime
  isRead: boolean;
}
```

## Analytics Time Periods

### Daily View (24 Hours)
- **Purpose**: Hourly breakdown of the last 24 hours
- **Data Points**: 24 entries (one per hour)
- **Label Format**: "02:00 PM", "03:00 PM", etc.
- **Use Case**: Track hourly activity patterns and peak engagement times

### Weekly View (7 Days)
- **Purpose**: Daily breakdown of the last 7 days
- **Data Points**: 7 entries (one per day)
- **Label Format**: "Mon, Nov 27", "Tue, Nov 28", etc.
- **Use Case**: Monitor daily performance and weekly trends

### Monthly View (4 Weeks)
- **Purpose**: Weekly breakdown of the last 4 weeks
- **Data Points**: 4 entries (one per week)
- **Label Format**: "Week 1 (Oct 31 - Nov 6)", etc.
- **Use Case**: Analyze weekly patterns and monthly growth

## Key Metrics Explained

### `totalEnrolledLearners`
- **Definition**: Total number of unique students enrolled across all courses
- **Calculation**: Count of unique student IDs from all enrollments
- **Use Case**: Overall platform reach and audience size

### `totalEarnings`
- **Definition**: Total revenue generated from all course enrollments
- **Calculation**: Sum of course prices for all paid enrollments
- **Currency**: Same as course price currency (e.g., Naira, Dollars)
- **Use Case**: Financial performance tracking

### `coursesSold`
- **Definition**: Number of new course enrollments within the time period
- **Calculation**: Count of enrollments with `enrolledAt` within period
- **Use Case**: Sales performance and course popularity

### `revenue`
- **Definition**: Revenue generated within the specific time period
- **Calculation**: Sum of course prices for enrollments in that period
- **Use Case**: Period-based financial analysis

### `studentsEnrolled`
- **Definition**: Number of new student accounts created within the time period
- **Calculation**: Count of users with `role: "STUDENT"` created in period
- **Use Case**: Platform growth and user acquisition tracking

### `completionRate`
- **Definition**: Percentage of courses completed by enrolled students
- **Calculation**: (Completed enrollments / Total enrollments) × 100
- **Use Case**: Course quality and engagement metrics

## Recent Activity Types

### `enrollment`
- **Trigger**: Student enrolls in a course
- **Message Format**: "{Student Name} enrolled in \"{Course Title}\""
- **Use Case**: Real-time enrollment notifications

### `course_created`
- **Trigger**: Creator publishes a new course
- **Message Format**: "New course \"{Course Title}\" has been published"
- **Use Case**: Course creation tracking

### `onboarding`
- **Trigger**: New student joins the platform
- **Message Format**: "New student {Student Name} joined your platform"
- **Use Case**: User acquisition monitoring

### `online`
- **Trigger**: Student comes online via WebSocket connection
- **Message Format**: "{Student Name} is online"
- **Use Case**: Real-time engagement tracking

## Frontend Integration Guide

### 1. Data Fetching
```javascript
const fetchDashboardData = async () => {
  try {
    const response = await fetch('/api/v1/creator/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw error;
  }
};
```

### 2. Chart Data Preparation

#### Daily Analytics Chart
```javascript
const prepareDailyChartData = (dailyData) => {
  return dailyData.map(period => ({
    x: period.label,           // "02:00 PM"
    y: period.coursesSold,     // Courses sold that hour
    revenue: period.revenue,   // Revenue that hour
    students: period.studentsEnrolled
  }));
};
```

#### Weekly Analytics Chart
```javascript
const prepareWeeklyChartData = (weeklyData) => {
  return weeklyData.map(period => ({
    x: period.label,           // "Mon, Nov 27"
    y: period.coursesSold,     // Courses sold that day
    revenue: period.revenue,   // Revenue that day
    students: period.studentsEnrolled
  }));
};
```

#### Monthly Analytics Chart
```javascript
const prepareMonthlyChartData = (monthlyData) => {
  return monthlyData.map(period => ({
    x: period.label,           // "Week 1 (Oct 31 - Nov 6)"
    y: period.coursesSold,     // Courses sold that week
    revenue: period.revenue,   // Revenue that week
    students: period.studentsEnrolled
  }));
};
```

### 3. Real-time Updates

For real-time dashboard updates, integrate with WebSocket events:

```javascript
// Listen for real-time updates
socket.on('student_enrolled', (data) => {
  // Refresh dashboard data
  fetchDashboardData();
});

socket.on('course_created', (data) => {
  // Refresh dashboard data
  fetchDashboardData();
});
```

### 4. Data Display Examples

#### Overview Cards
```jsx
<div className="dashboard-overview">
  <div className="metric-card">
    <h3>Total Students</h3>
    <p>{totalEnrolledLearners.toLocaleString()}</p>
  </div>
  
  <div className="metric-card">
    <h3>Total Earnings</h3>
    <p>₦{totalEarnings.toLocaleString()}</p>
  </div>
  
  <div className="metric-card">
    <h3>Active Courses</h3>
    <p>{courses.length}</p>
  </div>
</div>
```

#### Course Overview Table
```jsx
<table className="courses-table">
  <thead>
    <tr>
      <th>Course</th>
      <th>Price</th>
      <th>Students</th>
      <th>Enrolled Students</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    {courseOverview.map(course => (
      <tr key={course._id}>
        <td>{course.title}</td>
        <td>₦{course.price.toLocaleString()}</td>
        <td>{course.studentCount}</td>
        <td>
          {course.enrolledStudents.join(', ')}
        </td>
        <td>{course.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```

#### Recent Activity Feed
```jsx
<div className="activity-feed">
  {recentActivity.map((activity, index) => (
    <div key={index} className={`activity-item ${activity.type}`}>
      <div className="activity-icon">
        {getActivityIcon(activity.type)}
      </div>
      <div className="activity-content">
        <p>{activity.message}</p>
        <span className="activity-time">
          {formatTime(activity.timestamp)}
        </span>
      </div>
    </div>
  ))}
</div>
```

## Error Handling

### Common Error Scenarios

1. **Authentication Error (401)**
   - **Cause**: Invalid or expired JWT token
   - **Solution**: Redirect to login page for re-authentication

2. **Authorization Error (403)**
   - **Cause**: User doesn't have creator privileges
   - **Solution**: Show access denied message

3. **Server Error (500)**
   - **Cause**: Internal server issues
   - **Solution**: Show generic error message with retry option

### Error Handling Example
```javascript
const handleDashboardError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Show access denied
    showError('You do not have permission to access this dashboard');
  } else {
    // Show generic error
    showError('Unable to load dashboard data. Please try again.');
  }
};
```

## Performance Considerations

### 1. Caching Strategy
- Cache dashboard data for 5-10 minutes to reduce server load
- Implement client-side caching for better UX

### 2. Data Refresh
- Implement manual refresh button
- Consider periodic auto-refresh (every 5 minutes)
- Use WebSocket for real-time updates when possible

### 3. Loading States
- Show skeleton loaders while fetching data
- Implement progressive loading for large datasets

## Security Notes

- Always validate JWT tokens on the client side
- Implement rate limiting for dashboard requests
- Sanitize all data before rendering in the UI
- Use HTTPS for all API communications

## Support

For technical support or questions about the Creator Dashboard API:
- Check the API response messages for specific error details
- Review server logs for debugging information
- Contact the development team for implementation assistance

---

**Last Updated**: November 27, 2025
**Version**: 1.0.0
**API Version**: v1
