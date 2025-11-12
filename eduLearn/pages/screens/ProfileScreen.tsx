import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';

interface ProfileScreenProps {
  onNavigateBack: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onNavigateBack }) => {
  const { authState, logout } = useAuth();
  const { theme, setThemeMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <ThemedText style={[styles.backButtonText, { color: theme.colors.primary }]}>
            ← Back
          </ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          {/* Profile Info */}
          <View style={[styles.profileSection, { backgroundColor: theme.colors.card }]}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
              <ThemedText style={styles.avatarText}>
                {authState.user?.username.charAt(0).toUpperCase()}
              </ThemedText>
            </View>

            <ThemedText style={styles.username}>{authState.user?.username}</ThemedText>
            {authState.user?.email && (
              <ThemedText variant="secondary" style={styles.email}>
                {authState.user.email}
              </ThemedText>
            )}
            <View style={[styles.roleBadge, { backgroundColor: theme.colors.primary }]}>
              <ThemedText style={styles.roleText}>
                {authState.user?.role ?
                  authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1) :
                  'User'
                }
              </ThemedText>
            </View>
          </View>

          {/* Theme Settings */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>

            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme.mode === 'light'
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <ThemedText style={[
                  styles.themeOptionText,
                  { color: theme.mode === 'light' ? '#FFFFFF' : theme.colors.text }
                ]}>
                  Light
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme.mode === 'dark'
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <ThemedText style={[
                  styles.themeOptionText,
                  { color: theme.mode === 'dark' ? '#FFFFFF' : theme.colors.text }
                ]}>
                  Dark
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.themeOption,
                  {
                    backgroundColor: theme.mode === 'system'
                      ? theme.colors.primary
                      : theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={() => handleThemeChange('system')}
              >
                <ThemedText style={[
                  styles.themeOptionText,
                  { color: theme.mode === 'system' ? '#FFFFFF' : theme.colors.text }
                ]}>
                  System
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Account Settings */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Account</ThemedText>

            <View style={styles.accountInfo}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Username:</ThemedText>
                <ThemedText style={styles.infoValue}>{authState.user?.username}</ThemedText>
              </View>

              {authState.user?.email && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Email:</ThemedText>
                  <ThemedText style={styles.infoValue}>{authState.user.email}</ThemedText>
                </View>
              )}

              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Role:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {authState.user?.role ?
                    authState.user.role.charAt(0).toUpperCase() + authState.user.role.slice(1) :
                    'User'
                  }
                </ThemedText>

              </View>
            </View>
          </View>

          {/* App Info */}
          <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.sectionTitle}>About</ThemedText>

            <View style={styles.appInfo}>
              <ThemedText style={styles.appName}>eduLearn</ThemedText>
              <ThemedText variant="secondary" style={styles.appVersion}>
                Version 1.0.0
              </ThemedText>
              <ThemedText variant="secondary" style={styles.appDescription}>
                A comprehensive e-learning platform for students and instructors.
              </ThemedText>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <Button
              title="Logout"
              variant="outline"
              onPress={handleLogout}
              style={[styles.logoutButton, { borderColor: theme.colors.error }]}
            />
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  appInfo: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  logoutSection: {
    paddingTop: 20,
  },
  logoutButton: {
    marginBottom: 20,
  },
});