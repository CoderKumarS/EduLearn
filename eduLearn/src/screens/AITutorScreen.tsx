import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '../components/common/ThemedView';
import { ThemedText } from '../components/common/ThemedText';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const AITutorScreen: React.FC = () => {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I\'m your AI tutor. How can I help you today?',
            isUser: Boolean(false),
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(Boolean(false));

    const [conversationId, setConversationId] = useState<string | undefined>();
    const [error, setError] = useState<string>('');

    const handleSendMessage = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            setError('Please enter a message');
            return;
        }

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: trimmedMessage,
            isUser: Boolean(true),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(Boolean(true));
        setError('');

        try {
            // Import the AI tutor service
            const { aiTutorService } = await import('../services/aiTutorService');

            console.log('Sending message:', trimmedMessage);

            // Send message to backend
            const response = await aiTutorService.sendMessage(
                trimmedMessage,
                conversationId
            );

            // Update conversation ID if this is the first message
            if (!conversationId) {
                setConversationId(response.conversation_id);
            }

            // Add AI response
            const aiMessage: Message = {
                id: response.message_id,
                text: response.response,
                isUser: Boolean(false),
                timestamp: new Date(response.timestamp),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (err: any) {
            console.error('Error sending message:', err);
            setError(err.message || 'Failed to send message. Please try again.');

            // Remove the user message on error
            setMessages(prev => prev.filter(m => m.id !== userMessage.id));
            setMessage(currentMessage); // Restore the message
        } finally {
            setIsLoading(Boolean(false));
        }
    };

    const renderMessage = (msg: Message) => (
        <ThemedView
            key={msg.id}
            style={[
                styles.messageContainer,
                Boolean(msg.isUser) ? styles.userMessageContainer : styles.aiMessageContainer,
            ]}
        >
            <ThemedView
                style={[
                    styles.messageBubble,
                    {
                        backgroundColor: Boolean(msg.isUser) ? theme.colors.primary : theme.colors.surface,
                    },
                ]}
            >
                <ThemedText
                    size="md"
                    style={[
                        styles.messageText,
                        { color: Boolean(msg.isUser) ? '#FFFFFF' : theme.colors.text },
                    ]}
                >
                    {msg.text}
                </ThemedText>
                <ThemedText
                    size="xs"
                    style={[
                        styles.timestamp,
                        { color: Boolean(msg.isUser) ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                >
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
            </ThemedView>
        </ThemedView>
    );

    if (!Boolean(isAuthenticated)) {
        return (
            <ThemedView variant="default" style={styles.container}>
                <ThemedText variant="secondary" size="lg" style={styles.emptyState}>
                    Please log in to use the AI Tutor
                </ThemedText>
            </ThemedView>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <ThemedView variant="default" style={styles.container}>
                {/* Header */}
                <ThemedView variant="surface" style={styles.header}>
                    <ThemedText variant="default" size="xl" weight="bold">
                        🤖 AI Tutor
                    </ThemedText>
                    <ThemedText variant="secondary" size="sm">
                        Ask me anything about your courses
                    </ThemedText>
                </ThemedView>

                {/* Error Message */}
                {error && (
                    <ThemedView style={styles.errorContainer}>
                        <ThemedText style={styles.errorText}>
                            ⚠️ {error}
                        </ThemedText>
                    </ThemedView>
                )}

                {/* Messages */}
                <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
                    {messages.map(renderMessage)}
                    {Boolean(isLoading) && (
                        <ThemedView style={styles.loadingContainer}>
                            <ThemedText variant="secondary" size="sm">
                                AI is typing...
                            </ThemedText>
                        </ThemedView>
                    )}
                </ScrollView>

                {/* Input Area */}
                <ThemedView variant="surface" style={styles.inputContainer}>
                    <Input
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type your question..."
                        style={styles.input}
                        multiline={Boolean(true)}
                    />
                    <Button
                        title="Send"
                        onPress={handleSendMessage}
                        disabled={Boolean(!message.trim() || isLoading)}
                        loading={Boolean(isLoading)}
                        style={styles.sendButton}
                    />
                </ThemedView>
            </ThemedView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    keyboardAvoidingView: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
    },
    aiMessageContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 12,
    },
    messageText: {
        lineHeight: 20,
    },
    timestamp: {
        marginTop: 4,
        opacity: 0.7,
    },
    loadingContainer: {
        alignSelf: 'flex-start',
        padding: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    input: {
        flex: 1,
    },
    sendButton: {
        minWidth: 80,
    },
    emptyState: {
        textAlign: 'center',
        marginTop: 40,
    },
    errorContainer: {
        padding: 12,
        margin: 16,
        backgroundColor: '#fee',
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#c33',
    },
    errorText: {
        color: '#c33',
        fontSize: 14,
    },
});

export default AITutorScreen;
