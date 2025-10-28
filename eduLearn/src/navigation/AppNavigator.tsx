import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { StudentDashboard } from '../screens/StudentDashboard';
import { InstructorDashboard } from '../screens/InstructorDashboard';
import { QuizScreen } from '../screens/QuizScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateCourseScreen } from '../screens/CreateCourseScreen';

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Courses: undefined;
    CourseDetail: { courseId: string };
    StudentDashboard: undefined;
    InstructorDashboard: undefined;
    Quiz: { quizId: string };
    Profile: undefined;
    CreateCourse: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
    const { authState } = useAuth();
    const { theme } = useTheme();
    const [showSplash, setShowSplash] = useState(true);
    const [currentScreen, setCurrentScreen] = useState<keyof RootStackParamList>('Home');
    const [screenParams, setScreenParams] = useState<any>({});

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // Show splash screen while auth is loading or during initial splash
    if (showSplash || authState.isLoading) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    // Navigation handlers
    const navigateToLogin = () => setCurrentScreen('Login');
    const navigateToRegister = () => setCurrentScreen('Register');
    const navigateToHome = () => setCurrentScreen('Home');
    const navigateToCourses = () => setCurrentScreen('Courses');
    const navigateToStudentDashboard = () => setCurrentScreen('StudentDashboard');
    const navigateToInstructorDashboard = () => setCurrentScreen('InstructorDashboard');
    const navigateToProfile = () => setCurrentScreen('Profile');
    const navigateToCourse = (courseId: string) => {
        setScreenParams({ courseId });
        setCurrentScreen('CourseDetail');
    };
    const navigateToQuiz = (quizId: string) => {
        setScreenParams({ quizId });
        setCurrentScreen('Quiz');
    };
    const navigateToCreateCourse = () => setCurrentScreen('CreateCourse');

    const renderAuthenticatedScreen = () => {
        switch (currentScreen) {
            case 'Courses':
                return (
                    <CoursesScreen
                        onNavigateBack={navigateToHome}
                        onNavigateToCourse={navigateToCourse}
                    />
                );
            case 'CourseDetail':
                return (
                    <CourseDetailScreen
                        courseId={screenParams.courseId}
                        onNavigateBack={navigateToHome}
                        onNavigateToQuiz={navigateToQuiz}
                    />
                );
            case 'StudentDashboard':
                return (
                    <StudentDashboard
                        onNavigateBack={navigateToHome}
                        onNavigateToCourse={navigateToCourse}
                    />
                );
            case 'InstructorDashboard':
                return (
                    <InstructorDashboard
                        onNavigateBack={navigateToHome}
                        onNavigateToCourse={navigateToCourse}
                        onCreateCourse={navigateToCreateCourse}
                    />
                );
            case 'CreateCourse':
                return (
                    <CreateCourseScreen
                        onNavigateBack={() => setCurrentScreen('InstructorDashboard')}
                        onCourseCreated={() => setCurrentScreen('InstructorDashboard')}
                    />
                );
            case 'Quiz':
                return (
                    <QuizScreen
                        quizId={screenParams.quizId}
                        onNavigateBack={() => setCurrentScreen('Home')}
                    />
                );
            case 'Profile':
                return (
                    <ProfileScreen
                        onNavigateBack={navigateToHome}
                    />
                );
            default:
                return (
                    <HomeScreen
                        onNavigateToCourses={navigateToCourses}
                        onNavigateToProfile={navigateToProfile}
                        onNavigateToCourse={navigateToCourse}
                        onNavigateToStudentDashboard={navigateToStudentDashboard}
                        onNavigateToInstructorDashboard={navigateToInstructorDashboard}
                    />
                );
        }
    };

    const renderUnauthenticatedScreen = () => {
        switch (currentScreen) {
            case 'Register':
                return <RegisterScreen onNavigateToLogin={navigateToLogin} />;
            default:
                return <LoginScreen onNavigateToRegister={navigateToRegister} />;
        }
    };

    return (
        <NavigationContainer
            theme={{
                dark: theme.isDark,
                colors: {
                    primary: theme.colors.primary,
                    background: theme.colors.background,
                    card: theme.colors.card,
                    text: theme.colors.text,
                    border: theme.colors.border,
                    notification: theme.colors.notification,
                },
                fonts: {
                    regular: {
                        fontFamily: 'System',
                        fontWeight: '400',
                    },
                    medium: {
                        fontFamily: 'System',
                        fontWeight: '500',
                    },
                    bold: {
                        fontFamily: 'System',
                        fontWeight: '700',
                    },
                    heavy: {
                        fontFamily: 'System',
                        fontWeight: '900',
                    },
                },
            }}
        >
            {authState.isAuthenticated ? renderAuthenticatedScreen() : renderUnauthenticatedScreen()}
        </NavigationContainer>
    );
};