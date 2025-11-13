import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { testBackendConnection } from '../utils/testConnection';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { login, isLoading, error } = useAuth();
    const { theme } = useTheme();

    useEffect(() => {
        // Test backend connection when screen loads
        testBackendConnection();
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
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.content}>
                        <ThemedText
                            variant="default"
                            size="xxl"
                            weight="bold"
                            style={styles.title}
                        >
                            Welcome to eduLearn
                        </ThemedText>
                        <ThemedText
                            variant="secondary"
                            size="md"
                            weight="regular"
                            style={styles.subtitle}
                        >
                            Sign in to continue your learning journey
                        </ThemedText>

                        <ThemedView style={styles.formContainer}>
                            {error && (
                                <ThemedView style={styles.errorContainer}>
                                    <ThemedText
                                        variant="error"
                                        size="sm"
                                        style={styles.errorText}
                                    >
                                        {error}
                                    </ThemedText>
                                </ThemedView>
                            )}
                            <Input
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Username"
                                autoCapitalize="none"
                                style={styles.input}
                            />
                            <Input
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                isPassword={Boolean(true)}
                                autoCapitalize="none"
                                style={styles.input}
                            />
                            <Button
                                title="Sign In"
                                onPress={handleSignIn}
                                disabled={Boolean(!username || !password)}
                                loading={Boolean(isLoading)}
                                style={styles.button}
                            />

                            <ThemedView style={styles.footer}>
                                <ThemedText variant="secondary" size="sm" style={styles.footerText}>
                                    Don't have an account?{' '}
                                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                        <ThemedText
                                            size="sm"
                                            weight="semibold"
                                            style={[styles.linkText, { color: theme.colors.primary }]}
                                        >
                                            Create Account
                                        </ThemedText>
                                    </TouchableOpacity>
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
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
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    title: {
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 32,
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        color: '#DC2626',
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        textAlign: 'center',
    },
    linkText: {
        marginTop: 2,
    },
});

export default LoginScreen;
