import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CategoryCard } from '../common/CategoryCard';
import { SectionHeader } from '../common/SectionHeader';
import { CategoryCardSkeleton } from '../common/SkeletonLoader';
import { ErrorMessage } from '../common/ErrorMessage';

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
    courseCount: number;
}

interface CourseCategoriesSectionProps {
    categories: Category[];
    isLoading?: boolean;
    error?: string;
    onRetry?: () => void;
}

export const CourseCategoriesSection: React.FC<CourseCategoriesSectionProps> = ({
    categories,
    isLoading,
    error,
    onRetry,
}) => {
    const navigation = useNavigation<any>();

    const handleCategoryPress = (category: Category) => {
        // Navigate to Courses tab instead of pushing a new screen
        navigation.navigate('Courses');
    };

    if (error) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Browse by Category"
                    icon="grid-outline"
                />
                <ErrorMessage
                    message={error}
                    onRetry={onRetry}
                    compact
                />
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <SectionHeader
                    title="Browse by Category"
                    icon="grid-outline"
                />
                <View style={styles.gridContainer}>
                    <FlatList
                        data={[1, 2, 3, 4]}
                        numColumns={2}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        keyExtractor={(item) => `category-skeleton-${item}`}
                        renderItem={() => <CategoryCardSkeleton />}
                    />
                </View>
            </View>
        );
    }

    if (!isLoading && categories.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <SectionHeader
                title="Browse by Category"
                icon="grid-outline"
            />
            <View style={styles.gridContainer}>
                <FlatList
                    data={categories}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <CategoryCard
                            category={item}
                            onPress={() => handleCategoryPress(item)}
                        />
                    )}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    gridContainer: {
        paddingHorizontal: 16,
    },
    listContent: {
        paddingBottom: 8,
    },
    row: {
        justifyContent: 'space-between',
    },
});
