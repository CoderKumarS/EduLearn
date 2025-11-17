import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ThemedView, ThemedText, Button, Input } from '../../components';
import { Ionicons } from '@expo/vector-icons';
import { profileService } from '../../services/profileService';
import { handleApiError } from '../../utils/errorHandler';
import { getFullImageUrl } from '../../utils/imageUtils';

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
    const { user } = useAuth();

    // Extract first and last name from user.name or username
    const getFirstName = () => {
        if (user?.name) {
            return user.name.split(' ')[0] || '';
        }
        return user?.username?.split(' ')[0] || '';
    };

    const getLastName = () => {
        if (user?.name) {
            const parts = user.name.split(' ');
            return parts.slice(1).join(' ') || '';
        }
        return user?.username?.split(' ')[1] || '';
    };

    const [formData, setFormData] = useState<ProfileFormData>({
        email: user?.email || '',
        firstName: getFirstName(),
        lastName: getLastName(),
    });

    const [errors, setErrors] = useState<ProfileFormErrors>({});
    const [loading, setLoading] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const profileImageUrl = getFullImageUrl(user?.profile_image);

    const getInitials = () => {
        if (user?.name) {
            return user.name.charAt(0).toUpperCase();
        }
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'U';
    };

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
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            // Only send fields that have changed
            const updateData: any = {};
            const newUsername = `${formData.firstName} ${formData.lastName}`;

            if (formData.email !== user.email) {
                updateData.email = formData.email;
            }

            if (newUsername !== user.username) {
                updateData.first_name = formData.firstName;
                updateData.last_name = formData.lastName;
            }

            // If nothing changed, don't make API call
            if (Object.keys(updateData).length === 0) {
                Alert.alert('Info', 'No changes to save');
                setLoading(false);
                return;
            }

            await profileService.updateUserProfile(Number(user.id), updateData);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePhoto = () => {
        Alert.alert(
            'Change Photo',
            'Photo upload feature coming soon! Backend API endpoint is not yet implemented.',
            [
                { text: 'OK', style: 'cancel' },
            ]
        );
        // TODO: Implement when backend endpoint is ready
        // const takePhoto = async () => {
        //     // Use expo-image-picker to take photo
        // };
        // const chooseFromLibrary = async () => {
        //     // Use expo-image-picker to choose from library
        // };
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
                    onPress: async () => {
                        try {
                            if (!user?.id) {
                                throw new Error('User not authenticated');
                            }
                            await profileService.deleteAccount(user.id.toString(), '');
                            Alert.alert('Success', 'Account deleted successfully');
                            // TODO: Navigate to login screen
                        } catch (error) {
                            const apiError = handleApiError(error);
                            Alert.alert('Error', apiError.message || 'Failed to delete account');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Header Section */}
                <View style={styles.profileHeader}>
                    <View style={styles.photoContainer}>
                        {profileImageUrl && !imageError ? (
                            <View style={styles.profilePhotoContainer}>
                                <Image
                                    source={{ uri: profileImageUrl }}
                                    style={styles.profilePhoto}
                                    onLoadStart={() => setImageLoading(true)}
                                    onLoadEnd={() => setImageLoading(false)}
                                    onError={(error) => {
                                        console.log('Profile image load error:', error.nativeEvent);
                                        setImageLoading(false);
                                        setImageError(true);
                                    }}
                                />
                                {imageLoading && (
                                    <View style={styles.imageLoadingContainer}>
                                        <ActivityIndicator size="large" color={theme.colors.primary} />
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={[styles.profilePhotoPlaceholder, { backgroundColor: theme.colors.primary }]}>
                                <ThemedText style={styles.initialsText}>
                                    {getInitials()}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                    <ThemedText style={styles.userName}>
                        {user?.name || user?.username || 'User'}
                    </ThemedText>
                    <ThemedText variant="secondary" style={styles.userEmail}>
                        {user?.email || 'No email'}
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.changePhotoLink}
                        onPress={handleChangePhoto}
                        accessibilityRole="button"
                        accessibilityLabel="Change profile photo"
                    >
                        <ThemedText style={[styles.changePhotoText, { color: theme.colors.primary }]}>
                            Change Photo
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Primary Email</ThemedText>
                        <Input
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && (
                            <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                                {errors.email}
                            </ThemedText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>First Name</ThemedText>
                        <Input
                            value={formData.firstName}
                            onChangeText={(value) => handleInputChange('firstName', value)}
                            placeholder="Enter your first name"
                        />
                        {errors.firstName && (
                            <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                                {errors.firstName}
                            </ThemedText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                        <Input
                            value={formData.lastName}
                            onChangeText={(value) => handleInputChange('lastName', value)}
                            placeholder="Enter your last name"
                        />
                        {errors.lastName && (
                            <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                                {errors.lastName}
                            </ThemedText>
                        )}
                    </View>

                    <Button
                        title={loading ? 'Saving...' : 'Save Changes'}
                        onPress={handleSaveProfile}
                        disabled={loading}
                        style={styles.saveButton}
                    />
                </View>

                {/* Notification Preferences Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Notification Preferences</ThemedText>

                    <View style={styles.settingRow}>
                        <ThemedText style={styles.settingLabel}>Email Notifications</ThemedText>
                        <Switch
                            value={emailNotifications}
                            onValueChange={setEmailNotifications}
                            trackColor={{ false: '#E5E7EB', true: theme.colors.primary + '80' }}
                            thumbColor="#FFFFFF"
                            ios_backgroundColor="#E5E7EB"
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <ThemedText style={styles.settingLabel}>Push Notifications</ThemedText>
                        <Switch
                            value={pushNotifications}
                            onValueChange={setPushNotifications}
                            trackColor={{ false: '#E5E7EB', true: theme.colors.primary + '80' }}
                            thumbColor="#FFFFFF"
                            ios_backgroundColor="#E5E7EB"
                        />
                    </View>
                </View>

                {/* Security Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Security</ThemedText>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={handleChangePassword}
                        accessibilityRole="button"
                        accessibilityLabel="Change password"
                    >
                        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.primary} />
                        <ThemedText style={[styles.linkButtonText, { color: theme.colors.primary }]}>
                            Change Password
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Danger Zone Section */}
                <View style={styles.section}>
                    <View style={[styles.dangerZone, { backgroundColor: '#FEE2E2' }]}>
                        <ThemedText style={[styles.dangerZoneTitle, { color: '#DC2626' }]}>
                            Danger Zone
                        </ThemedText>
                        <ThemedText style={[styles.dangerZoneText, { color: '#991B1B' }]}>
                            Deleting your account is a permanent action and cannot be undone.
                        </ThemedText>
                        <TouchableOpacity
                            style={[styles.deleteButton, { backgroundColor: '#EF4444' }]}
                            onPress={handleDeleteAccount}
                            accessibilityRole="button"
                            accessibilityLabel="Delete account"
                        >
                            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                            <ThemedText style={styles.deleteButtonText}>
                                Delete Account
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
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
    scrollView: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    photoContainer: {
        marginBottom: 16,
    },
    profilePhotoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
    },
    profilePhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    imageLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    profilePhotoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        marginBottom: 12,
    },
    changePhotoLink: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 8,
    },
    inputText: {
        fontSize: 15,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    linkButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    dangerZone: {
        padding: 20,
        borderRadius: 12,
    },
    dangerZoneTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    dangerZoneText: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 16,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    saveButton: {
        marginTop: 8,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    bottomSpacer: {
        height: 32,
    },
});
