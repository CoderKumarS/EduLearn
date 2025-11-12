console.log('64. AppNavigator - Starting imports');
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';
console.log('65. AppNavigator - React Navigation imported');
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
console.log('66. AppNavigator - Contexts imported');
import { SplashScreen } from '../screens/SplashScreen';
import { TestScreen } from '../screens/TestScreen';
import { RegisterScreen } from '../screens';
import { LoginScreen } from '../screens';
import { ContactUsScreen } from '../screens/ContactUsScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { AITutorChatScreen } from '../screens/AITutorChatScreen';
import { ContentModerationScreen } from '../screens';
import { AdminDashboardScreen } from '../screens';
import { InstructorDashboard } from '../screens';
import { StudentDashboard } from '../screens';
import { CreateCourseScreen } from '../screens';
import { QuizScreen } from '../screens';
import { CourseDetailScreen } from '../screens';
import { ProfileScreen } from '../screens';
import { CoursesScreen } from '../screens';
import { HomeScreen } from '../screens';
// COMMENTED OUT FOR TESTING - Uncomment one by one to find the issue
// import { LoginScreen } from '../screens/LoginScreen';
// import { RegisterScreen } from '../screens/RegisterScreen';
// import { HomeScreen } from '../screens/HomeScreen';
// import { CoursesScreen } from '../screens/CoursesScreen';
// import { CourseDetailScreen } from '../screens/CourseDetailScreen';
// import { StudentDashboard } from '../screens/StudentDashboard';
// import { InstructorDashboard } from '../screens/InstructorDashboard';
// import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
// import { QuizScreen } from '../screens/QuizScreen';
// import { ProfileScreen } from '../screens/ProfileScreen';
// import { CreateCourseScreen } from '../screens/CreateCourseScreen';
// import { ContentModerationScreen } from '../screens/ContentModerationScreen';
// import { AITutorChatScreen } from '../screens/AITutorChatScreen';
// import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
// import { AboutUsScreen } from '../screens/AboutUsScreen';
// import { ContactUsScreen } from '../screens/ContactUsScreen';

export type RootStackParamList = {
    Splash: undefined;
    Test: undefined;
    // COMMENTED OUT FOR TESTING
    // Login: undefined;
    // Register: undefined;
    // MainTabs: undefined;
    // CourseDetail: { courseId: string };
    // Quiz: { quizId: string };
    // CreateCourse: undefined;
    // ContentModeration: undefined;
    // AITutorChat: undefined;
    // ProfileSettings: undefined;
    // AboutUs: undefined;
    // ContactUs: undefined;
};

// export type TabParamList = {
//     Home: undefined;
//     Dashboard: undefined;
//     Explore: undefined;
//     Profile: undefined;
// };

const Stack = createNativeStackNavigator<RootStackParamList>();
// const Tab = createBottomTabNavigator<TabParamList>();

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
    console.log('165. MainTabNavigator - Component rendering');
    const { theme } = useTheme();
    console.log('166. MainTabNavigator - useTheme called');
    const { authState } = useAuth();
    console.log('167. MainTabNavigator - useAuth called, user role:', authState.user?.role);

    // Determine which dashboard to show based on user role
    const DashboardScreenWrapper = (props: any) => {
        console.log('168. DashboardScreenWrapper - Rendering for role:', authState.user?.role);
        if (authState.user?.role === 'admin') {
            return <AdminDashboardWrapper {...props} />;
        }
        if (authState.user?.role === 'instructor') {
            return <InstructorDashboardWrapper {...props} />;
        }
        return <StudentDashboardWrapper {...props} />;
    };

    console.log('169. MainTabNavigator - About to return Tab.Navigator');
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    // Explicitly convert focused to boolean to avoid casting errors
                    const isFocused = Boolean(focused);
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = isFocused ? 'home' : 'home-outline';
                    } else if (route.name === 'Dashboard') {
                        iconName = isFocused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Explore') {
                        iconName = isFocused ? 'search' : 'search-outline';
                    } else if (route.name === 'Profile') {
                        iconName = isFocused ? 'person' : 'person-outline';
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

console.log('250. MainTabNavigator - Component defined');

export const AppNavigator: React.FC = () => {
    console.log('67. AppNavigator - Component rendering');
    const { authState } = useAuth();
    console.log('68. AppNavigator - useAuth called');
    const { theme } = useTheme();
    console.log('69. AppNavigator - useTheme called');
    const [showSplash, setShowSplash] = useState(true);
    console.log('70. AppNavigator - useState initialized');

    const handleSplashFinish = () => {
        console.log('71. AppNavigator - handleSplashFinish called');
        setShowSplash(false);
    };

    // Show splash screen while auth is loading or during initial splash
    if (showSplash || authState.isLoading) {
        console.log('72. AppNavigator - Showing splash screen');
        return <SplashScreen onFinish={handleSplashFinish} />;
    }

    console.log('73. AppNavigator - About to render NavigationContainer');
    console.log('73a. AppNavigator - theme.isDark value:', theme.isDark, 'type:', typeof theme.isDark);
    console.log('73b. AppNavigator - Boolean(theme.isDark):', Boolean(theme.isDark), 'type:', typeof Boolean(theme.isDark));
    console.log('73c. AppNavigator - authState.isAuthenticated:', authState.isAuthenticated, 'type:', typeof authState.isAuthenticated);

    return (
        <NavigationContainer
            onStateChange={(state) => {
                console.log('74. NavigationContainer - State changed');
                console.log('74a. NavigationContainer - New state:', JSON.stringify(state));
            }}
            onReady={() => {
                console.log('75. NavigationContainer - Ready');
                console.log('75a. NavigationContainer - Ready completed successfully');
            }}
            theme={{
                dark: Boolean(theme.isDark),
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
                {(() => {
                    console.log('310. Stack.Navigator - About to render screens');
                    console.log('310a. Stack.Navigator - isAuthenticated:', authState.isAuthenticated);
                    return !authState.isAuthenticated ? (
                        <>
                            {console.log('311. Stack.Navigator - Rendering Login/Register screens')}
                            <Stack.Screen
                                name="Login"
                                component={LoginScreenWrapper}
                                options={{ headerShown: Boolean(false) }}
                            />
                            <Stack.Screen
                                name="Register"
                                component={RegisterScreenWrapper}
                                options={{ headerShown: Boolean(false) }}
                            />
                        </>
                    ) : (
                        <>
                            {console.log('312. Stack.Navigator - Rendering authenticated screens')}
                            <Stack.Screen
                                name="MainTabs"
                                component={MainTabNavigator}
                                options={{ headerShown: Boolean(false) }}
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
                                options={{ headerShown: Boolean(false) }}
                            />
                            <Stack.Screen
                                name="ProfileSettings"
                                component={ProfileSettingsScreenWrapper}
                                options={{ headerShown: Boolean(false) }}
                            />
                            <Stack.Screen
                                name="AboutUs"
                                component={AboutUsScreenWrapper}
                                options={{ headerShown: Boolean(false) }}
                            />
                            <Stack.Screen
                                name="ContactUs"
                                component={ContactUsScreenWrapper}
                                options={{ headerShown: Boolean(false) }}
                            />
                        </>
                    );
                })()}
            </Stack.Navigator>
        </NavigationContainer>
    );
};