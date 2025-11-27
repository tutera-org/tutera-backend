import type { Response, NextFunction } from 'express';
import Course from '../models/Courses.ts';
import Enrollment from '../models/Enrollments.ts';
import { User } from '../models/User.ts';
import { UserRole } from '../interfaces/index.ts';
import { AppError } from '../utils/AppError.ts';
import { getSocketManager } from '../sockets/index.ts';
import type { AuthRequest } from '../interfaces/index.ts';

interface PopulatedEnrollment {
  studentId: { firstName: string; lastName: string };
  courseId: { title: string };
  enrolledAt: Date;
}

interface EnrollmentWithCoursePrice {
  courseId: { price: number };
}

interface DashboardAnalytics {
  date: string; // Add date field
  label: string; // Add human-readable label
  coursesSold: number;
  revenue: number;
  studentsEnrolled: number;
  completionRate: number;
}

interface CourseOverview {
  _id: string;
  title: string;
  price: number;
  studentCount: number;
  enrolledStudents: string[]; // Add enrolled student names
  status: string;
}

interface RecentActivity {
  type: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

interface DashboardResponse {
  totalEnrolledLearners: number;
  courses: CourseOverview[];
  totalEarnings: number;
  overallAnalysis: {
    daily: DashboardAnalytics[];
    weekly: DashboardAnalytics[];
    monthly: DashboardAnalytics[];
  };
  recentActivity: RecentActivity[];
  courseOverview: CourseOverview[];
}

export class CreatorDashboardController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      const userId = req.user?.userId;

      if (!tenantId || !userId) {
        throw new AppError('Authentication required', 401);
      }

      // Verify user is a creator or institution
      const user = await User.findById(userId);
      if (!user || ![UserRole.INDEPENDENT_CREATOR, UserRole.INSTITUTION].includes(user.role)) {
        throw new AppError('Access denied. Creator role required.', 403);
      }

      const dashboard = await this.generateDashboardData(tenantId);
      res.status(200).json({
        success: true,
        message: 'Dashboard data fetched successfully',
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  private async generateDashboardData(tenantId: string): Promise<DashboardResponse> {
    const [
      totalEnrolledLearners,
      courses,
      totalEarnings,
      dailyAnalysis,
      weeklyAnalysis,
      monthlyAnalysis,
      recentActivity,
    ] = await Promise.all([
      this.getTotalEnrolledLearners(tenantId),
      this.getCoursesOverview(tenantId),
      this.getTotalEarnings(tenantId),
      this.getAnalyticsData(tenantId, 'daily'),
      this.getAnalyticsData(tenantId, 'weekly'),
      this.getAnalyticsData(tenantId, 'monthly'),
      this.getRecentActivity(tenantId),
    ]);

    return {
      totalEnrolledLearners,
      courses,
      totalEarnings,
      overallAnalysis: {
        daily: dailyAnalysis,
        weekly: weeklyAnalysis,
        monthly: monthlyAnalysis,
      },
      recentActivity,
      courseOverview: courses,
    };
  }

  private async getTotalEnrolledLearners(tenantId: string): Promise<number> {
    // Count all students (users with STUDENT role) in the tenant
    const totalStudents = await User.countDocuments({
      tenantId,
      role: UserRole.STUDENT,
      isActive: true,
    });

    const students = await User.find({
      tenantId,
      role: UserRole.STUDENT,
      isActive: true,
    }).select('firstName lastName createdAt');
    console.log(
      'Students in tenant:',
      students.map((s) => ({
        name: `${s.firstName} ${s.lastName}`,
        createdAt: s.createdAt.toISOString(),
      }))
    );
    return totalStudents;
  }

  private async getCoursesOverview(tenantId: string): Promise<CourseOverview[]> {
    const courses = await Course.find({ tenantId, isActive: true })
      .select('_id title price status totalEnrollments')
      .lean();

    const courseOverviews: CourseOverview[] = [];

    for (const course of courses) {
      // Get actual enrollments for this course using the same logic as recent activity
      const enrollments = await Enrollment.find({ tenantId, courseId: course._id })
        .populate({
          path: 'studentId',
          select: 'firstName lastName',
          model: 'User',
        })
        .sort({ enrolledAt: -1 })
        .lean();

      const studentCount = enrollments.length;
      const enrolledStudents = enrollments.map((enrollment) => {
        const populated = enrollment as PopulatedEnrollment;
        // Use the same logic as recent activity that works
        const studentName = populated.studentId
          ? `${populated.studentId.firstName} ${populated.studentId.lastName}`
          : 'Unknown Student';
        return studentName;
      });

      courseOverviews.push({
        _id: course._id.toString(),
        title: course.title,
        price: course.price,
        studentCount,
        enrolledStudents,
        status: course.status,
      });
    }

    return courseOverviews;
  }

  private async getTotalEarnings(tenantId: string): Promise<number> {
    // Get all enrollments with course prices to calculate actual earnings
    const enrollments = await Enrollment.find({ tenantId })
      .populate({
        path: 'courseId',
        select: 'price',
        model: 'Course',
      })
      .lean();

    return enrollments.reduce((sum, enrollment) => {
      const populatedEnrollment = enrollment as EnrollmentWithCoursePrice;
      const coursePrice = populatedEnrollment.courseId?.price || 0;
      return sum + coursePrice;
    }, 0);
  }

  private async getAnalyticsData(
    tenantId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<DashboardAnalytics[]> {
    const now = new Date();
    const periods: DashboardAnalytics[] = [];

    if (period === 'daily') {
      // Last 24 hours (hourly breakdown)
      for (let i = 23; i >= 0; i--) {
        const hourDate = new Date(now);
        hourDate.setHours(hourDate.getHours() - i);

        const startDate = new Date(hourDate);
        startDate.setMinutes(0, 0, 0);

        const endDate = new Date(hourDate);
        endDate.setMinutes(59, 59, 999);

        const [coursesSold, revenue, studentsEnrolled, completionRate] = await Promise.all([
          this.getCoursesSoldInPeriod(tenantId, startDate, endDate),
          this.getRevenueInPeriod(tenantId, startDate, endDate),
          this.getStudentsEnrolledInPeriod(tenantId, startDate, endDate),
          this.getCompletionRateInPeriod(tenantId, startDate, endDate),
        ]);

        periods.push({
          date: hourDate.toISOString().split('T')[0] || '',
          label: startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          coursesSold,
          revenue,
          studentsEnrolled,
          completionRate,
        });
      }
    } else if (period === 'weekly') {
      // Last 7 days (daily breakdown)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const [coursesSold, revenue, studentsEnrolled, completionRate] = await Promise.all([
          this.getCoursesSoldInPeriod(tenantId, startDate, endDate),
          this.getRevenueInPeriod(tenantId, startDate, endDate),
          this.getStudentsEnrolledInPeriod(tenantId, startDate, endDate),
          this.getCompletionRateInPeriod(tenantId, startDate, endDate),
        ]);

        periods.push({
          date: date.toISOString().split('T')[0] || '',
          label: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          coursesSold,
          revenue,
          studentsEnrolled,
          completionRate,
        });
      }
    } else {
      // Last 4 weeks (weekly breakdown)
      for (let i = 3; i >= 0; i--) {
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() - i * 7);

        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        endDate.setHours(23, 59, 59, 999);

        const [coursesSold, revenue, studentsEnrolled, completionRate] = await Promise.all([
          this.getCoursesSoldInPeriod(tenantId, startDate, endDate),
          this.getRevenueInPeriod(tenantId, startDate, endDate),
          this.getStudentsEnrolledInPeriod(tenantId, startDate, endDate),
          this.getCompletionRateInPeriod(tenantId, startDate, endDate),
        ]);

        periods.push({
          date: startDate.toISOString().split('T')[0] || '',
          label: `Week ${4 - i} (${startDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
          coursesSold,
          revenue,
          studentsEnrolled,
          completionRate,
        });
      }
    }

    return periods;
  }

  private async getCoursesSoldInPeriod(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const enrollments = await Enrollment.countDocuments({
      tenantId,
      enrolledAt: { $gte: startDate, $lte: endDate },
    });
    return enrollments;
  }

  private async getRevenueInPeriod(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const enrollments = await Enrollment.find({
      tenantId,
      enrolledAt: { $gte: startDate, $lte: endDate },
    }).populate('courseId');

    let revenue = 0;
    for (const enrollment of enrollments) {
      const course = await Course.findById(enrollment.courseId);
      if (course) {
        revenue += course.price;
      }
    }
    return revenue;
  }

  private async getStudentsEnrolledInPeriod(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Count students who were onboarded (created) during this period
    const studentsOnboarded = await User.countDocuments({
      tenantId,
      role: UserRole.STUDENT,
      isActive: true,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    return studentsOnboarded;
  }

  private async getCompletionRateInPeriod(
    tenantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const enrollments = await Enrollment.find({
      tenantId,
      enrolledAt: { $gte: startDate, $lte: endDate },
    });

    if (enrollments.length === 0) return 0;

    let completedCount = 0;
    for (const enrollment of enrollments) {
      const course = await Course.findById(enrollment.courseId);
      if (course) {
        const totalLessons = await this.getTotalLessonsForCourse(course._id.toString(), tenantId);
        const completionRate =
          totalLessons > 0 ? (enrollment.completedLessons.length / totalLessons) * 100 : 0;
        if (completionRate >= 80) {
          completedCount++;
        }
      }
    }

    return (completedCount / enrollments.length) * 100;
  }

  private async getTotalLessonsForCourse(courseId: string, tenantId: string): Promise<number> {
    const { default: Module } = await import('../models/Modules.ts');
    const { default: Lesson } = await import('../models/Lessons.ts');

    // Get all modules for this course
    const modules = await Module.find({ courseId, tenantId }).select('_id');

    if (modules.length === 0) return 0;

    // Count all lessons for these modules
    const moduleIds = modules.map((module) => module._id);
    const totalLessons = await Lesson.countDocuments({
      moduleId: { $in: moduleIds },
      tenantId,
    });

    return totalLessons;
  }

  private async getRecentActivity(tenantId: string): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // 1. Get recent course creations
    const recentCourses = await Course.find({ tenantId }).sort({ createdAt: -1 }).limit(3).lean();

    recentCourses.forEach((course) => {
      activities.push({
        type: 'course_created',
        message: `New course "${course.title}" has been published`,
        timestamp: course.createdAt,
        isRead: false,
      });
    });

    // 2. Get recent enrollments
    const recentEnrollments = await Enrollment.find({ tenantId })
      .populate({
        path: 'studentId',
        select: 'firstName lastName',
        model: 'User',
      })
      .populate({
        path: 'courseId',
        select: 'title',
        model: 'Course',
      })
      .sort({ enrolledAt: -1 })
      .limit(3)
      .lean();

    recentEnrollments.forEach((enrollment) => {
      const populated = enrollment as PopulatedEnrollment;
      // Check if populated fields exist before using them
      const studentName = populated.studentId
        ? `${populated.studentId.firstName} ${populated.studentId.lastName}`
        : 'Unknown Student';
      const courseTitle = populated.courseId?.title || 'Unknown Course';

      activities.push({
        type: 'enrollment',
        message: `${studentName} enrolled in "${courseTitle}"`,
        timestamp: populated.enrolledAt,
        isRead: false,
      });
    });

    // 3. Get recent student onboarding (last 2 students)
    const recentStudents = await User.find({ tenantId, role: UserRole.STUDENT })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean();

    recentStudents.forEach((student) => {
      activities.push({
        type: 'onboarding',
        message: `New student ${student.firstName} ${student.lastName} joined your platform`,
        timestamp: student.createdAt,
        isRead: false,
      });
    });

    // 4. Get online users (socket activity)
    const socketManager = getSocketManager();
    const onlineUsers = socketManager.getOnlineUsers();
    const tenantStudents = await User.find({ tenantId, role: UserRole.STUDENT }).limit(5);

    for (const user of tenantStudents) {
      if (onlineUsers.has((user._id as string).toString())) {
        activities.unshift({
          type: 'online',
          message: `${user.firstName} ${user.lastName} is online`,
          timestamp: new Date(),
          isRead: true,
        });
      }
    }

    // Sort all activities by timestamp (most recent first) and limit to 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return sortedActivities;
  }
}

export default new CreatorDashboardController();
