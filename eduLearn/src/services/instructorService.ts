import api from './api';
import { CourseWithEnrollment, InstructorStats } from '../types/course';

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
}

export const instructorService = new InstructorService();
