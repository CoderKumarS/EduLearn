import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText } from '../components';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { theme } = useTheme();

  useEffect(() => {
    // Minimum splash screen duration of 2 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
          <ThemedText style={styles.logoText}>edu</ThemedText>
        </View>
        
        {/* App Name */}
        <ThemedText style={styles.appName}>eduLearn</ThemedText>
        
        {/* Tagline */}
        <ThemedText variant="secondary" style={styles.tagline}>
          Learn. Grow. Succeed.
        </ThemedText>
      </View>
      
      {/* Loading Indicator */}
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary} 
        />
        <ThemedText variant="secondary" style={styles.loadingText}>
          Loading...
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});