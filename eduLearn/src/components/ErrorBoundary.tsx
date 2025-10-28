import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView, ThemedText, Button } from './index';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.container}>
          <View style={styles.content}>
            <ThemedText style={styles.title}>Oops! Something went wrong</ThemedText>
            <ThemedText variant="secondary" style={styles.message}>
              We're sorry, but something unexpected happened. Please try reloading the app.
            </ThemedText>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <ThemedText style={styles.errorTitle}>Error Details:</ThemedText>
                <ThemedText variant="secondary" style={styles.errorText}>
                  {this.state.error.message}
                </ThemedText>
              </View>
            )}
            
            <Button
              title="Reload App"
              onPress={this.handleReload}
              style={styles.reloadButton}
            />
          </View>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorDetails: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#EF4444',
  },
  reloadButton: {
    minWidth: 120,
  },
});