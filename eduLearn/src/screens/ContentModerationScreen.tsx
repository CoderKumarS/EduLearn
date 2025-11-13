import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedText } from '../components';
import { adminService } from '../services/adminService';
import { handleApiError } from '../utils/errorHandler';

interface ContentModerationScreenProps {
    onNavigateBack?: () => void;
}

interface ContentItem {
    id: string;
    type: 'course' | 'comment' | 'review' | 'message';
    title: string;
    content: string;
    author: {
        id: string;
        username: string;
        avatar?: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export const ContentModerationScreen: React.FC<ContentModerationScreenProps> = ({ onNavigateBack }) => {
    const { theme } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [contentItems, setContentItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContentItems();
    }, []);

    const loadContentItems = async () => {
        try {
            setLoading(true);
            const response = await adminService.getContentForModeration('pending');
            setContentItems(response || []);
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Error loading content items:', apiError);
            // Use mock data as fallback
            setContentItems([
                {
                    id: '1',
                    type: 'course',
                    title: 'Introduction to Machine Learning',
                    content: 'Course content here',
                    author: {
                        id: '1',
                        username: 'John Doe',
                    },
                    createdAt: new Date('2024-01-15').toISOString(),
                    status: 'pending',
                },
                {
                    id: '2',
                    type: 'comment',
                    title: 'Best practices for React Native development',
                    content: 'Comment content here',
                    author: {
                        id: '2',
                        username: 'Jane Smith',
                    },
                    createdAt: new Date('2024-01-14').toISOString(),
                    status: 'pending',
                },
                {
                    id: '3',
                    type: 'comment',
                    title: 'Comment on "Advanced Python Programming"',
                    content: 'Comment content here',
                    author: {
                        id: '3',
                        username: 'Bob Johnson',
                    },
                    createdAt: new Date('2024-01-13').toISOString(),
                    status: 'approved',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadContentItems();
        setRefreshing(false);
    };

    const handleApprove = async (itemId: string) => {
        try {
            await adminService.moderateContent(itemId, 'approve');
            Alert.alert('Success', 'Content approved successfully');
            // Update local state
            setContentItems(prev =>
                prev.map(item =>
                    item.id === itemId ? { ...item, status: 'approved' as const } : item
                )
            );
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message || 'Failed to approve content');
        }
    };

    const handleReject = async (itemId: string) => {
        try {
            await adminService.moderateContent(itemId, 'reject');
            Alert.alert('Success', 'Content rejected successfully');
            // Update local state
            setContentItems(prev =>
                prev.map(item =>
                    item.id === itemId ? { ...item, status: 'rejected' as const } : item
                )
            );
        } catch (error) {
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message || 'Failed to reject content');
        }
    };

    const getContentIcon = (type: string) => {
        switch (type) {
            case 'course':
                return 'book-outline';
            case 'review':
                return 'star-outline';
            case 'comment':
                return 'chatbox-outline';
            case 'message':
                return 'chatbubbles-outline';
            default:
                return 'document-outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return theme.colors.warning;
            case 'approved':
                return theme.colors.success;
            case 'rejected':
                return theme.colors.error;
            default:
                return theme.colors.textSecondary;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={[styles.header, { paddingHorizontal: theme.spacing.md }]}>
                    <View style={styles.headerLeft}>
                        {onNavigateBack && (
                            <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        )}
                        <ThemedText style={[theme.typography.h1, { color: theme.colors.text }]}>
                            Content Moderation
                        </ThemedText>
                    </View>
                </View>

                {/* Description */}
                <View style={[styles.section, { paddingHorizontal: theme.spacing.md }]}>
                    <ThemedText style={[theme.typography.body, { color: theme.colors.textSecondary }]}>
                        Review and manage submitted course materials, discussions, and comments.
                    </ThemedText>
                </View>

                {/* Content Items */}
                <View style={[styles.section, { paddingHorizontal: theme.spacing.md }]}>
                    {contentItems.map((item) => (
                        <View
                            key={item.id}
                            style={[
                                styles.contentCard,
                                {
                                    backgroundColor: theme.colors.card,
                                    borderRadius: theme.borderRadius.md,
                                    marginBottom: theme.spacing.md,
                                },
                            ]}
                        >
                            <View style={styles.contentHeader}>
                                <View style={styles.contentIconContainer}>
                                    <Ionicons
                                        name={getContentIcon(item.type) as any}
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                </View>
                                <View style={styles.contentInfo}>
                                    <ThemedText style={[theme.typography.body, { color: theme.colors.text, fontWeight: '600' }]}>
                                        {item.title}
                                    </ThemedText>
                                    <ThemedText style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                                        By {item.author.username} • {new Date(item.createdAt).toLocaleDateString()}
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={styles.contentFooter}>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        {
                                            backgroundColor: getStatusColor(item.status) + '20',
                                            borderRadius: theme.borderRadius.sm,
                                        },
                                    ]}
                                >
                                    <ThemedText
                                        style={[
                                            theme.typography.small,
                                            {
                                                color: getStatusColor(item.status),
                                                fontWeight: '600',
                                            },
                                        ]}
                                    >
                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                    </ThemedText>
                                </View>

                                {item.status === 'pending' && (
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                styles.rejectButton,
                                                {
                                                    backgroundColor: theme.colors.error + '20',
                                                    borderRadius: theme.borderRadius.sm,
                                                },
                                            ]}
                                            onPress={() => handleReject(item.id)}
                                        >
                                            <Ionicons name="close" size={16} color={theme.colors.error} />
                                            <ThemedText
                                                style={[
                                                    theme.typography.small,
                                                    { color: theme.colors.error, fontWeight: '600', marginLeft: 4 },
                                                ]}
                                            >
                                                Reject
                                            </ThemedText>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                styles.approveButton,
                                                {
                                                    backgroundColor: theme.colors.success,
                                                    borderRadius: theme.borderRadius.sm,
                                                },
                                            ]}
                                            onPress={() => handleApprove(item.id)}
                                        >
                                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                            <ThemedText
                                                style={[
                                                    theme.typography.small,
                                                    { color: '#FFFFFF', fontWeight: '600', marginLeft: 4 },
                                                ]}
                                            >
                                                Approve
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
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
    header: {
        paddingVertical: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
    },
    section: {
        marginTop: 16,
    },
    contentCard: {
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    contentHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    contentIconContainer: {
        marginRight: 12,
    },
    contentInfo: {
        flex: 1,
    },
    contentFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    rejectButton: {},
    approveButton: {},
});
