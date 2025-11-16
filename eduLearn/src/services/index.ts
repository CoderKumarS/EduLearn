export { default as api } from './api';
export { authService } from './authService';
export { courseService, chapterService, enrollmentService, progressService } from './courseService';
export { adminService } from './adminService';
export { aiTutorService } from './aiTutorService';
export { contactService } from './contactService';
export { profileService } from './profileService';
export { instructorService } from './instructorService';

// New services
export { default as quizService } from './quizService';
export { default as notificationService } from './notificationService';
export { default as certificateService } from './certificateService';
export { default as discussionService } from './discussionService';
export { default as ratingService } from './ratingService';
export { default as bookmarkService } from './bookmarkService';

// Re-export for convenience
export { quizService as quiz } from './quizService';
export { questionService, optionService, quizAttemptService, studentAnswerService } from './quizService';

// Topic-based learning services
export { default as topicService } from './topicService';
export { default as progressService } from './progressService';
