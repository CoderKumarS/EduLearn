import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
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
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CreateCourseScreen } from '../screens/CreateCourseScreen';
import { ContentModerationScreen } from '../screens/ContentModerationScreen';
import { AITutorChatScreen } from '../screens/AITutorChatScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { ContactUsScreen } from '../screens/ContactUsScreen';

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    CourseDetail: { courseId: string };
    Quiz: { quizId: string };
    CreateCourse: undefined;
    ContentModeration: undefined;
    AITutorChat: undefined;
    ProfileSettings: undefined;
    AboutUs: undefined;
    ContactUs: undefined;
};

export type TabParamList = {
    Home: undefined;
    Dashboard: undefined;
    Explore: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Screen wrappers to bridge React Navigation with existing screen props
const HomeScreenWrapper = ({ navigation }: any) => (
    <HomeScreen
        onNavigateToCourses={() => navigation.navigate('Explore')}
        onNavigateToProfile={() => navigation.navigate('Profile')}
        onNavigateToCourse={(courseId: string) => navigation.navigate('CourseDetail', { courseId })}
        onNavigateToStudentDashboard={() => navigation.navigate('Dashboard')}
        onNavigateToInstructorDashboard={() => navigation.navigate('Dashboard')}
        onNavigateToAdminDashboard={() => navigation.navigate('Dashboard')}
        onNavigateToAITutor={() => navigation.navigate('AITutorChat')}
        onNavigateToAboutUs={() => navigation.navigate('AboutUs')}
        onNavigateToContactUs={() => navigation.navigate('ContactUs')}
    />
);

const CoursesScreenWrapper = ({ navigation }: any) => (
    <CoursesScreen
        onNavigateBack={() => navigation.goBack()}
        onNavigateToCourse={(courseId: string) => navigation.navigate('CourseDetail', { courseId })}
    />
);

const ProfileScreenWrapper = ({ navigation }: any) => (
    <ProfileScreen onNavigateBack={() => navigation.goBack()} />
);

const CourseDetailScreenWrapper = ({ route, navigation }: any) => (
    <CourseDetailScreen
        courseId={route.params.courseId}
        onNavigateBack={() => navigation.goBack()}
        onNavigateToQuiz={(quizId: string) => navigation.navigate('Quiz', { quizId })}
    />
);

const QuizScreenWrapper = ({ route, navigation }: any) => (
    <QuizScreen
        quizId={route.params.quizId}
        onNavigateBack={() => navigation.goBack()}
    />
);

const CreateCourseScreenWrapper = ({ navigation }: any) => (
    <CreateCourseScreen
        onNavigateBack={() => navigation.goBack()}
        onCourseCreated={() => navigation.navigate('Dashboard')}
    />
);

const StudentDashboardWrapper = ({ navigation }: any) => (
    <StudentDashboard
        onNavigateBack={() => navigation.goBack()}
        onNavigateToCourse={(courseId: string) => navigation.navigate('CourseDetail', { courseId })}
    />
);

const InstructorDashboardWrapper = ({ navigation }: any) => (
    <InstructorDashboard
        onNavigateBack={() => navigation.goBack()}
        onNavigateToCourse={(courseId: string) => navigation.navigate('CourseDetail', { courseId })}
        onCreateCourse={() => navigation.navigate('CreateCourse')}
    />
);

const AdminDashboardWrapper = ({ navigation }: any) => (
    <AdminDashboardScreen
        onNavigateBack={() => navigation.goBack()}
        onNavigateToContentModeration={() => navigation.navigate('ContentModeration')}
    />
);

const ContentModerationScreenWrapper = ({ navigation }: any) => (
    <ContentModerationScreen
        onNavigateBack={() => navigation.goBack()}
    />
);

const AITutorChatScreenWrapper = ({ navigation }: any) => (
    <AITutorChatScreen
        onNavigateBack={() => navigation.goBack()}
    />
);

const ProfileSettingsScreenWrapper = ({ navigation }: any) => (
    <ProfileSettingsScreen
        onNavigateBack={() => navigation.goBack()}
    />
);

const AboutUsScreenWrapper = ({ navigation }: any) => (
    <AboutUsScreen
        onNavigateBack={() => navigation.goBack()}
    />
);

const ContactUsScreenWrapper = ({ navigation }: any) => (
    <ContactUsScreen
        onNavigateBack={() => navigation.goBack()}
    />
);

const LoginScreenWrapper = ({ navigation }: any) => (
    <LoginScreen onNavigateToRegister={() => navigation.navigate('Register')} />
);

const RegisterScreenWrapper = ({ navigation }: any) => (
    <RegisterScreen onNavigateToLogin={() => navigation.navigate('Login')} />
);

// Bottom Tab Navigator
const MainTabNavigator: React.FC = () => {
    const { theme } = useTheme();
    const { authState } = useAuth();

    // Determine which dashboard to show based on user role
    const DashboardScreenWrapper = (props: any) => {
        if (authState.user?.role === 'admin') {
            return <AdminDashboardWrapper {...props} />;
        }
        if (authState.user?.role === 'instructor') {
            return <InstructorDashboardWrapper {...props} />;
        }
        return <StudentDashboardWrapper {...props} />;
    };

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Explore') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: theme.colors.card,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerStyle: {
                    backgroundColor: theme.colors.background,
                },
                headerTintColor: theme.colors.text,
                headerTitleStyle: {
                    fontWeight: '700',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreenWrapper}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreenWrapper}
                options={{ title: 'Dashboard' }}
            />
            <Tab.Screen
                name="Explore"
                component={CoursesScreenWrapper}
                options={{ title: 'Explore' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreenWrapper}
                options={{ title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export const AppNavigator: React.FC = () => {
    const { authState } = useAuth();
    const { theme } = useTheme();
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // Show splash screen while auth is loading or during initial splash
    if (showSplash || authState.isLoading) {
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

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
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.colors.background,
                    },
                    headerTintColor: theme.colors.text,
                    headerTitleStyle: {
                        fontWeight: '700',
                    },
                }}
            >
                {!authState.isAuthenticated ? (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreenWrapper}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Register"
                            component={RegisterScreenWrapper}
                            options={{ headerShown: false }}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="MainTabs"
                            component={MainTabNavigator}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="CourseDetail"
                            component={CourseDetailScreenWrapper}
                            options={{ title: 'Course Details' }}
                        />
                        <Stack.Screen
                            name="Quiz"
                            component={QuizScreenWrapper}
                            options={{ title: 'Quiz' }}
                        />
                        <Stack.Screen
                            name="CreateCourse"
                            component={CreateCourseScreenWrapper}
                            options={{ title: 'Create Course' }}
                        />
                        <Stack.Screen
                            name="ContentModeration"
                            component={ContentModerationScreenWrapper}
                            options={{ title: 'Content Moderation' }}
                        />
                        <Stack.Screen
                            name="AITutorChat"
                            component={AITutorChatScreenWrapper}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ProfileSettings"
                            component={ProfileSettingsScreenWrapper}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="AboutUs"
                            component={AboutUsScreenWrapper}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="ContactUs"
                            component={ContactUsScreenWrapper}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};