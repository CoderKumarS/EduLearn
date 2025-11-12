console.log('86. ThemedView - Starting imports');
import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
console.log('87. ThemedView - Imports done');

interface ThemedViewProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'surface' | 'card';
  children?: React.ReactNode;
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  variant = 'primary',
  style,
  children,
  ...props
}) => {
  console.log('88. ThemedView - Component rendering, variant:', variant);
  const { theme } = useTheme();
  console.log('89. ThemedView - useTheme called');

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.background;
      case 'secondary':
        return theme.colors.surface;
      case 'surface':
        return theme.colors.surface;
      case 'card':
        return theme.colors.card;
      default:
        return theme.colors.background;
    }
  };

  return (
    <View
      style={[{ backgroundColor: getBackgroundColor() }, style]}
      {...props}
    >
      {children}
    </View>
  );
};