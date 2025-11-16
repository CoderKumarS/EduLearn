import React, { useState, memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CourseCardProps {
    id: string;
    title: string;
    category: string;
    instructor: string;
    rating: number;
    imageUrl: string;
    onPress: () => void;
}

const CourseCardComponent: React.FC<CourseCardProps> = ({
    title,
    category,
    instructor,
    rating,
    imageUrl,
    onPress,
}) => {
    const { theme } = useTheme();
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    const handleImageLoadStart = () => {
        setImageLoading(true);
        setImageError(false);
    };

    const handleImageLoadEnd = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
        setImageError(true);
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderRadius: theme.borderRadius.lg,
                    shadowColor: theme.colors.shadow,
                },
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${title} course by ${instructor}`}
        >
            <View style={styles.imageContainer}>
                {Boolean(!imageError) ? (
                    <>
                        <Image
                            source={{ uri: imageUrl }}
                            style={[
                                styles.image,
                                {
                                    borderTopLeftRadius: theme.borderRadius.lg,
                                    borderTopRightRadius: theme.borderRadius.lg,
                                },
                            ]}
                            resizeMode="cover"
                            onLoadStart={handleImageLoadStart}
                            onLoadEnd={handleImageLoadEnd}
                            onError={handleImageError}
                        />
                        {Boolean(imageLoading) && (
                            <View
                                style={[
                                    styles.loadingContainer,
                                    {
                                        backgroundColor: theme.colors.surface,
                                        borderTopLeftRadius: theme.borderRadius.lg,
                                        borderTopRightRadius: theme.borderRadius.lg,
                                    },
                                ]}
                            >
                                <ActivityIndicator size="large" color={theme.colors.primary} />
                            </View>
                        )}
                    </>
                ) : (
                    <View
                        style={[
                            styles.errorContainer,
                            {
                                backgroundColor: theme.colors.surface,
                                borderTopLeftRadius: theme.borderRadius.lg,
                                borderTopRightRadius: theme.borderRadius.lg,
                            },
                        ]}
                    >
                        <Ionicons
                            name="image-outline"
                            size={48}
                            color={theme.colors.textTertiary}
                        />
                        <Text
                            style={[
                                styles.errorText,
                                theme.typography.caption,
                                { color: theme.colors.textSecondary },
                            ]}
                        >
                            Image unavailable
                        </Text>
                    </View>
                )}
                <View
                    style={[
                        styles.categoryBadge,
                        {
                            backgroundColor: theme.colors.accent,
                            borderRadius: theme.borderRadius.sm,
                        },
                    ]}
                >
                    <Text style={[styles.categoryText, theme.typography.small]}>
                        {category}
                    </Text>
                </View>
            </View>

            <View style={[styles.content, { padding: theme.spacing.md }]}>
                <Text
                    style={[
                        styles.title,
                        theme.typography.h3,
                        { color: theme.colors.text },
                    ]}
                    numberOfLines={2}
                >
                    {title}
                </Text>

                <View style={styles.footer}>
                    <View style={styles.instructorContainer}>
                        <Ionicons
                            name="person-outline"
                            size={14}
                            color={theme.colors.textSecondary}
                        />
                        <Text
                            style={[
                                styles.instructor,
                                theme.typography.caption,
                                { color: theme.colors.textSecondary },
                            ]}
                            numberOfLines={1}
                        >
                            {instructor}
                        </Text>
                    </View>

                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={theme.colors.warning} />
                        <Text
                            style={[
                                styles.rating,
                                theme.typography.caption,
                                { color: theme.colors.text },
                            ]}
                        >
                            {rating.toFixed(1)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 16 / 9,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 8,
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    categoryText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    title: {
        marginBottom: 8,
        minHeight: 48,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    instructorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    instructor: {
        marginLeft: 4,
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        marginLeft: 4,
        fontWeight: '600',
    },
});

// Memoized export for performance optimization
export const CourseCard = memo(CourseCardComponent);
