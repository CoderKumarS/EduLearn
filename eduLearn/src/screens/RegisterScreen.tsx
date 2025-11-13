import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { RootStackParamList } from '../navigation/AppNavigator';

interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'student' | 'instructor';
}

interface RegisterFormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface RegisterScreenProps {
    navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
    const { register, clearError, isLoading, error } = useAuth();
    const { theme } = useTheme();

    const [formData, setFormData] = useState<RegisterFormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
    });

    const [errors, setErrors] = useState<RegisterFormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: RegisterFormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof RegisterFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (errors[field as keyof RegisterFormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }

        // Clear auth error when user starts typing
        if (error) {
            clearError();
        }
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            await register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });
            // Navigate to MainTabs after successful registration
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            console.warn('Registration failed:', error);
        }
    };

    const handleNavigateToLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    <ThemedView style={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
                                <ThemedText style={styles.logoText}>edu</ThemedText>
                            </View>
                            <ThemedText style={styles.title}>Create Account</ThemedText>
                            <ThemedText variant="secondary" style={styles.subtitle}>
                                Join eduLearn and start your learning journey
                            </ThemedText>
                        </View>

                        {/* Register Form */}
                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChangeText={(value) => handleInputChange('username', value)}
                                    autoCapitalize="none"
                                    autoCorrect={Boolean(false)}
                                />
                                {errors.username && (
                                    <ThemedText style={[styles.inputError, { color: theme.colors.error }]}>
                                        {errors.username}
                                    </ThemedText>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChangeText={(value) => handleInputChange('email', value)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={Boolean(false)}
                                />
                                {errors.email && (
                                    <ThemedText style={[styles.inputError, { color: theme.colors.error }]}>
                                        {errors.email}
                                    </ThemedText>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChangeText={(value) => handleInputChange('password', value)}
                                    isPassword={Boolean(true)}
                                    autoCapitalize="none"
                                />
                                {errors.password && (
                                    <ThemedText style={[styles.inputError, { color: theme.colors.error }]}>
                                        {errors.password}
                                    </ThemedText>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <Input
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                    isPassword={Boolean(true)}
                                    autoCapitalize="none"
                                />
                                {errors.confirmPassword && (
                                    <ThemedText style={[styles.inputError, { color: theme.colors.error }]}>
                                        {errors.confirmPassword}
                                    </ThemedText>
                                )}
                            </View>

                            {/* Role Selection */}
                            <View style={styles.roleContainer}>
                                <ThemedText style={styles.roleLabel}>I am a:</ThemedText>
                                <View style={styles.roleButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.roleButton,
                                            {
                                                backgroundColor: formData.role === 'student'
                                                    ? theme.colors.primary
                                                    : theme.colors.surface,
                                                borderColor: theme.colors.border,
                                            }
                                        ]}
                                        onPress={() => handleInputChange('role', 'student')}
                                    >
                                        <ThemedText style={[
                                            styles.roleButtonText,
                                            { color: formData.role === 'student' ? '#FFFFFF' : theme.colors.text }
                                        ]}>
                                            Student
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.roleButton,
                                            {
                                                backgroundColor: formData.role === 'instructor'
                                                    ? theme.colors.primary
                                                    : theme.colors.surface,
                                                borderColor: theme.colors.border,
                                            }
                                        ]}
                                        onPress={() => handleInputChange('role', 'instructor')}
                                    >
                                        <ThemedText style={[
                                            styles.roleButtonText,
                                            { color: formData.role === 'instructor' ? '#FFFFFF' : theme.colors.text }
                                        ]}>
                                            Instructor
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Auth Error */}
                            {error && (
                                <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                                    {error}
                                </ThemedText>
                            )}

                            <Button
                                title="Create Account"
                                onPress={handleRegister}
                                loading={Boolean(isLoading)}
                                style={styles.registerButton}
                            />
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <ThemedText variant="secondary" style={styles.footerText}>
                                Already have an account?{' '}
                                <TouchableOpacity onPress={handleNavigateToLogin}>
                                    <ThemedText style={[styles.linkText, { color: theme.colors.primary }]}>
                                        Sign In
                                    </ThemedText>
                                </TouchableOpacity>
                            </ThemedText>
                        </View>
                    </ThemedView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingVertical: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputError: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    roleContainer: {
        marginBottom: 16,
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    roleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    roleButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    registerButton: {
        marginTop: 8,
    },
    footer: {
        alignItems: 'center',
        paddingTop: 24,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontWeight: '600',
    },
});

export default RegisterScreen;
