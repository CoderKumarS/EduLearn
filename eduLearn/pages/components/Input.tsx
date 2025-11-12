console.log('90. Input - Starting imports');
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedText } from './ThemedText';
console.log('91. Input - Imports done');

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  rightIcon,
  style,
  autoCorrect,
  autoCapitalize,
  editable,
  ...props
}) => {
  console.log('92. Input - Component rendering');
  const { theme } = useTheme();
  console.log('93. Input - useTheme called');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  console.log('94. Input - isPasswordVisible state initialized');
  const [isFocused, setIsFocused] = useState(false);
  console.log('95. Input - isFocused state initialized');

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  console.log('96. Input - About to return JSX');
  console.log('96a. Input - Props:', { isPassword, autoCorrect, autoCapitalize, editable });
  console.log('96b. Input - secureTextEntry will be:', Boolean(isPassword && !isPasswordVisible));

  return (
    <View style={styles.container}>
      {label && (
        <ThemedText style={styles.label}>
          {label}
        </ThemedText>
      )}

      <View style={[
        styles.inputContainer,
        {
          borderColor: error
            ? theme.colors.error
            : isFocused
              ? theme.colors.primary
              : theme.colors.border,
          backgroundColor: theme.colors.surface,
        }
      ]}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}

        {console.log('96c. Input - About to render TextInput')}
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text },
            style
          ]}
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry={Boolean(isPassword && !isPasswordVisible)}
          autoCorrect={autoCorrect !== undefined ? Boolean(autoCorrect) : undefined}
          autoCapitalize={autoCapitalize}
          editable={editable !== undefined ? Boolean(editable) : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {console.log('96d. Input - TextInput rendered successfully')}

        {isPassword && (
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}
          >
            <Text style={{ color: theme.colors.textSecondary }}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>

      {error && (
        <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});