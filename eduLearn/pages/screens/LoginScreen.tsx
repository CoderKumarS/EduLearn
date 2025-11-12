console.log('76. LoginScreen - Starting imports');
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
console.log('77. LoginScreen - React Native imports done');
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
console.log('78. LoginScreen - Contexts imported');
import { ThemedView, ThemedText } from '../components';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
console.log('79. LoginScreen - Components imported');

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormErrors {
  username?: string;
  password?: string;
}

interface LoginScreenProps {
  onNavigateToRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  console.log('80. LoginScreen - Component rendering');
  const { authState, login, clearError } = useAuth();
  console.log('81. LoginScreen - useAuth called');
  const { theme } = useTheme();
  console.log('82. LoginScreen - useTheme called');

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  console.log('83. LoginScreen - formData state initialized');

  const [errors, setErrors] = useState<LoginFormErrors>({});
  console.log('84. LoginScreen - errors state initialized');

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear auth error when user starts typing
    if (authState.error) {
      clearError();
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      // Error is handled by the auth context
      console.warn('Login failed:', error);
    }
  };

  console.log('85. LoginScreen - About to return JSX');
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
                <ThemedText style={styles.logoText}>edu</ThemedText>
              </View>
              <ThemedText style={styles.title}>Welcome Back</ThemedText>
              <ThemedText variant="secondary" style={styles.subtitle}>
                Sign in to continue learning
              </ThemedText>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <Input
                label="Username"
                placeholder="Enter your username"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                error={errors.username}
                autoCapitalize="none"
                autoCorrect={Boolean(false)}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={errors.password}
                isPassword={Boolean(true)}
                autoCapitalize="none"
              />

              {/* Auth Error */}
              {authState.error && (
                <ThemedText style={[styles.errorText, { color: theme.colors.error }]}>
                  {authState.error}
                </ThemedText>
              )}

              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={authState.isLoading}
                style={styles.loginButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerTextContainer}>
                <ThemedText variant="secondary" style={styles.footerText}>
                  Don't have an account?{' '}
                </ThemedText>
                <TouchableOpacity onPress={onNavigateToRegister}>
                  <ThemedText style={[styles.linkText, { color: theme.colors.primary }]}>
                    Sign Up
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
  },
  footerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
});