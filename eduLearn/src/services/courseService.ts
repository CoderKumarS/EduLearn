import api from './api';
import { Course, Enrollment, Quiz, Question, Progress, QuizSubmission } from '../types/course';

class CourseService {
  // Course endpoints
  async getCourses(): Promise<Course[]> {
    const response = await api.get('/courses/');
    return response.data;
  }

  async getCourse(id: string): Promise<Course> {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  }

  async createCourse(courseData: Partial<Course>): Promise<Course> {
    const response = await api.post('/courses/', courseData);
    return response.data;
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<Course> {
    const response = await api.put(`/courses/${id}/`, courseData);
    return response.data;
  }

  async deleteCourse(id: string): Promise<void> {
    await api.delete(`/courses/${id}/`);
  }

  // Enrollment endpoints
  async getEnrollments(): Promise<Enrollment[]> {
    const response = await api.get('/enrollments/');
    return response.data;
  }

  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const response = await api.post('/enrollments/', { course: courseId });
    return response.data;
  }

  async unenrollFromCourse(enrollmentId: string): Promise<void> {
    await api.delete(`/enrollments/${enrollmentId}/`);
  }

  // Quiz endpoints
  async getQuizzes(): Promise<Quiz[]> {
    const response = await api.get('/quizzes/');
    return response.data;
  }

  async getQuiz(id: string): Promise<Quiz> {
    const response = await api.get(`/quizzes/${id}/`);
    return response.data;
  }

  async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const response = await api.post('/quizzes/', quizData);
    return response.data;
  }

  // Question endpoints
  async getQuestions(): Promise<Question[]> {
    const response = await api.get('/questions/');
    return response.data;
  }

  async createQuestion(questionData: Partial<Question>): Promise<Question> {
    const response = await api.post('/questions/', questionData);
    return response.data;
  }

  // Quiz submission
  async submitQuiz(submission: QuizSubmission): Promise<{ message: string; score: number }> {
    const response = await api.post('/answers/submit-quiz/', submission);
    return response.data;
  }

  // Progress endpoints
  async getProgress(): Promise<Progress[]> {
    const response = await api.get('/progress/');
    return response.data;
  }

  async getStudentProgress(studentId: string): Promise<Progress[]> {
    const response = await api.get(`/progress/?student=${studentId}`);
    return response.data;
  }

  // Chapter endpoints
  async getCourseChapters(courseId: string) {
    try {
      const response = await api.get(`/courses/${courseId}/chapters/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course chapters:', error);
      return [];
    }
  }

  async createChapter(courseId: string, chapterData: any) {
    const response = await api.post(`/courses/${courseId}/chapters/`, chapterData);
    return response.data;
  }

  async updateChapter(courseId: string, chapterId: string, chapterData: any) {
    const response = await api.put(`/courses/${courseId}/chapters/${chapterId}/`, chapterData);
    return response.data;
  }

  async deleteChapter(courseId: string, chapterId: string): Promise<void> {
    await api.delete(`/courses/${courseId}/chapters/${chapterId}/`);
  }

  // Course search and filtering
  async searchCourses(query: string, category?: string): Promise<Course[]> {
    try {
      let url = `/courses/search/?q=${encodeURIComponent(query)}`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error searching courses:', error);
      return [];
    }
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const response = await api.get(`/courses/?category=${encodeURIComponent(category)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses by category:', error);
      return [];
    }
  }

  // Course ratings and reviews
  async rateCourse(courseId: string, rating: number, review?: string) {
    const response = await api.post(`/courses/${courseId}/rate/`, { rating, review });
    return response.data;
  }

  async getCourseReviews(courseId: string) {
    try {
      const response = await api.get(`/courses/${courseId}/reviews/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      return [];
    }
  }
}

export const courseService = new CourseService();