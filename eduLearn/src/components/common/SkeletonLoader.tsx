import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonLoaderProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 4,
    style,
}) => {
    const { theme } = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.colors.border,
                    opacity,
                },
                style,
            ]}
        />
    );
};

export const CourseCardSkeleton: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.courseCardSkeleton,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <SkeletonLoader width="100%" height={140} borderRadius={0} />
            <View style={styles.courseCardContent}>
                <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="60%" height={14} style={{ marginBottom: 12 }} />
                <View style={styles.courseCardFooter}>
                    <SkeletonLoader width={60} height={14} />
                    <SkeletonLoader width={80} height={14} />
                </View>
            </View>
        </View>
    );
};

export const CategoryCardSkeleton: React.FC = () => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.categoryCardSkeleton,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <SkeletonLoader width={56} height={56} borderRadius={28} style={{ marginBottom: 12 }} />
            <SkeletonLoader width="70%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLoader width={80} height={24} borderRadius={12} />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {},
    courseCardSkeleton: {
        width: 250,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        marginRight: 16,
    },
    courseCardContent: {
        padding: 12,
    },
    courseCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    categoryCardSkeleton: {
        width: '48%',
        height: 140,
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        marginBottom: 16,
    },
});
