import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedText } from '../common/ThemedText';
import { CourseWithEnrollment } from '../../types/course';

interface InstructorCourseCardProps {
    course: CourseWithEnrollment;
    onPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const InstructorCourseCard: React.FC<InstructorCourseCardProps> = ({
    course,
    onPress,
    onEdit,
    onDelete,
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[styles.container, { backgroundColor: theme.colors.card }]}
        >
            {/* Course Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Ionicons name="book" size={24} color={theme.colors.primary} />
                    </View>
                    <View style={styles.headerInfo}>
                        <ThemedText style={styles.title} numberOfLines={2}>
                            {course.title}
                        </ThemedText>
                        <View style={styles.statusRow}>
                            <View style={[
                                styles.statusBadge,
                                { backgroundColor: course.is_published ? '#10B981' : '#F59E0B' }
                            ]}>
                                <ThemedText style={styles.statusText}>
                                    {course.is_published ? 'Published' : 'Draft'}
                                </ThemedText>
                            </View>
                            {course.is_free && (
                                <View style={[styles.statusBadge, { backgroundColor: theme.colors.primary }]}>
                                    <ThemedText style={styles.statusText}>Free</ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            {/* Course Description */}
            <ThemedText variant="secondary" style={styles.description} numberOfLines={2}>
                {course.description}
            </ThemedText>

            {/* Course Stats */}
            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Ionicons name="people-outline" size={16} color={theme.colors.textSecondary} />
                    <ThemedText variant="secondary" style={styles.statText}>
                        {course.enrollment_count} students
                    </ThemedText>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="book-outline" size={16} color={theme.colors.textSecondary} />
                    <ThemedText variant="secondary" style={styles.statText}>
                        {course.chapters?.length || 0} chapters
                    </ThemedText>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="star-outline" size={16} color={theme.colors.textSecondary} />
                    <ThemedText variant="secondary" style={styles.statText}>
                        {course.average_rating.toFixed(1)} rating
                    </ThemedText>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={onEdit}
                >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" />
                    <ThemedText style={styles.actionButtonText}>Manage</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButtonSecondary, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primary }]}
                    onPress={onPress}
                >
                    <Ionicons name="eye-outline" size={18} color={theme.colors.primary} />
                    <ThemedText style={[styles.actionButtonSecondaryText, { color: theme.colors.primary }]}>View</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.error }]}
                    onPress={onDelete}
                >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        flex: 1,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 6,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 6,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    stats: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
        flex: 2,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtonSecondary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 6,
        flex: 1,
    },
    actionButtonSecondaryText: {
        fontSize: 14,
        fontWeight: '600',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 44,
    },
});
