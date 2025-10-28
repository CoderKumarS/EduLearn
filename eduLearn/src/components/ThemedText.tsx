import React from 'react';
import { Text, TextProps } from 'react-native';
import { useThemedStyles } from '../utils/styling';

interface ThemedTextProps extends TextProps {
  variant?: 'primary' | 'secondary';
  children?: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({ 
  variant = 'primary', 
  style, 
  children, 
  ...props 
}) => {
  const { getTextStyle } = useThemedStyles();
  
  return (
    <Text 
      style={[getTextStyle(variant), style]} 
      {...props}
    >
      {children}
    </Text>
  );
};