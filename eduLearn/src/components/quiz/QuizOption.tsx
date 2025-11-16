import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface QuizOptionProps {
    label: 'A' | 'B' | 'C' | 'D';
    text: string;
    isSelected: boolean;
    onSelect: () => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
    label,
    text,
    isSelected,
    onSelect,
}) => {
    const { theme } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: isSelected
                        ? theme.colors.primary + '10'
                        : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderRadius: theme.borderRadius.md,
                },
            ]}
            onPress={onSelect}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ checked: Boolean(isSelected) }}
            accessibilityLabel={`Option ${label}: ${text}`}
        >
            <View
                style={[
                    styles.radioButton,
                    {
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                    },
                ]}
            >
                <Text
                    style={[
                        styles.label,
                        theme.typography.body,
                        {
                            color: isSelected ? '#FFFFFF' : theme.colors.text,
                        },
                    ]}
                >
                    {label}
                </Text>
            </View>

            <Text
                style={[
                    styles.text,
                    theme.typography.body,
                    {
                        color: theme.colors.text,
                    },
                ]}
            >
                {text}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 2,
        marginBottom: 12,
    },
    radioButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    label: {
        fontWeight: '700',
    },
    text: {
        flex: 1,
        lineHeight: 22,
    },
});
