import api from './api';
import {
    Course,
    Enrollment,
    Chapter,
    Progress,
    Rating,
    UserStats,
    InstructorStats,
} from '../types/course';
import { RecentCourse, TopCoursesByMetric } from '../types/instructor';

class CourseService {
    // Course endpoints
    async getCourses(params?: {
        category?: string;
        difficulty_level?: string;
        is_free?: boolean;
        instructor?: number;
        is_published?: boolean;
        search?: string;
        ordering?: string;
    }): Promise<Course[]> {
        const response = await api.get('/courses/', { params });
        return response.data.results || response.data;
    }

    async getCourse(id: number): Promise<Course> {
        const response = await api.get(`/courses/${id}/`);
        return response.data;
    }

    async createCourse(courseData: Partial<Course>): Promise<Course> {
        const response = await api.post('/courses/', courseData);
        return response.data;
    }

    async updateCourse(id: number, courseData: Partial<Course>): Promise<Course> {
        const response = await api.put(`/courses/${id}/`, courseData);
        return response.data;
    }

    async deleteCourse(id: number): Promise<void> {
        await api.delete(`/courses/${id}/`);
    }

    // Course custom actions
    async getCourseChapters(courseId: number): Promise<Chapter[]> {
        const response = await api.get(`/courses/${courseId}/chapters/`);
        return response.data;
    }

    async getCourseQuizzes(courseId: number) {
        const response = await api.get(`/courses/${courseId}/quizzes/`);
        return response.data;
    }

    async getCourseStudents(courseId: number): Promise<Enrollment[]> {
        const response = await api.get(`/courses/${courseId}/students/`);
        return response.data;
    }

    async getCourseRatings(courseId: number): Promise<Rating[]> {
        const response = await api.get(`/courses/${courseId}/ratings/`);
        return response.data;
    }

    async rateCourse(courseId: number, rating: number, review?: string): Promise<Rating> {
        const response = await api.post(`/courses/${courseId}/rate/`, {
            rating,
            review: review || '',
        });
        return response.data;
    }

    async getInstructorStats(): Promise<InstructorStats> {
        const response = await api.get('/courses/instructor_stats/');
        return response.data;
    }

    async getCourseEnrollmentCount(courseId: number): Promise<number> {
        const response = await api.get(`/courses/${courseId}/enrollment_count/`);
        return response.data.enrollment_count;
    }

    // Search and filtering
    async searchCourses(query: string, category?: string): Promise<Course[]> {
        const params: any = { search: query };
        if (category) params.category = category;
        return this.getCourses(params);
    }

    async getCoursesByCategory(category: string): Promise<Course[]> {
        return this.getCourses({ category });
    }

    async getInstructorCourses(instructorId: number): Promise<Course[]> {
        return this.getCourses({ instructor: instructorId });
    }

    // Dashboard endpoints
    async getContinueLearning(): Promise<any[]> {
        const response = await api.get('/dashboard/continue-learning/');
        return response.data.results || response.data;
    }

    async getPopularCourses(limit: number = 5): Promise<any[]> {
        const response = await api.get('/dashboard/popular/', { params: { limit } });
        return response.data.results || response.data;
    }

    async getRecentlyJoined(limit: number = 5): Promise<any[]> {
        const response = await api.get('/dashboard/recently-joined/', { params: { limit } });
        return response.data.results || response.data;
    }

    async getCategories(): Promise<any[]> {
        const response = await api.get('/categories/');
        return response.data.results || response.data;
    }

    async getDashboardStats(): Promise<any> {
        const response = await api.get('/dashboard/stats/');
        return response.data;
    }

    /**
     * Get courses from other instructors (excluding current instructor)
     * @param limit - Maximum number of courses to return (default: 6)
     */
    async getOtherInstructorsCourses(limit: number = 6): Promise<RecentCourse[]> {
        try {
            // This data comes from the instructor dashboard endpoint
            // For standalone use, we could filter published courses
            const response = await api.get('/courses/', {
                params: {
                    is_published: true,
                    ordering: '-created_at',
                    limit,
                },
            });
            return response.data.results || response.data;
        } catch (error) {
            console.error('Error fetching other instructors courses:', error);
            throw error;
        }
    }

    /**
     * Get platform top ranking courses
     * Returns courses ranked by enrollment and rating
     */
    async getPlatformTopCourses(): Promise<TopCoursesByMetric> {
        try {
            // Fetch top courses by enrollment
            const byEnrollmentResponse = await api.get('/courses/', {
                params: {
                    is_published: true,
                    ordering: '-enrollment_count',
                    limit: 5,
                },
            });

            // Fetch top courses by rating
            const byRatingResponse = await api.get('/courses/', {
                params: {
                    is_published: true,
                    ordering: '-average_rating',
                    limit: 5,
                },
            });

            return {
                by_enrollment: byEnrollmentResponse.data.results || byEnrollmentResponse.data,
                by_rating: byRatingResponse.data.results || byRatingResponse.data,
            };
        } catch (error) {
            console.error('Error fetching platform top courses:', error);
            throw error;
        }
    }
}

// Chapter Service
class ChapterService {
    async getChapters(params?: { course?: number }): Promise<Chapter[]> {
        const response = await api.get('/chapters/', { params });
        return response.data.results || response.data;
    }

    async getChapter(id: number): Promise<Chapter> {
        const response = await api.get(`/chapters/${id}/`);
        return response.data;
    }

    async createChapter(chapterData: Partial<Chapter>): Promise<Chapter> {
        const response = await api.post('/chapters/', chapterData);
        return response.data;
    }

    async updateChapter(id: number, chapterData: Partial<Chapter>): Promise<Chapter> {
        const response = await api.put(`/chapters/${id}/`, chapterData);
        return response.data;
    }

    async deleteChapter(id: number): Promise<void> {
        await api.delete(`/chapters/${id}/`);
    }

    async getChapterQuizzes(chapterId: number) {
        const response = await api.get(`/chapters/${chapterId}/quizzes/`);
        return response.data;
    }

    async bookmarkChapter(chapterId: number) {
        const response = await api.post(`/chapters/${chapterId}/bookmark/`);
        return response.data;
    }

    async unbookmarkChapter(chapterId: number) {
        await api.delete(`/chapters/${chapterId}/unbookmark/`);
    }
}

// Enrollment Service
class EnrollmentService {
    async getEnrollments(params?: {
        student?: number;
        course?: number;
        is_active?: boolean;
    }): Promise<Enrollment[]> {
        const response = await api.get('/enrollments/', { params });
        return response.data.results || response.data;
    }

    async getEnrollment(id: number): Promise<Enrollment> {
        const response = await api.get(`/enrollments/${id}/`);
        return response.data;
    }

    async enrollInCourse(courseId: number): Promise<Enrollment> {
        const response = await api.post('/enrollments/', { course_id: courseId });
        return response.data.enrollment || response.data;
    }

    async unenrollFromCourse(enrollmentId: number): Promise<void> {
        await api.delete(`/enrollments/${enrollmentId}/`);
    }

    async getMyCourses(): Promise<Enrollment[]> {
        const response = await api.get('/enrollments/my_courses/');
        return response.data;
    }
}

// Progress Service
class ProgressService {
    async getProgress(params?: {
        student?: number;
        course?: number;
        is_completed?: boolean;
    }): Promise<Progress[]> {
        const response = await api.get('/progress/', { params });
        return response.data.results || response.data;
    }

    async getProgressById(id: number): Promise<Progress> {
        const response = await api.get(`/progress/${id}/`);
        return response.data;
    }

    async createOrUpdateProgress(progressData: Partial<Progress>): Promise<Progress> {
        const response = await api.post('/progress/', progressData);
        return response.data;
    }

    async updateProgress(id: number, progressData: Partial<Progress>): Promise<Progress> {
        const response = await api.put(`/progress/${id}/`, progressData);
        return response.data;
    }

    async getCourseProgress(courseId: number): Promise<Progress> {
        const response = await api.get(`/progress/course/${courseId}/`);
        return response.data;
    }

    async getUserStats(): Promise<UserStats> {
        const response = await api.get('/progress/user_stats/');
        return response.data;
    }
}

export const courseService = new CourseService();
export const chapterService = new ChapterService();
export const enrollmentService = new EnrollmentService();
export const progressService = new ProgressService();

export default courseService;
