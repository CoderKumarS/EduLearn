import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
    courseCount: number;
}

interface CategoryCardProps {
    category: Category;
    onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
    category,
    onPress,
}) => {
    const { theme } = useTheme();

    // Map icon names to Ionicons
    const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
        const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
            code: 'code-slash',
            design: 'color-palette',
            business: 'briefcase',
            marketing: 'megaphone',
            music: 'musical-notes',
            photography: 'camera',
            health: 'fitness',
            language: 'language',
            science: 'flask',
            math: 'calculator',
            art: 'brush',
            cooking: 'restaurant',
            folder: 'folder',
        };
        return iconMap[iconName] || 'folder';
    };

    // Create gradient colors from the category color
    const getGradientColors = (color: string): [string, string] => {
        // Lighten the color for the gradient
        return [color, `${color}CC`];
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={getGradientColors(category.color)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={getIconName(category.icon)}
                        size={32}
                        color="#FFFFFF"
                    />
                </View>
                <View style={styles.overlay}>
                    <Text style={styles.categoryName} numberOfLines={2}>
                        {category.name}
                    </Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {category.courseCount} {category.courseCount === 1 ? 'course' : 'courses'}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: 140,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
