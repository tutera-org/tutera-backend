import type { Response, NextFunction } from 'express';
import Course from '../models/Courses.ts';
import Enrollment from '../models/Enrollments.ts';
import { User } from '../models/User.ts';
import { UserRole } from '../interfaces/index.ts';
import { Notification } from '../models/Notifications.ts';
import { AppError } from '../utils/AppError.ts';
import { getSocketManager } from '../sockets/index.ts';
import type { AuthRequest } from '../interfaces/index.ts';

interface DashboardAnalytics {
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
    return totalStudents;
  }

  private async getCoursesOverview(tenantId: string): Promise<CourseOverview[]> {
    const courses = await Course.find({ tenantId, isActive: true })
      .select('_id title price status totalEnrollments')
      .lean();

    return courses.map((course) => ({
      _id: course._id.toString(),
      title: course.title,
      price: course.price,
      studentCount: course.totalEnrollments || 0,
      status: course.status,
    }));
  }

  private async getTotalEarnings(tenantId: string): Promise<number> {
    const courses = await Course.find({ tenantId, isActive: true })
      .select('price totalEnrollments')
      .lean();

    return courses.reduce((total, course) => {
      return total + course.price * (course.totalEnrollments || 0);
    }, 0);
  }

  private async getAnalyticsData(
    tenantId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<DashboardAnalytics[]> {
    const now = new Date();
    const periods: DashboardAnalytics[] = [];

    let periodsCount: number;
    let dateIncrement: (date: Date) => void;

    switch (period) {
      case 'daily':
        periodsCount = 30;
        dateIncrement = (date) => date.setDate(date.getDate() - 1);
        break;
      case 'weekly':
        periodsCount = 12;
        dateIncrement = (date) => date.setDate(date.getDate() - 7);
        break;
      case 'monthly':
        periodsCount = 12;
        dateIncrement = (date) => date.setMonth(date.getMonth() - 1);
        break;
    }

    for (let i = 0; i < periodsCount; i++) {
      const currentDate = new Date(now);
      dateIncrement(currentDate);

      const startDate = new Date(currentDate);
      const endDate = new Date(currentDate);

      if (period === 'daily') {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (period === 'weekly') {
        const dayOfWeek = currentDate.getDay();
        startDate.setDate(currentDate.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setMonth(currentDate.getMonth() + 1);
        endDate.setDate(0);
        endDate.setHours(23, 59, 59, 999);
      }

      const [coursesSold, revenue, studentsEnrolled, completionRate] = await Promise.all([
        this.getCoursesSoldInPeriod(tenantId, startDate, endDate),
        this.getRevenueInPeriod(tenantId, startDate, endDate),
        this.getStudentsEnrolledInPeriod(tenantId, startDate, endDate),
        this.getCompletionRateInPeriod(tenantId, startDate, endDate),
      ]);

      periods.push({
        coursesSold,
        revenue,
        studentsEnrolled,
        completionRate,
      });
    }

    return periods.reverse();
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
    const uniqueStudents = await Enrollment.distinct('studentId', {
      tenantId,
      enrolledAt: { $gte: startDate, $lte: endDate },
    });
    return uniqueStudents.length;
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
    // Get recent notifications for this tenant
    const notifications = await Notification.find({
      // Note: You might need to add tenantId to notifications schema for proper filtering
      // For now, getting recent notifications in general
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get online users for this tenant
    const socketManager = getSocketManager();
    const onlineUsers = socketManager.getOnlineUsers();

    // Combine notifications with socket activity
    const activities: RecentActivity[] = notifications.map((notification) => ({
      type: notification.type,
      message: notification.message,
      timestamp: notification.createdAt,
      isRead: notification.read,
    }));

    // Add socket connection activities if available
    const tenantUsers = await User.find({ tenantId, role: UserRole.STUDENT }).limit(5);
    for (const user of tenantUsers) {
      if (onlineUsers.has(user._id.toString())) {
        activities.unshift({
          type: 'online',
          message: `${user.firstName} ${user.lastName} is online`,
          timestamp: new Date(),
          isRead: true,
        });
      }
    }

    return activities.slice(0, 10);
  }
}

export default new CreatorDashboardController();
