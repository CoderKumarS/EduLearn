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
}

export const courseService = new CourseService();