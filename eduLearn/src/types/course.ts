export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    username: string;
  };
  created_at: string;
}

export interface Enrollment {
  id: string;
  student: {
    id: string;
    username: string;
  };
  course: Course;
  enrolled_at: string;
}

export interface Quiz {
  id: string;
  course: string;
  title: string;
  time_limit: number;
  created_at: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  quiz: string;
  text: string;
  options: Option[];
}

export interface Option {
  id: string;
  question: string;
  text: string;
  is_correct: boolean;
}

export interface StudentAnswer {
  id: string;
  student: string;
  question: string;
  selected_option: string;
  submitted_at: string;
}

export interface Progress {
  id: string;
  student: string;
  course: string;
  completed_lessons: number;
  total_lessons: number;
  score: number;
}

export const calculateProgressPercent = (progress: Progress): number => {
  if (progress.total_lessons === 0) return 0;
  return (progress.completed_lessons / progress.total_lessons) * 100;
};

export interface QuizSubmission {
  quiz_id: string;
  answers: {
    question: string;
    selected_option: string;
  }[];
}