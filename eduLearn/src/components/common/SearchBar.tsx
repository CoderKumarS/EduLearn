import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    onFocus?: () => void;
    onClear?: () => void;
    debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search courses...',
    onSearch,
    onFocus,
    onClear,
    debounceMs = 300,
}) => {
    const { theme } = useTheme();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Debounce search
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            if (query.trim()) {
                onSearch(query.trim());
            }
        }, debounceMs);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query, debounceMs, onSearch]);

    const handleFocus = () => {
        setIsFocused(true);
        Animated.spring(scaleAnim, {
            toValue: 1.02,
            useNativeDriver: true,
        }).start();
        onFocus?.();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const handleClear = () => {
        setQuery('');
        onClear?.();
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: isFocused
                        ? theme.colors.primary
                        : theme.colors.border,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <Ionicons
                name="search"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.searchIcon}
            />
            <TextInput
                style={[
                    styles.input,
                    { color: theme.colors.text },
                ]}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                value={query}
                onChangeText={setQuery}
                onFocus={handleFocus}
                onBlur={handleBlur}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
            />
            {query.length > 0 && (
                <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearButton}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="close-circle"
                        size={20}
                        color={theme.colors.textSecondary}
                    />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
});
