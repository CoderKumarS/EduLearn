import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity, View, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { testBackendConnection } from '../../utils/testConnection';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { login, isLoading, error } = useAuth();
    const { theme } = useTheme();
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Test backend connection when screen loads
        testBackendConnection();

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleSignIn = async () => {
        try {
            await login(username, password);
            // Navigate to MainTabs after successful login
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            console.error('Login error:', error);
            // Error is now displayed from context
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                    {/* Header with Logo */}
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="school-outline" size={40} color="#FFFFFF" />
                        </View>
                        <ThemedText style={styles.title}>Welcome Back!</ThemedText>
                        <ThemedText variant="secondary" style={styles.subtitle}>
                            Sign in to continue your learning journey
                        </ThemedText>
                    </View>

                    {/* Login Form */}
                    <View style={styles.formContainer}>
                        {error && (
                            <View style={[styles.errorContainer, { backgroundColor: theme.colors.error + '15' }]}>
                                <Ionicons name="alert-circle-outline" size={20} color={theme.colors.error} />
                                <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                                    {error}
                                </ThemedText>
                            </View>
                        )}

                        <View style={styles.inputWrapper}>
                            <View style={[styles.inputIcon, { backgroundColor: theme.colors.surface }]}>
                                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                            </View>
                            <Input
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Username"
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputWrapper}>
                            <View style={[styles.inputIcon, { backgroundColor: theme.colors.surface }]}>
                                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
                            </View>
                            <Input
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                isPassword={Boolean(true)}
                                autoCapitalize="none"
                                style={styles.input}
                            />
                        </View>

                        <Button
                            title="Sign In"
                            onPress={handleSignIn}
                            disabled={Boolean(!username || !password)}
                            loading={Boolean(isLoading)}
                            style={styles.button}
                        />

                        {/* Demo Credentials Info */}
                        <View style={[styles.demoInfo, { backgroundColor: theme.colors.surface }]}>
                            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
                            <View style={styles.demoTextContainer}>
                                <ThemedText variant="secondary" style={styles.demoText}>
                                    Demo: john_doe / password123
                                </ThemedText>
                                <ThemedText variant="secondary" style={styles.demoText}>
                                    or alice_johnson / password123
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ThemedText variant="secondary" style={styles.footerText}>
                            Don't have an account?{' '}
                        </ThemedText>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <ThemedText style={[styles.linkText, { color: theme.colors.primary }]}>
                                Create Account
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: {
        fontSize: 14,
        flex: 1,
    },
    inputWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    inputIcon: {
        position: 'absolute',
        left: 12,
        top: 12,
        zIndex: 1,
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        paddingLeft: 60,
    },
    button: {
        marginTop: 8,
        height: 52,
    },
    demoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginTop: 20,
        gap: 8,
    },
    demoTextContainer: {
        flex: 1,
    },
    demoText: {
        fontSize: 12,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 14,
    },
    linkText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default LoginScreen;
