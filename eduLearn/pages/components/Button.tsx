console.log('97. Button - Starting imports');
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
console.log('98. Button - Imports done');

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  leftIcon,
  rightIcon,
  style,
  disabled,
  ...props
}) => {
  console.log('99. Button - Component rendering, variant:', variant);
  const { theme } = useTheme();
  console.log('100. Button - useTheme called');

  const getButtonStyle = () => {
    const baseStyle = {
      ...styles.button,
      ...styles[size],
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.textSecondary : theme.colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.border : theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.textSecondary : theme.colors.primary,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          ...styles.text,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...styles.text,
          color: theme.colors.text,
        };
      case 'outline':
        return {
          ...styles.text,
          color: disabled ? theme.colors.textSecondary : theme.colors.primary,
        };
      default:
        return styles.text;
    }
  };

  console.log('101. Button - About to return JSX');
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={Boolean(disabled || loading)}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 56,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});