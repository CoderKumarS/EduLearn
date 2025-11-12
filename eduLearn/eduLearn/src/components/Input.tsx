import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

interface InputProps extends Omit<TextInputProps, 'secureTextEntry' | 'autoCorrect'> {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    isPassword?: boolean;
    autoCorrect?: boolean;
}

export const Input: React.FC<InputProps> = ({
    value,
    onChangeText,
    placeholder,
    isPassword,
    autoCorrect,
    style,
    ...props
}) => {
    const { theme } = useTheme();
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(Boolean(false));

    // Wrap boolean props with Boolean() constructor for safety
    const isPasswordField = Boolean(isPassword);
    const shouldHidePassword = Boolean(isPasswordField && !isPasswordVisible);

    // For password fields, disable autoCorrect by default
    const shouldAutoCorrect = Boolean(
        autoCorrect !== undefined ? autoCorrect : !isPasswordField
    );

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(Boolean(!isPasswordVisible));
    };

    return (
        <ThemedView variant="surface" style={styles.container}>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.colors.text,
                            borderColor: theme.colors.border,
                        },
                        isPasswordField && styles.inputWithIcon,
                        style,
                    ]}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={shouldHidePassword}
                    autoCorrect={shouldAutoCorrect}
                    {...props}
                />
                {isPasswordField && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={togglePasswordVisibility}
                        activeOpacity={0.7}
                    >
                        <ThemedText variant="secondary" size="lg">
                            {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                        </ThemedText>
                    </TouchableOpacity>
                )}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
        borderWidth: 1,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    inputWithIcon: {
        paddingRight: 48,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        padding: 4,
    },
});
