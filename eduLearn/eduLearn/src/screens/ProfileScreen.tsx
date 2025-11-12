import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const ProfileScreen: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { theme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
    const [isEditing, setIsEditing] = useState<boolean>(Boolean(false));
    const [editedName, setEditedName] = useState<string>(user?.name || '');
    const [editedEmail, setEditedEmail] = useState<string>(user?.email || '');

    const handleEditToggle = () => {
        setIsEditing(Boolean(!isEditing));
        if (Boolean(isEditing)) {
            // Reset to original values if canceling
            setEditedName(user?.name || '');
            setEditedEmail(user?.email || '');
        }
    };

    const handleSave = () => {
        // In a real app, this would call an API to update user profile
        console.log('Saving profile:', { name: editedName, email: editedEmail });
        setIsEditing(Boolean(false));
    };

    if (!Boolean(isAuthenticated)) {
        return (
            <ThemedView variant="default" style={styles.container}>
                <ThemedText variant="secondary" size="lg" style={styles.emptyState}>
                    Please log in to view your profile
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView style={styles.scrollView}>
            <ThemedView variant="default" style={styles.container}>
                {/* Profile Header */}
                <ThemedView variant="surface" style={styles.profileHeader}>
                    <ThemedView style={styles.avatarContainer}>
                        <ThemedText style={styles.avatarText}>
                            {user?.name.charAt(0).toUpperCase()}
                        </ThemedText>
                    </ThemedView>
                    <ThemedText variant="default" size="xxl" weight="bold" style={styles.userName}>
                        {user?.name}
                    </ThemedText>
                    <ThemedText variant="secondary" size="md">
                        {user?.email}
                    </ThemedText>
                </ThemedView>

                {/* Profile Information */}
                <ThemedView variant="default" style={styles.section}>
                    <ThemedView style={styles.sectionHeader}>
                        <ThemedText variant="default" size="xl" weight="bold">
                            Profile Information
                        </ThemedText>
                        <TouchableOpacity onPress={handleEditToggle}>
                            <ThemedText variant="primary" size="md" weight="semibold">
                                {Boolean(isEditing) ? 'Cancel' : 'Edit'}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedView variant="surface" style={styles.infoCard}>
                        {Boolean(isEditing) ? (
                            <>
                                <ThemedView style={styles.inputGroup}>
                                    <ThemedText variant="secondary" size="sm" style={styles.inputLabel}>
                                        Name
                                    </ThemedText>
                                    <Input
                                        value={editedName}
                                        onChangeText={setEditedName}
                                        placeholder="Enter your name"
                                    />
                                </ThemedView>

                                <ThemedView style={styles.inputGroup}>
                                    <ThemedText variant="secondary" size="sm" style={styles.inputLabel}>
                                        Email
                                    </ThemedText>
                                    <Input
                                        value={editedEmail}
                                        onChangeText={setEditedEmail}
                                        placeholder="Enter your email"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </ThemedView>

                                <Button
                                    title="Save Changes"
                                    onPress={handleSave}
                                    disabled={Boolean(!editedName || !editedEmail)}
                                    style={styles.saveButton}
                                />
                            </>
                        ) : (
                            <>
                                <ThemedView style={styles.infoRow}>
                                    <ThemedText variant="secondary" size="sm">Name</ThemedText>
                                    <ThemedText variant="default" size="md" weight="semibold">
                                        {user?.name}
                                    </ThemedText>
                                </ThemedView>

                                <ThemedView style={styles.infoRow}>
                                    <ThemedText variant="secondary" size="sm">Email</ThemedText>
                                    <ThemedText variant="default" size="md" weight="semibold">
                                        {user?.email}
                                    </ThemedText>
                                </ThemedView>
                            </>
                        )}
                    </ThemedView>
                </ThemedView>

                {/* Theme Settings */}
                <ThemedView variant="default" style={styles.section}>
                    <ThemedText variant="default" size="xl" weight="bold" style={styles.sectionTitle}>
                        Theme Settings
                    </ThemedText>

                    <ThemedView variant="surface" style={styles.themeCard}>
                        <ThemedText variant="secondary" size="sm" style={styles.themeLabel}>
                            Current Theme: {theme.mode} {Boolean(theme.isDark) ? '(Dark)' : '(Light)'}
                        </ThemedText>

                        <ThemedView style={styles.themeButtons}>
                            <TouchableOpacity
                                style={[styles.themeButton, { backgroundColor: theme.colors.primary }]}
                                onPress={setLightTheme}
                            >
                                <ThemedText size="md" weight="semibold" style={styles.themeButtonText}>
                                    ☀️ Light
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.themeButton, { backgroundColor: theme.colors.primary }]}
                                onPress={setDarkTheme}
                            >
                                <ThemedText size="md" weight="semibold" style={styles.themeButtonText}>
                                    🌙 Dark
                                </ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.themeButton, { backgroundColor: theme.colors.primary }]}
                                onPress={setSystemTheme}
                            >
                                <ThemedText size="md" weight="semibold" style={styles.themeButtonText}>
                                    📱 System
                                </ThemedText>
                            </TouchableOpacity>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>

                {/* Logout Button */}
                <ThemedView variant="default" style={styles.section}>
                    <Button
                        title="Logout"
                        onPress={logout}
                        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
                    />
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    profileHeader: {
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        marginBottom: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    infoCard: {
        padding: 20,
        borderRadius: 12,
    },
    infoRow: {
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        marginBottom: 8,
    },
    saveButton: {
        marginTop: 8,
    },
    themeCard: {
        padding: 20,
        borderRadius: 12,
    },
    themeLabel: {
        marginBottom: 16,
    },
    themeButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    themeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    themeButtonText: {
        color: '#FFFFFF',
    },
    logoutButton: {
        marginTop: 8,
    },
    emptyState: {
        textAlign: 'center',
        marginTop: 40,
    },
});

export default ProfileScreen;
