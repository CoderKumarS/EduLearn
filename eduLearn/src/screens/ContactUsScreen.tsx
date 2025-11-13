import React, { useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button, Input } from '../components';
import { Ionicons } from '@expo/vector-icons';
import { contactService } from '../services/contactService';
import { ContactForm } from '../types/contact';
import { handleApiError } from '../utils/errorHandler';

interface ContactUsScreenProps {
    onNavigateBack?: () => void;
}

interface ContactFormData {
    fullName: string;
    email: string;
    subject: string;
    message: string;
}

interface ContactFormErrors {
    fullName?: string;
    email?: string;
    subject?: string;
    message?: string;
}

export const ContactUsScreen: React.FC<ContactUsScreenProps> = ({
    onNavigateBack,
}) => {
    const { theme } = useTheme();

    const [formData, setFormData] = useState<ContactFormData>({
        fullName: '',
        email: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState<ContactFormErrors>({});
    const [loading, setLoading] = useState(false);

    const handleInputChange = (field: keyof ContactFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ContactFormErrors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!contactService.validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const contactFormData: ContactForm = {
                fullName: formData.fullName,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                category: 'general',
                priority: 'medium',
            };

            await contactService.submitContactForm(contactFormData);

            Alert.alert(
                'Message Sent!',
                'Thank you for contacting us. We\'ll get back to you soon.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setFormData({
                                fullName: '',
                                email: '',
                                subject: '',
                                message: '',
                            });
                        },
                    },
                ]
            );
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailPress = () => {
        Linking.openURL('mailto:support@ailearnhub.com');
    };

    const handlePhonePress = () => {
        Linking.openURL('tel:+1234567890');
    };

    const handleSocialPress = (platform: string) => {
        const urls: { [key: string]: string } = {
            twitter: 'https://twitter.com/ailearnhub',
            linkedin: 'https://linkedin.com/company/ailearnhub',
            instagram: 'https://instagram.com/ailearnhub',
            facebook: 'https://facebook.com/ailearnhub',
        };

        const url = urls[platform];
        if (url) {
            Linking.openURL(url);
        }
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
                <ThemedText style={styles.headerTitle}>Contact Us</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                        <Ionicons name="mail" size={40} color="#FFFFFF" />
                    </View>
                    <ThemedText style={styles.heroTitle}>Get in Touch</ThemedText>
                    <ThemedText variant="secondary" style={styles.heroSubtitle}>
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </ThemedText>
                </View>

                {/* Contact Form Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Send us a Message</ThemedText>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Full Name</ThemedText>
                        <Input
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChangeText={(value) => handleInputChange('fullName', value)}
                            autoCapitalize="words"
                        />
                        {errors.fullName && (
                            <ThemedText style={styles.errorText}>{errors.fullName}</ThemedText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Email Address</ThemedText>
                        <Input
                            placeholder="Enter your email"
                            value={formData.email}
                            onChangeText={(value) => handleInputChange('email', value)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && (
                            <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Subject</ThemedText>
                        <Input
                            placeholder="What is this about?"
                            value={formData.subject}
                            onChangeText={(value) => handleInputChange('subject', value)}
                            autoCapitalize="sentences"
                        />
                        {errors.subject && (
                            <ThemedText style={styles.errorText}>{errors.subject}</ThemedText>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <ThemedText style={styles.inputLabel}>Message</ThemedText>
                        <Input
                            placeholder="Tell us more..."
                            value={formData.message}
                            onChangeText={(value) => handleInputChange('message', value)}
                            multiline
                            numberOfLines={6}
                            style={styles.messageInput}
                        />
                        {errors.message && (
                            <ThemedText style={styles.errorText}>{errors.message}</ThemedText>
                        )}
                    </View>

                    <Button
                        title="Send Message"
                        onPress={handleSubmit}
                        loading={loading}
                        style={styles.submitButton}
                    />
                </View>

                {/* Direct Support Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Direct Support</ThemedText>

                    <TouchableOpacity
                        style={[styles.contactCard, { backgroundColor: theme.colors.card }]}
                        onPress={handleEmailPress}
                        accessibilityRole="button"
                        accessibilityLabel="Email support"
                    >
                        <View style={[styles.contactIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.contactInfo}>
                            <ThemedText style={styles.contactLabel}>Email</ThemedText>
                            <ThemedText variant="secondary" style={styles.contactValue}>
                                support@ailearnhub.com
                            </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactCard, { backgroundColor: theme.colors.card }]}
                        onPress={handlePhonePress}
                        accessibilityRole="button"
                        accessibilityLabel="Call support"
                    >
                        <View style={[styles.contactIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.contactInfo}>
                            <ThemedText style={styles.contactLabel}>Phone</ThemedText>
                            <ThemedText variant="secondary" style={styles.contactValue}>
                                +1 (234) 567-890
                            </ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={[styles.availabilityCard, { backgroundColor: theme.colors.surface }]}>
                        <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                        <ThemedText variant="secondary" style={styles.availabilityText}>
                            Support available Monday - Friday, 9:00 AM - 6:00 PM EST
                        </ThemedText>
                    </View>
                </View>

                {/* Social Media Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Follow Us</ThemedText>
                    <ThemedText variant="secondary" style={styles.socialSubtitle}>
                        Stay connected with us on social media
                    </ThemedText>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: theme.colors.card }]}
                            onPress={() => handleSocialPress('twitter')}
                            accessibilityRole="button"
                            accessibilityLabel="Follow us on Twitter"
                        >
                            <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: theme.colors.card }]}
                            onPress={() => handleSocialPress('linkedin')}
                            accessibilityRole="button"
                            accessibilityLabel="Follow us on LinkedIn"
                        >
                            <Ionicons name="logo-linkedin" size={28} color="#0A66C2" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: theme.colors.card }]}
                            onPress={() => handleSocialPress('instagram')}
                            accessibilityRole="button"
                            accessibilityLabel="Follow us on Instagram"
                        >
                            <Ionicons name="logo-instagram" size={28} color="#E4405F" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: theme.colors.card }]}
                            onPress={() => handleSocialPress('facebook')}
                            accessibilityRole="button"
                            accessibilityLabel="Follow us on Facebook"
                        >
                            <Ionicons name="logo-facebook" size={28} color="#1877F2" />
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
    heroSection: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
    },
    messageInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    submitButton: {
        marginTop: 8,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    contactValue: {
        fontSize: 14,
    },
    availabilityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    availabilityText: {
        fontSize: 14,
        marginLeft: 12,
        flex: 1,
        lineHeight: 20,
    },
    socialSubtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    socialButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    bottomSpacer: {
        height: 32,
    },
});
