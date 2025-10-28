import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText, Button } from '../components';

export const DashboardScreen: React.FC = () => {
  const { authState, logout } = useAuth();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Dashboard</ThemedText>
          <ThemedText variant="secondary" style={styles.welcome}>
            Welcome back, {authState.user?.username}!
          </ThemedText>
        </View>

        <View style={styles.userInfo}>
          <ThemedText style={styles.infoLabel}>User Information:</ThemedText>
          <ThemedText>Username: {authState.user?.username}</ThemedText>
          <ThemedText>Role: {authState.user?.role}</ThemedText>
          {authState.user?.email && (
            <ThemedText>Email: {authState.user.email}</ThemedText>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
          />
        </View>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 16,
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 8,
  },
  infoLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actions: {
    paddingTop: 24,
  },
});