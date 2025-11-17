// Instructor Dashboard Types

export interface InstructorStats {
    total_courses: number;
    total_students: number;
    total_chapters: number;
}

export interface RecentCourse {
    id: number;
    title: string;
    description: string;
    thumbnail: string | null;
    created_at: string;
    enrollment_count: number;
    average_rating: number | null;
    instructor_name: string;
}

export interface RecentChapter {
    id: number;
    title: string;
    course_id: number;
    course_title: string;
    created_at: string;
}

export type ActivityType = 'enrollment' | 'chapter_completion' | 'quiz_submission';

export interface StudentActivity {
    id: string;
    student_name: string;
    student_avatar: string | null;
    course_name: string;
    course_id: number;
    activity_type: ActivityType;
    timestamp: string;
    details: {
        chapter_title?: string;
        quiz_title?: string;
        score?: number;
    };
}

export interface TopCoursesByMetric {
    by_enrollment: RecentCourse[];
    by_rating: RecentCourse[];
}

export interface InstructorDashboardData {
    stats: InstructorStats;
    recent_courses: RecentCourse[];
    recent_chapters: RecentChapter[];
    recent_activities: StudentActivity[];
    my_top_courses: TopCoursesByMetric;
    other_instructors_courses: RecentCourse[];
    platform_top_courses: TopCoursesByMetric;
}
