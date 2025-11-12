import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';

interface TestScreenProps { }

const TestScreen: React.FC<TestScreenProps> = () => {
    const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
    const { isAuthenticated, isLoading, user, login, logout, error } = useAuth();

    return (
        <ThemedView variant="default" style={styles.container}>
            <ThemedText variant="default" size="xl" weight="bold" style={styles.text}>
                Test Screen
            </ThemedText>
            <ThemedText variant="secondary" size="md">
                Navigation is working!
            </ThemedText>
            <ThemedText variant="secondary" size="md" style={{ marginTop: theme.spacing.md }}>
                Current theme: {theme.mode} {theme.isDark ? '(Dark)' : '(Light)'}
            </ThemedText>

            <ThemedText variant="secondary" size="md" style={{ marginTop: theme.spacing.md }}>
                Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </ThemedText>
            {user && (
                <ThemedText variant="secondary" size="md">
                    User: {user.name} ({user.email})
                </ThemedText>
            )}
            {error && (
                <ThemedText variant="error" size="md">
                    Error: {error}
                </ThemedText>
            )}

            <ThemedView variant="default" style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={setLightTheme}
                >
                    <ThemedText variant="default" size="md" weight="semibold" style={styles.buttonText}>
                        Light Theme
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={setDarkTheme}
                >
                    <ThemedText variant="default" size="md" weight="semibold" style={styles.buttonText}>
                        Dark Theme
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.colors.primary }]}
                    onPress={setSystemTheme}
                >
                    <ThemedText variant="default" size="md" weight="semibold" style={styles.buttonText}>
                        System Theme
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <ThemedView variant="default" style={[styles.buttonContainer, { marginTop: 24 }]}>
                {!isAuthenticated ? (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        onPress={() => login('test@example.com', 'password123')}
                        disabled={Boolean(isLoading)}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <ThemedText variant="default" size="md" weight="semibold" style={styles.buttonText}>
                                Login
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.error }]}
                        onPress={logout}
                    >
                        <ThemedText variant="default" size="md" weight="semibold" style={styles.buttonText}>
                            Logout
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 32,
        gap: 12,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TestScreen;
