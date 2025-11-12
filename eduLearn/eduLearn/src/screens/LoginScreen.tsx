import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { login, isLoading } = useAuth();

    const handleSignIn = async () => {
        try {
            await login(email, password);
            // Navigation will be handled by the auth state change
        } catch (error) {
            console.error('Login error:', error);
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
                            <Input
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                keyboardType="email-address"
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
                                disabled={Boolean(!email || !password)}
                                loading={Boolean(isLoading)}
                                style={styles.button}
                            />
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
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
    },
});

export default LoginScreen;
