import api from './api';
import { CourseWithEnrollment, InstructorStats } from '../types/course';
import {
    InstructorDashboardData,
    RecentCourse,
    RecentChapter,
    StudentActivity,
    TopCoursesByMetric,
} from '../types/instructor';

class InstructorService {
    /**
     * Get statistics for the authenticated instructor
     * Returns total courses, total students, and courses with enrollment counts
     */
    async getInstructorStats(): Promise<InstructorStats> {
        const response = await api.get('/courses/instructor_stats/');
        return response.data;
    }

    /**
     * Get all courses created by the authenticated instructor
     * Includes enrollment count for each course
     */
    async getMyCourses(): Promise<CourseWithEnrollment[]> {
        const stats = await this.getInstructorStats();
        return stats.courses;
    }

    /**
     * Get enrollment count for a specific course
     */
    async getCourseEnrollmentCount(courseId: number): Promise<number> {
        try {
            const response = await api.get(`/courses/${courseId}/enrollment_count/`);
            return response.data.enrollment_count;
        } catch (error) {
            console.error('Error fetching enrollment count:', error);
            return 0;
        }
    }

    /**
     * Get complete instructor dashboard data
     * Includes stats, recent courses, chapters, activities, and rankings
     */
    async getInstructorDashboard(): Promise<InstructorDashboardData> {
        try {
            const response = await api.get('/courses/instructor-dashboard/');
            return response.data;
        } catch (error) {
            console.error('Error fetching instructor dashboard:', error);
            throw error;
        }
    }

    /**
     * Get recently created courses by the instructor
     * @param limit - Maximum number of courses to return (default: 5)
     */
    async getRecentCourses(limit: number = 5): Promise<RecentCourse[]> {
        try {
            const dashboard = await this.getInstructorDashboard();
            return dashboard.recent_courses.slice(0, limit);
        } catch (error) {
            console.error('Error fetching recent courses:', error);
            throw error;
        }
    }

    /**
     * Get recently created chapters by the instructor
     * @param limit - Maximum number of chapters to return (default: 5)
     */
    async getRecentChapters(limit: number = 5): Promise<RecentChapter[]> {
        try {
            const dashboard = await this.getInstructorDashboard();
            return dashboard.recent_chapters.slice(0, limit);
        } catch (error) {
            console.error('Error fetching recent chapters:', error);
            throw error;
        }
    }

    /**
     * Get recent student activities for instructor's courses
     * @param limit - Maximum number of activities to return (default: 10)
     */
    async getRecentStudentActivities(limit: number = 10): Promise<StudentActivity[]> {
        try {
            const dashboard = await this.getInstructorDashboard();
            return dashboard.recent_activities.slice(0, limit);
        } catch (error) {
            console.error('Error fetching recent student activities:', error);
            throw error;
        }
    }

    /**
     * Get instructor's top performing courses
     * Returns courses ranked by enrollment and rating
     */
    async getMyTopCourses(): Promise<TopCoursesByMetric> {
        try {
            const dashboard = await this.getInstructorDashboard();
            return dashboard.my_top_courses;
        } catch (error) {
            console.error('Error fetching top courses:', error);
            throw error;
        }
    }
}

export const instructorService = new InstructorService();
