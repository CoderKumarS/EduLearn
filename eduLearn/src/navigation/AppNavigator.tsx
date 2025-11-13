import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SplashScreen from '../screens/SplashScreen';
import TestScreen from '../screens/TestScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { CreateCourseScreen } from '../screens/CreateCourseScreen';
import { CourseDetailScreen } from '../screens/CourseDetailScreen';
import { QuizScreen } from '../screens/QuizScreen';
import { AITutorChatScreen } from '../screens/AITutorChatScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { ContentModerationScreen } from '../screens/ContentModerationScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { ContactUsScreen } from '../screens/ContactUsScreen';
import { StudentDashboard } from '../screens/StudentDashboard';
import { InstructorDashboard } from '../screens/InstructorDashboard';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { ThemedText } from '../components/ThemedText';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
    Splash: undefined;
    Test: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    CreateCourse: undefined;
    CourseDetail: { courseId: string };
    Quiz: { quizId: string; courseId: string };
    AITutorChat: { courseId?: string; topicId?: string };
    ProfileSettings: undefined;
    ContentModeration: undefined;
    AboutUs: undefined;
    ContactUs: undefined;
    StudentDashboard: undefined;
    InstructorDashboard: undefined;
    AdminDashboard: undefined;
};

export type TabParamList = {
    Home: undefined;
    Courses: undefined;
    Dashboard: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Wrapper components for screens that need navigation props
const CreateCourseScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <CreateCourseScreen
            onNavigateBack={() => navigation.goBack()}
            onCourseCreated={() => {
                navigation.goBack();
            }}
        />
    );
};

const CourseDetailScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'CourseDetail'>>();

    return (
        <CourseDetailScreen
            courseId={route.params.courseId}
            onNavigateBack={() => navigation.goBack()}
            onNavigateToQuiz={(quizId) => {
                navigation.navigate('Quiz', { quizId, courseId: route.params.courseId });
            }}
        />
    );
};

const QuizScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'Quiz'>>();

    return (
        <QuizScreen
            quizId={route.params.quizId}
            onNavigateBack={() => navigation.goBack()}
        />
    );
};

const AITutorChatScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <AITutorChatScreen
            onNavigateBack={() => navigation.goBack()}
        />
    );
};

const ProfileSettingsScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <ProfileSettingsScreen
            onNavigateBack={() => navigation.goBack()}
        />
    );
};

const ContentModerationScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <ContentModerationScreen
            onNavigateBack={() => navigation.goBack()}
        />
    );
};

const AboutUsScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <AboutUsScreen
            onNavigateBack={() => navigation.goBack()}
        />
    );
};

const ContactUsScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <ContactUsScreen
            onNavigateBack={() => navigation.goBack()}
        />
    );
};

const StudentDashboardWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <StudentDashboard
            onNavigateBack={() => navigation.goBack()}
            onNavigateToCourse={(courseId: string) => navigation.navigate('CourseDetail', { courseId })}
        />
    );
};

const InstructorDashboardWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <InstructorDashboard
            onNavigateBack={() => navigation.goBack()}
            onNavigateToCourse={(courseId: string) => navigation.navigate('CourseDetail', { courseId })}
            onCreateCourse={() => navigation.navigate('CreateCourse')}
        />
    );
};

const AdminDashboardScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <AdminDashboardScreen
            onNavigateBack={() => navigation.goBack()}
            onNavigateToContentModeration={() => navigation.navigate('ContentModeration')}
        />
    );
};

// Role-based Dashboard Component
const DashboardScreenSelector: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role || 'student';

    if (role === 'admin') {
        return <AdminDashboardScreenWrapper />;
    } else if (role === 'instructor') {
        return <InstructorDashboardWrapper />;
    } else {
        return <StudentDashboardWrapper />;
    }
};

// Tab Navigator Component
const MainTabs: React.FC = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: Boolean(false), // Hide all tab headers
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Home',
                    headerShown: Boolean(false),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Courses"
                component={CoursesScreen}
                options={{
                    title: 'Courses',
                    headerShown: Boolean(false),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "book" : "book-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreenSelector}
                options={{
                    title: 'Dashboard',
                    headerShown: Boolean(false),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "grid" : "grid-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: 'Profile',
                    headerShown: Boolean(false),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"}
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const AppNavigator: React.FC = () => {
    const { theme } = useTheme();

    // HIGH RISK AREA: Wrap isDark with Boolean() before passing to NavigationContainer
    const navigationTheme = Boolean(theme.isDark) ? DarkTheme : DefaultTheme;

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                    gestureEnabled: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                    animation: 'default',
                }}
            >
                <Stack.Screen
                    name="Splash"
                    component={SplashScreen}
                    options={{
                        title: 'eduLearn',
                        headerShown: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        animation: 'fade',
                    }}
                />
                <Stack.Screen
                    name="Test"
                    component={TestScreen}
                    options={{
                        title: 'Test Screen',
                        headerLeft: () => null,
                        headerShown: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                    }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        title: 'Sign In',
                        headerShown: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{
                        title: 'Create Account',
                        headerShown: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(true), // HIGH RISK: Wrap boolean with Boolean()
                        animation: 'slide_from_bottom',
                    }}
                />
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{
                        headerShown: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                        gestureEnabled: Boolean(false), // HIGH RISK: Wrap boolean with Boolean()
                    }}
                />
                <Stack.Screen
                    name="CreateCourse"
                    component={CreateCourseScreenWrapper}
                    options={{
                        title: 'Create Course',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="CourseDetail"
                    component={CourseDetailScreenWrapper}
                    options={{
                        title: 'Course Details',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="Quiz"
                    component={QuizScreenWrapper}
                    options={{
                        title: 'Quiz',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(false),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="AITutorChat"
                    component={AITutorChatScreenWrapper}
                    options={{
                        title: 'AI Tutor',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="ProfileSettings"
                    component={ProfileSettingsScreenWrapper}
                    options={{
                        title: 'Settings',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="ContentModeration"
                    component={ContentModerationScreenWrapper}
                    options={{
                        title: 'Content Moderation',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="AboutUs"
                    component={AboutUsScreenWrapper}
                    options={{
                        title: 'About Us',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="ContactUs"
                    component={ContactUsScreenWrapper}
                    options={{
                        title: 'Contact Us',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="StudentDashboard"
                    component={StudentDashboardWrapper}
                    options={{
                        title: 'Student Dashboard',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="InstructorDashboard"
                    component={InstructorDashboardWrapper}
                    options={{
                        title: 'Instructor Dashboard',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="AdminDashboard"
                    component={AdminDashboardScreenWrapper}
                    options={{
                        title: 'Admin Dashboard',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
