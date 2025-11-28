# Course Analytics API Documentation

## Overview

The Course Analytics API provides comprehensive analytics data for courses, including enrollment statistics, student progress, quiz scores, and completion rates. This API uses a JavaScript filtering workaround to bypass MongoDB query issues with tenant-based filtering.

## Endpoints

### Get Course Analytics

**Endpoint:** `GET /api/v1/courses/analytics`

**Authentication:** Required (Bearer Token)

**Description:** Retrieves analytics data for all published courses within the tenant.

#### Response Structure

```typescript
interface ICourseAnalyticsResponse {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  averageQuizScore: number;
  completionRate: number;
  students: IStudentAnalytics[];
}

interface IStudentAnalytics {
  studentId: string;
  studentName: string;
  quizScore: number;
  progress: number;
  status: 'COMPLETED' | 'NOT_COMPLETED';
}
```

#### Sample Response

```json
{
  "success": true,
  "message": "Course analytics retrieved successfully.",
  "data": [
    {
      "courseId": "69282c80bbfc6cba5fb58769",
      "courseTitle": "Introduction to Frontend Development",
      "totalStudents": 2,
      "averageQuizScore": 75,
      "completionRate": 50,
      "students": [
        {
          "studentId": "69258e0978dcc1f0959c0dd9",
          "studentName": "Kingsley Nweke",
          "quizScore": 85,
          "progress": 100,
          "status": "COMPLETED"
        },
        {
          "studentId": "69258e0978dcc1f0959c0dd9",
          "studentName": "John Doe",
          "quizScore": 65,
          "progress": 33,
          "status": "NOT_COMPLETED"
        }
      ]
    }
  ]
}
```

### Debug Enrollments

**Endpoint:** `GET /api/v1/courses/debug-enrollments`

**Authentication:** Required (Bearer Token)

**Description:** Debug endpoint to verify enrollment data and troubleshoot issues. Returns raw enrollment data with populated student and course information.

#### Sample Response

```json
{
  "tenantId": "692579de00a606524105887c",
  "totalEnrollments": 2,
  "enrollments": [
    {
      "enrollmentId": "69281ad6bbfc6cba5fb57204",
      "courseId": {
        "_id": "69257b6a00a60652410588af",
        "title": "test"
      },
      "courseTitle": "test",
      "studentId": {
        "_id": "69258e0978dcc1f0959c0dd9",
        "firstName": "Kingsley",
        "lastName": "Nweke",
        "fullName": "Kingsley Nweke",
        "id": "69258e0978dcc1f0959c0dd9"
      },
      "studentName": "Kingsley Nweke",
      "enrolledAt": "2025-11-27T09:33:10.029Z",
      "completedLessons": 1,
      "quizAttempts": 0
    }
  ]
}
```

## Data Flow

### 1. Lesson Completion

When a student completes a lesson, the progress is tracked through:

**Endpoint:** `PATCH /api/v1/enrollments/complete-lesson`

**Request Body:**
```json
{
  "lessonId": "69257b6a00a60652410588b3",
  "courseId": "69282c80bbfc6cba5fb58769"
}
```

**Response:**
```json
{
  "message": "Lesson marked as completed."
}
```

### 2. Progress Calculation

The analytics system calculates progress based on:

- **Total Lessons**: Count of all lessons across all modules in a course
- **Completed Lessons**: Count of lessons marked as completed in the enrollment
- **Progress Percentage**: `(completedLessons / totalLessons) * 100`

### 3. Quiz Score Calculation

- **Individual Student Quiz Score**: Average of all quiz attempts for that student
- **Course Average Quiz Score**: Average of all non-zero student quiz scores
- **Quiz Attempts**: Stored in enrollment with scores and timestamps

## Frontend Implementation Guide

### 1. Fetching Analytics Data

```javascript
// Fetch course analytics
const fetchCourseAnalytics = async () => {
  try {
    const response = await fetch('/api/v1/courses/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data.data; // Array of ICourseAnalyticsResponse
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  }
};
```

### 2. Displaying Analytics

```javascript
// Component to display course analytics
const CourseAnalyticsCard = ({ analytics }) => {
  return (
    <div className="analytics-card">
      <h3>{analytics.courseTitle}</h3>
      
      <div className="metrics">
        <div className="metric">
          <span className="label">Total Students:</span>
          <span className="value">{analytics.totalStudents}</span>
        </div>
        
        <div className="metric">
          <span className="label">Average Quiz Score:</span>
          <span className="value">{analytics.averageQuizScore}%</span>
        </div>
        
        <div className="metric">
          <span className="label">Completion Rate:</span>
          <span className="value">{analytics.completionRate}%</span>
        </div>
      </div>
      
      <div className="students-list">
        <h4>Student Progress</h4>
        {analytics.students.map(student => (
          <div key={student.studentId} className="student-item">
            <span>{student.studentName}</span>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${student.progress}%` }}
              />
            </div>
            <span>{student.progress}%</span>
            <span className={`status ${student.status.toLowerCase()}`}>
              {student.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 3. Real-time Updates

To show real-time progress updates:

```javascript
// Poll for updates every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const analytics = await fetchCourseAnalytics();
    setAnalyticsData(analytics);
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

### 4. Error Handling

```javascript
const handleAnalyticsError = (error) => {
  if (error.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Show permission denied message
    showError('You do not have permission to view analytics');
  } else {
    // Show generic error message
    showError('Failed to load analytics data');
  }
};
```

## Data Models

### Course Analytics Response

```typescript
interface CourseAnalyticsResponse {
  success: boolean;
  message: string;
  data: ICourseAnalyticsResponse[];
}
```

### Student Progress

```typescript
interface StudentProgress {
  studentId: string;
  studentName: string;
  progress: number; // 0-100
  status: 'COMPLETED' | 'NOT_COMPLETED' | 'IN_PROGRESS';
  quizScore: number; // 0-100
  lastActivity: Date;
  enrolledAt: Date;
}
```

## Performance Considerations

1. **Caching**: Analytics data can be cached for 5-10 minutes as it doesn't change frequently
2. **Pagination**: For courses with many students, consider implementing pagination
3. **Lazy Loading**: Load student details on demand for large cohorts
4. **Background Refresh**: Use background polling for real-time updates

## Troubleshooting

### Common Issues

1. **Empty Student Arrays**
   - Check if the tenant ID is correct
   - Verify enrollments exist using the debug endpoint
   - Ensure courses are published (`status: 'PUBLISHED'`)

2. **Incorrect Progress Calculations**
   - Verify lessons are being marked as completed
   - Check total lesson count in course modules
   - Use debug endpoint to verify completedLessons array

3. **Permission Errors**
   - Ensure user is authenticated
   - Check if user has analytics permissions
   - Verify tenant ID matches user's tenant

### Debug Steps

1. **Check Debug Endpoint**: Use `/debug-enrollments` to verify data
2. **Verify Authentication**: Ensure token is valid and not expired
3. **Check Network**: Verify API endpoint is accessible
4. **Review Console Logs**: Check for JavaScript errors

## Security Notes

- All analytics endpoints require authentication
- Data is filtered by tenant ID automatically
- No sensitive student data beyond name and progress is exposed
- Quiz scores are aggregated to protect individual privacy

## Future Enhancements

- **Date Range Filtering**: Filter analytics by date ranges
- **Export Functionality**: Export analytics to CSV/PDF
- **Advanced Metrics**: Add engagement metrics, time-to-completion
- **Comparative Analytics**: Compare course performance
- **Real-time Updates**: WebSocket integration for live updates
