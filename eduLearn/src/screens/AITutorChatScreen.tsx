import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { ThemedView, ThemedText } from '../components';
import { ChatBubble } from '../components/common/ChatBubble';
import { Ionicons } from '@expo/vector-icons';
import { aiTutorService } from '../services/aiTutorService';
import { handleApiError } from '../utils/errorHandler';
import { ChatMessage } from '../types/chat';

interface AITutorChatScreenProps {
    onNavigateBack?: () => void;
}

export const AITutorChatScreen: React.FC<AITutorChatScreenProps> = ({
    onNavigateBack,
}) => {
    const { theme } = useTheme();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            message: 'Hello! I\'m your AI Tutor. How can I help you learn today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: false,
        },
    ]);

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>();

    // Auto-scroll to latest message
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isLoading) {
            return;
        }

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            message: inputText.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isUser: true,
        };

        // Add user message immediately
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Call AI Tutor service - message first, then conversationId
            const response = await aiTutorService.sendMessage(userMessage.message, conversationId);

            // Update conversation ID if this is the first message
            if (!conversationId) {
                setConversationId(response.conversation_id);
            }

            const aiResponse: ChatMessage = {
                id: response.message_id,
                message: response.response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isUser: false,
            };

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            const apiError = handleApiError(error);
            console.error('Error sending message:', apiError);

            // Add error message to chat
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                message: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isUser: false,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => (
        <ChatBubble
            message={item.message}
            isUser={Boolean(item.isUser)}
            timestamp={item.timestamp}
        />
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <KeyboardAvoidingView
                style={styles.keyboardAvoid}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
                    {onNavigateBack && (
                        <TouchableOpacity
                            onPress={onNavigateBack}
                            style={styles.backButton}
                            accessibilityRole="button"
                            accessibilityLabel="Go back"
                        >
                            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    )}
                    <View style={styles.headerContent}>
                        <View style={[styles.aiAvatar, { backgroundColor: theme.colors.primary }]}>
                            <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
                        </View>
                        <View style={styles.headerText}>
                            <ThemedText style={styles.headerTitle}>AI Tutor</ThemedText>
                            <ThemedText variant="secondary" style={styles.headerSubtitle}>
                                Always here to help
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />

                {/* Loading Indicator */}
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={theme.colors.primary} />
                        <ThemedText variant="secondary" style={styles.loadingText}>
                            AI is thinking...
                        </ThemedText>
                    </View>
                )}

                {/* Input Area */}
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.colors.surface,
                                color: theme.colors.text,
                                borderRadius: theme.borderRadius.lg,
                            },
                        ]}
                        placeholder="Ask AI Tutor..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor: inputText.trim() && !isLoading ? theme.colors.primary : theme.colors.border,
                                borderRadius: theme.borderRadius.full,
                            },
                        ]}
                        onPress={handleSendMessage}
                        disabled={!inputText.trim() || isLoading}
                        accessibilityRole="button"
                        accessibilityLabel="Send message"
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={inputText.trim() && !isLoading ? '#FFFFFF' : theme.colors.textSecondary}
                        />
                    </TouchableOpacity>
                </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
        marginRight: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    aiAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    messagesList: {
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        minHeight: 44,
        maxHeight: 100,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
