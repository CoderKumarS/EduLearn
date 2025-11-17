import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Auth screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Course screens
import CoursesScreen from '../screens/course/CoursesScreen';
import { CourseDetailScreen } from '../screens/course/CourseDetailScreen';
import { ChapterDetailScreen } from '../screens/course/ChapterDetailScreen';
import { TopicDetailScreen } from '../screens/course/TopicDetailScreen';

// Quiz screens
import { QuizScreen } from '../screens/quiz/QuizScreen';
import { QuizListScreen } from '../screens/quiz/QuizListScreen';
import { QuizResultScreen } from '../screens/quiz/QuizResultScreen';

// Instructor screens
import { CreateCourseScreen } from '../screens/instructor/CreateCourseScreen';
import { InstructorCoursesScreen } from '../screens/instructor/InstructorCoursesScreen';
import { ManageCourseScreen } from '../screens/instructor/ManageCourseScreen';
import { ManageTopicsScreen } from '../screens/instructor/ManageTopicsScreen';
import { ManageQuizScreen } from '../screens/instructor/ManageQuizScreen';
import { InstructorDashboard } from '../screens/instructor/InstructorDashboard';
import { InstructorHomeScreen } from '../screens/instructor/InstructorHomeScreen';

// Student screens
import { NewHomeScreen } from '../screens/student/NewHomeScreen';
import { StudentDashboardNew } from '../screens/student/StudentDashboardNew';

// Common screens
import ProfileScreen from '../screens/common/ProfileScreen';
import { ProfileSettingsScreen } from '../screens/common/ProfileSettingsScreen';
import { AboutUsScreen } from '../screens/common/AboutUsScreen';
import { ContactUsScreen } from '../screens/common/ContactUsScreen';

// Other screens (not moved yet)
import HomeScreen from '../screens/HomeScreen';
import { AITutorChatScreen } from '../screens/AITutorChatScreen';
import { ContentModerationScreen } from '../screens/ContentModerationScreen';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export type RootStackParamList = {
    Splash: undefined;
    Login: undefined;
    Register: undefined;
    MainTabs: undefined;
    CreateCourse: undefined;
    CourseDetail: { courseId: number };
    CourseList: { filter?: string; category?: string; categoryName?: string };
    ChapterDetail: { chapterId: number; courseId?: number };
    TopicDetail: { topicId: number; chapterId: number };
    Quiz: { quizId: number; courseId: number };
    QuizList: { chapterId: number };
    QuizResult: { attemptId: number };
    AITutorChat: { courseId?: number; topicId?: string };
    ProfileSettings: undefined;
    ContentModeration: undefined;
    AboutUs: undefined;
    ContactUs: undefined;
    InstructorDashboard: undefined;
    AdminDashboard: undefined;
    ManageTopics: { chapterId: number };
    ManageQuiz: { chapterId: number; courseId: number };
    InstructorCourses: undefined;
    ManageCourse: { courseId: number };
};

export type TabParamList = {
    Home: undefined;
    Courses: undefined;
    AITutor: undefined;
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
            onCourseCreated={(courseId) => {
                navigation.replace('ManageCourse', { courseId });
            }}
        />
    );
};

const InstructorCoursesScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <InstructorCoursesScreen
            onNavigateToManageCourse={(courseId) => navigation.navigate('ManageCourse', { courseId })}
            onNavigateToCreateCourse={() => navigation.navigate('CreateCourse')}
        />
    );
};

const ManageCourseScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ManageCourse'>>();

    return (
        <ManageCourseScreen
            courseId={route.params.courseId}
            onNavigateBack={() => navigation.goBack()}
            onNavigateToManageTopics={(chapterId) => navigation.navigate('ManageTopics', { chapterId })}
            onNavigateToManageQuiz={(chapterId, courseId) => navigation.navigate('ManageQuiz', { chapterId, courseId })}
        />
    );
};

const ManageTopicsScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ManageTopics'>>();

    return (
        <ManageTopicsScreen
            chapterId={route.params.chapterId}
            onNavigateBack={() => navigation.goBack()}
        />
    );
};

const ManageQuizScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ManageQuiz'>>();

    return (
        <ManageQuizScreen
            chapterId={route.params.chapterId}
            courseId={route.params.courseId}
            onNavigateBack={() => navigation.goBack()}
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
            onNavigateToLogin={() => navigation.navigate('Login')}
            onNavigateToManageCourse={(courseId) => navigation.navigate('ManageCourse', { courseId })}
            onNavigateToChapter={(chapterId) => navigation.navigate('ChapterDetail', { chapterId })}
        />
    );
};

const ChapterDetailScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'ChapterDetail'>>();

    return (
        <ChapterDetailScreen
            chapterId={route.params.chapterId}
            onNavigateBack={() => navigation.goBack()}
            onNavigateToTopic={(topicId: number) =>
                navigation.navigate('TopicDetail', { topicId, chapterId: route.params.chapterId })
            }
            onNavigateToQuiz={(quizId: number) =>
                navigation.navigate('Quiz', { quizId, courseId: 0 })
            }
        />
    );
};

const TopicDetailScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'TopicDetail'>>();

    return (
        <TopicDetailScreen
            topicId={route.params.topicId}
            chapterId={route.params.chapterId}
            onNavigateBack={() => navigation.goBack()}
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

const QuizListScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'QuizList'>>();

    return (
        <QuizListScreen
            chapterId={route.params.chapterId}
            onNavigateBack={() => navigation.goBack()}
            onNavigateToQuiz={(quizId) => navigation.navigate('Quiz', { quizId, courseId: 0 })}
        />
    );
};

const QuizResultScreenWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'QuizResult'>>();

    return (
        <QuizResultScreen
            attemptId={route.params.attemptId}
            onNavigateBack={() => navigation.goBack()}
            onRetakeQuiz={() => navigation.goBack()}
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

const InstructorDashboardWrapper: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <InstructorDashboard
            onNavigateBack={() => navigation.goBack()}
            onNavigateToCourse={(courseId: number) => navigation.navigate('CourseDetail', { courseId })}
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
        return <InstructorHomeScreen />;
    } else {
        return <StudentDashboardNew />;
    }
};

// Role-based Home Component
const HomeScreenSelector: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role || 'student';

    if (role === 'student') {
        return <NewHomeScreen />;
    }
    return <HomeScreen />;
};

// Custom AI Tutor Button Component
const AITutorButton: React.FC<{ onPress: () => void; theme: any }> = ({ onPress, theme }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={tabBarStyles.aiTutorButtonContainer}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primary + 'DD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={tabBarStyles.aiTutorButton}
            >
                <Ionicons name="chatbubbles" size={28} color="#FFFFFF" />
            </LinearGradient>
        </TouchableOpacity>
    );
};

// Tab Navigator Component
const MainTabs: React.FC = () => {
    const { theme } = useTheme();
    const navigation = useNavigation<any>();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: Boolean(false),
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarStyle: {
                    height: 70,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    backgroundColor: theme.colors.card,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: 2,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreenSelector}
                options={{
                    title: 'Home',
                    headerShown: Boolean(false),
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={tabBarStyles.iconContainer}>
                            <Ionicons
                                name={focused ? "home" : "home-outline"}
                                size={24}
                                color={color}
                            />
                        </View>
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
                        <View style={tabBarStyles.iconContainer}>
                            <Ionicons
                                name={focused ? "book" : "book-outline"}
                                size={24}
                                color={color}
                            />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="AITutor"
                component={View}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('AITutorChat', {});
                    },
                }}
                options={{
                    title: '',
                    headerShown: Boolean(false),
                    tabBarIcon: () => (
                        <AITutorButton
                            onPress={() => navigation.navigate('AITutorChat', {})}
                            theme={theme}
                        />
                    ),
                    tabBarLabel: () => null,
                }}
            />
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreenSelector}
                options={{
                    title: 'Dashboard',
                    headerShown: Boolean(false),
                    tabBarIcon: ({ color, size, focused }) => (
                        <View style={tabBarStyles.iconContainer}>
                            <Ionicons
                                name={focused ? "grid" : "grid-outline"}
                                size={24}
                                color={color}
                            />
                        </View>
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
                        <View style={tabBarStyles.iconContainer}>
                            <Ionicons
                                name={focused ? "person" : "person-outline"}
                                size={24}
                                color={color}
                            />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

// Tab Bar Styles
const tabBarStyles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
    },
    aiTutorButtonContainer: {
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiTutorButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
});

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
                        headerShown: false,
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
                    name="CourseList"
                    component={CoursesScreen}
                    options={{
                        title: 'Courses',
                        headerShown: Boolean(true),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="ChapterDetail"
                    component={ChapterDetailScreenWrapper}
                    options={{
                        title: 'Chapter Details',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="TopicDetail"
                    component={TopicDetailScreenWrapper}
                    options={{
                        title: 'Topic',
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
                    name="QuizList"
                    component={QuizListScreenWrapper}
                    options={{
                        title: 'Quizzes',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="QuizResult"
                    component={QuizResultScreenWrapper}
                    options={{
                        title: 'Quiz Results',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="AITutorChat"
                    component={AITutorChatScreenWrapper}
                    options={{
                        title: 'AI Tutor',
                        headerShown: Boolean(false),
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
                <Stack.Screen
                    name="InstructorCourses"
                    component={InstructorCoursesScreenWrapper}
                    options={{
                        title: 'My Courses',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="ManageCourse"
                    component={ManageCourseScreenWrapper}
                    options={{
                        title: 'Manage Course',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="ManageTopics"
                    component={ManageTopicsScreenWrapper}
                    options={{
                        title: 'Manage Topics',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
                <Stack.Screen
                    name="ManageQuiz"
                    component={ManageQuizScreenWrapper}
                    options={{
                        title: 'Manage Quiz',
                        headerShown: Boolean(false),
                        gestureEnabled: Boolean(true),
                        animation: 'slide_from_right',
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
