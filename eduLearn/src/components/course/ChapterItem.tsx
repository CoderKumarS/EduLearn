import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ChapterItemProps {
    chapterNumber: number;
    title: string;
    videoUrl?: string;
    duration: number;
    hasQuiz?: boolean;
    topicCount?: number;
    quizCount?: number;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    children?: React.ReactNode;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
    chapterNumber,
    title,
    videoUrl,
    duration,
    hasQuiz,
    topicCount,
    quizCount,
    isExpanded,
    onToggle,
    onEdit,
    onDelete,
    children,
}) => {
    const { theme } = useTheme();
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const animatedOpacity = useRef(new Animated.Value(0)).current;
    const animatedRotation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue: isExpanded ? 1 : 0,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(animatedOpacity, {
                toValue: isExpanded ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(animatedRotation, {
                toValue: isExpanded ? 1 : 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isExpanded]);

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const chevronRotation = animatedRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.header}
                onPress={onToggle}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Chapter ${chapterNumber}: ${title}`}
                accessibilityState={{ expanded: Boolean(isExpanded) }}
            >
                <View style={styles.headerLeft}>
                    <View
                        style={[
                            styles.chapterNumber,
                            {
                                backgroundColor: theme.colors.primary + '20',
                                borderRadius: theme.borderRadius.sm,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.chapterNumberText,
                                theme.typography.caption,
                                { color: theme.colors.primary },
                            ]}
                        >
                            {chapterNumber}
                        </Text>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text
                            style={[
                                styles.title,
                                theme.typography.body,
                                { color: theme.colors.text },
                            ]}
                            numberOfLines={2}
                        >
                            {title}
                        </Text>
                        <View style={styles.metaContainer}>
                            {topicCount !== undefined && topicCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
                                    <Ionicons
                                        name="book-outline"
                                        size={14}
                                        color={theme.colors.primary}
                                    />
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            { color: theme.colors.primary },
                                        ]}
                                    >
                                        {topicCount} {topicCount === 1 ? 'Topic' : 'Topics'}
                                    </Text>
                                </View>
                            )}
                            {quizCount !== undefined && quizCount > 0 && (
                                <View style={[styles.badge, { backgroundColor: theme.colors.success + '15' }]}>
                                    <Ionicons
                                        name="help-circle-outline"
                                        size={14}
                                        color={theme.colors.success}
                                    />
                                    <Text
                                        style={[
                                            styles.badgeText,
                                            { color: theme.colors.success },
                                        ]}
                                    >
                                        {quizCount} {quizCount === 1 ? 'Quiz' : 'Quizzes'}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.badge, { backgroundColor: theme.colors.textSecondary + '10' }]}>
                                <Ionicons
                                    name="time-outline"
                                    size={14}
                                    color={theme.colors.textSecondary}
                                />
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: theme.colors.textSecondary },
                                    ]}
                                >
                                    {formatDuration(duration)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    {onEdit && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            style={styles.actionButton}
                            accessibilityRole="button"
                            accessibilityLabel="Edit chapter"
                        >
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color={theme.colors.textSecondary}
                            />
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            style={styles.actionButton}
                            accessibilityRole="button"
                            accessibilityLabel="Delete chapter"
                        >
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color={theme.colors.error}
                            />
                        </TouchableOpacity>
                    )}
                    <Animated.View
                        style={{
                            transform: [{ rotate: chevronRotation }],
                        }}
                    >
                        <Ionicons
                            name="chevron-down"
                            size={20}
                            color={theme.colors.textSecondary}
                        />
                    </Animated.View>
                </View>
            </TouchableOpacity>

            {isExpanded && children && (
                <Animated.View
                    style={[
                        styles.expandedContent,
                        {
                            borderTopColor: theme.colors.divider,
                            paddingTop: theme.spacing.md,
                            opacity: animatedOpacity,
                        },
                    ]}
                >
                    {children}
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chapterNumber: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    chapterNumberText: {
        fontWeight: '700',
        fontSize: 16,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 8,
        lineHeight: 22,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    meta: {
        marginLeft: 4,
    },
    durationIcon: {
        marginLeft: 12,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    actionButton: {
        padding: 6,
        marginRight: 8,
        borderRadius: 6,
    },
    expandedContent: {
        borderTopWidth: 1,
        paddingHorizontal: 18,
        paddingBottom: 18,
    },
});
