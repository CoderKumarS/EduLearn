import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ThemedView, ThemedText, Button, Input } from '../components';
import { Ionicons } from '@expo/vector-icons';

interface ProfileSettingsScreenProps {
    onNavigateBack?: () => void;
}

interface ProfileFormData {
    email: string;
    firstName: string;
    lastName: string;
}

interface ProfileFormErrors {
    email?: string;
    firstName?: string;
    lastName?: string;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
    onNavigateBack,
}) => {
    const { theme } = useTheme();
    const { authState } = useAuth();

    const [formData, setFormData] = useState<ProfileFormData>({
        email: authState.user?.email || '',
        firstName: authState.user?.username?.split(' ')[0] || '',
        lastName: authState.user?.username?.split(' ')[1] || '',
    });

    const [errors, setErrors] = useState<ProfileFormErrors>({});
    const [loading, setLoading] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ProfileFormErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProfile = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            // TODO: Implement API call to save profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePhoto = () => {
        Alert.alert(
            'Change Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: () => console.log('Take photo') },
                { text: 'Choose from Library', onPress: () => console.log('Choose from library') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleChangePassword = () => {
        Alert.alert('Change Password', 'Password change functionality');
        // TODO: Implement password change modal/screen
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Implement account deletion
                        console.log('Delete account');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                {onNavigateBack && (
                    <TouchableOpacity
                        onPress={onNavigateBack}
                        style={styles.backButton}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                )}
                <ThemedText style={styles.headerTitle}>Profile Settings</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Header Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.photoContainer}>
                        <View style={[styles.profilePhotoPlaceholder, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="person" size={48} color="#FFFFFF" />
                        </View>
                        <TouchableOpacity
                            style={[styles.changePhotoButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleChangePhoto}
                            accessibilityRole="button"
                            accessibilityLabel="Change profile photo"
                        >
                            <Ionicons name="camera" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.userName}>
                        {authState.user?.username || 'User'}
                    </ThemedText>
                    <ThemedText variant="secondary" style={styles.userEmail}>
                        {authState.user?.email || 'user@example.com'}
                    </ThemedText>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>

                    <Input
                        label="Primary Email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="First Name"
                        placeholder="Enter your first name"
                        value={formData.firstName}
                        onChangeText={(value) => handleInputChange('firstName', value)}
                        error={errors.firstName}
                        autoCapitalize="words"
                    />

                    <Input
                        label="Last Name"
                        placeholder="Enter your last name"
                        value={formData.lastName}
                        onChangeText={(value) => handleInputChange('lastName', value)}
                        error={errors.lastName}
                        autoCapitalize="words"
                    />

                    <Button
                        title="Save Changes"
                        onPress={handleSaveProfile}
                        loading={loading}
                        style={styles.saveButton}
                    />
                </View>

                {/* Notification Preferences Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Notification Preferences</ThemedText>

                    <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
                        <View style={styles.settingInfo}>
                            <ThemedText style={styles.settingLabel}>Email Notifications</ThemedText>
                            <ThemedText variant="secondary" style={styles.settingDescription}>
                                Receive updates via email
                            </ThemedText>
                        </View>
                        <Switch
                            value={emailNotifications}
                            onValueChange={setEmailNotifications}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                            thumbColor={emailNotifications ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    </View>

                    <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
                        <View style={styles.settingInfo}>
                            <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
                            <ThemedText variant="secondary" style={styles.settingDescription}>
                                Receive push notifications
                            </ThemedText>
                        </View>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary + '80' }}
                            thumbColor={pushNotifications ? theme.colors.primary : theme.colors.textSecondary}
                        />
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Security</ThemedText>

                    <TouchableOpacity
                        style={[styles.linkButton, { borderBottomColor: theme.colors.border }]}
                        onPress={handleChangePassword}
                        accessibilityRole="button"
                        accessibilityLabel="Change password"
                    >
                        <View style={styles.linkButtonContent}>
                            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.text} />
                            <ThemedText style={styles.linkButtonText}>Change Password</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Danger Zone Section */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: theme.colors.error }]}>
                        Danger Zone
                    </ThemedText>

                    <TouchableOpacity
                        style={[styles.dangerButton, { borderColor: theme.colors.error }]}
                        onPress={handleDeleteAccount}
                        accessibilityRole="button"
                        accessibilityLabel="Delete account"
                    >
                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                        <ThemedText style={[styles.dangerButtonText, { color: theme.colors.error }]}>
                            Delete Account
                        </ThemedText>
                    </TouchableOpacity>
                    <ThemedText variant="secondary" style={styles.dangerWarning}>
                        Once you delete your account, there is no going back. Please be certain.
                    </ThemedText>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    placeholder: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    profilePhotoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 16,
    },
    saveButton: {
        marginTop: 8,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    linkButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    linkButtonText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 2,
        borderRadius: 8,
        marginBottom: 12,
    },
    dangerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    dangerWarning: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    bottomSpacer: {
        height: 32,
    },
});
