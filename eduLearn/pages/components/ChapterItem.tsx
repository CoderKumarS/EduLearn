import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ChapterItemProps {
    chapterNumber: number;
    title: string;
    contentType: 'video' | 'reading' | 'quiz';
    duration: string;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    children?: React.ReactNode;
}

export const ChapterItem: React.FC<ChapterItemProps> = ({
    chapterNumber,
    title,
    contentType,
    duration,
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

    const getContentIcon = () => {
        switch (contentType) {
            case 'video':
                return 'play-circle-outline';
            case 'reading':
                return 'book-outline';
            case 'quiz':
                return 'help-circle-outline';
            default:
                return 'document-outline';
        }
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
                accessibilityState={{ expanded: isExpanded }}
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
                            <Ionicons
                                name={getContentIcon()}
                                size={14}
                                color={theme.colors.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.meta,
                                    theme.typography.small,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                            </Text>
                            <Ionicons
                                name="time-outline"
                                size={14}
                                color={theme.colors.textSecondary}
                                style={styles.durationIcon}
                            />
                            <Text
                                style={[
                                    styles.meta,
                                    theme.typography.small,
                                    { color: theme.colors.textSecondary },
                                ]}
                            >
                                {duration}
                            </Text>
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

            {children && (
                <Animated.View
                    style={[
                        styles.expandedContent,
                        {
                            borderTopColor: theme.colors.divider,
                            paddingTop: theme.spacing.md,
                            maxHeight: animatedHeight.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1000],
                            }),
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
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chapterNumber: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    chapterNumberText: {
        fontWeight: '700',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontWeight: '600',
        marginBottom: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
        padding: 4,
        marginRight: 8,
    },
    expandedContent: {
        borderTopWidth: 1,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
});
