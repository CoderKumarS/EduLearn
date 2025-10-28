import React from 'react';
import { View, ViewProps } from 'react-native';
import { useThemedStyles } from '../utils/styling';

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
  const { getBackgroundStyle } = useThemedStyles();
  
  return (
    <View 
      style={[getBackgroundStyle(variant), style]} 
      {...props}
    >
      {children}
    </View>
  );
};