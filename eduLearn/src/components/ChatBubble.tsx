import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ChatBubbleProps {
    message: string;
    timestamp: string;
    isUser: boolean;
    avatar?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
    message,
    timestamp,
    isUser,
    avatar,
}) => {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.container,
                isUser ? styles.userContainer : styles.aiContainer,
            ]}
        >
            {!isUser && (
                <View style={styles.avatarContainer}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                        <View
                            style={[
                                styles.avatarPlaceholder,
                                { backgroundColor: theme.colors.primary },
                            ]}
                        >
                            <Ionicons name="chatbubbles" size={20} color="#FFFFFF" />
                        </View>
                    )}
                </View>
            )}

            <View style={styles.bubbleWrapper}>
                <View
                    style={[
                        styles.bubble,
                        {
                            backgroundColor: isUser
                                ? theme.colors.primary
                                : theme.colors.surface,
                            borderRadius: theme.borderRadius.lg,
                        },
                        isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.message,
                            theme.typography.body,
                            {
                                color: isUser ? '#FFFFFF' : theme.colors.text,
                            },
                        ]}
                    >
                        {message}
                    </Text>
                </View>
                <Text
                    style={[
                        styles.timestamp,
                        theme.typography.small,
                        {
                            color: theme.colors.textTertiary,
                        },
                        isUser ? styles.userTimestamp : styles.aiTimestamp,
                    ]}
                >
                    {timestamp}
                </Text>
            </View>

            {isUser && <View style={styles.spacer} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    aiContainer: {
        justifyContent: 'flex-start',
    },
    avatarContainer: {
        marginRight: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleWrapper: {
        maxWidth: '75%',
    },
    bubble: {
        padding: 12,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    message: {
        lineHeight: 22,
    },
    timestamp: {
        marginTop: 4,
    },
    userTimestamp: {
        textAlign: 'right',
    },
    aiTimestamp: {
        textAlign: 'left',
    },
    spacer: {
        width: 44,
    },
});
