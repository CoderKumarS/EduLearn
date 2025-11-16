import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import topicService from '../../services/topicService';
import { Topic } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';

interface ManageTopicsScreenProps {
    chapterId: number;
    onNavigateBack: () => void;
}

export const ManageTopicsScreen: React.FC<ManageTopicsScreenProps> = ({
    chapterId,
    onNavigateBack,
}) => {
    const { theme } = useTheme();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        example: '',
        video_url: '',
        duration_minutes: '15',
    });

    useEffect(() => {
        loadTopics();
    }, [chapterId]);

    const loadTopics = async () => {
        try {
            setLoading(true);
            const data = await topicService.getTopics(chapterId);
            console.log('Loaded topics for chapter', chapterId, ':', data);
            setTopics(data || []);
        } catch (error) {
            console.error('Error loading topics:', error);
            handleApiError(error);
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTopic = async () => {
        // Reload topics to ensure we have the latest data
        await loadTopics();
        setEditingTopic(null);
        setFormData({
            title: '',
            content: '',
            example: '',
            video_url: '',
            duration_minutes: '15',
        });
        setShowAddModal(true);
    };

    const handleEditTopic = (topic: Topic) => {
        setEditingTopic(topic);
        setFormData({
            title: topic.title,
            content: topic.content,
            example: topic.example || '',
            video_url: topic.video_url || '',
            duration_minutes: topic.duration_minutes.toString(),
        });
        setShowAddModal(true);
    };

    const handleSaveTopic = async () => {
        if (!formData.title.trim() || !formData.content.trim()) {
            Alert.alert('Error', 'Title and content are required');
            return;
        }

        // Validate content length
        if (formData.content.trim().length < 10) {
            Alert.alert('Error', 'Content must be at least 10 characters long');
            return;
        }

        // Validate duration
        const duration = parseInt(formData.duration_minutes);
        if (isNaN(duration) || duration < 1 || duration > 300) {
            Alert.alert('Error', 'Duration must be between 1 and 300 minutes');
            return;
        }

        try {
            // Reload topics to get the latest data from the server before calculating order
            const latestTopics = await topicService.getTopics(chapterId);
            console.log('Latest topics from server:', latestTopics);

            const nextOrder = editingTopic
                ? editingTopic.order
                : (Array.isArray(latestTopics) && latestTopics.length > 0
                    ? Math.max(...latestTopics.map(t => t.order)) + 1
                    : 1);

            console.log('Calculated next order:', nextOrder);

            // Build topic data, only including optional fields if they have values
            const topicData: any = {
                chapter: chapterId,
                title: formData.title.trim(),
                content: formData.content.trim(),
                duration_minutes: duration,
                order: nextOrder,
            };

            // Only add optional fields if they have values
            const exampleValue = formData.example.trim();
            if (exampleValue) {
                topicData.example = exampleValue;
            }

            const videoUrlValue = formData.video_url.trim();
            if (videoUrlValue) {
                topicData.video_url = videoUrlValue;
            }

            console.log('Saving topic:', topicData);

            if (editingTopic) {
                await topicService.updateTopic(editingTopic.id, topicData);
                Alert.alert('Success', 'Topic updated successfully');
            } else {
                await topicService.createTopic(topicData);
                Alert.alert('Success', 'Topic created successfully');
            }

            setShowAddModal(false);
            await loadTopics();
        } catch (error) {
            console.error('Error saving topic:', error);
            const apiError = handleApiError(error);
            Alert.alert('Error', apiError.message);
        }
    };

    const handleDeleteTopic = (topic: Topic) => {
        Alert.alert(
            'Delete Topic',
            `Are you sure you want to delete "${topic.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await topicService.deleteTopic(topic.id);
                            loadTopics();
                        } catch (error) {
                            handleApiError(error);
                        }
                    },
                },
            ]
        );
    };

    const handleReorder = async (topicId: number, direction: 'up' | 'down') => {
        const index = topics.findIndex((t) => t.id === topicId);
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === topics.length - 1)
        ) {
            return;
        }

        const newTopics = [...topics];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newTopics[index], newTopics[targetIndex]] = [newTopics[targetIndex], newTopics[index]];

        const topicOrders = newTopics.map((topic, idx) => ({
            id: topic.id,
            order: idx + 1,
        }));

        try {
            await topicService.reorderTopics({ topic_orders: topicOrders });
            setTopics(newTopics);
        } catch (error) {
            handleApiError(error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Manage Topics</ThemedText>
                <TouchableOpacity onPress={handleAddTopic} style={styles.addButton}>
                    <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Topics List */}
            <ScrollView style={styles.content}>
                {loading ? (
                    <View style={styles.emptyState}>
                        <ThemedText>Loading topics...</ThemedText>
                    </View>
                ) : !Array.isArray(topics) || topics.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Ionicons name="document-text-outline" size={48} color={theme.colors.primary} />
                        </View>
                        <ThemedText style={styles.emptyText}>No topics yet</ThemedText>
                        <ThemedText variant="secondary" style={styles.emptySubtext}>
                            Start building your chapter by adding topics
                        </ThemedText>
                        <Button title="Add First Topic" onPress={handleAddTopic} style={styles.emptyButton} />
                    </View>
                ) : (
                    topics.map((topic, index) => (
                        <View
                            key={topic.id}
                            style={[styles.topicCard, { backgroundColor: theme.colors.card }]}
                        >
                            <View style={styles.topicHeader}>
                                <View style={styles.topicInfo}>
                                    <ThemedText style={styles.topicOrder}>#{index + 1}</ThemedText>
                                    <ThemedText style={styles.topicTitle}>{topic.title}</ThemedText>
                                </View>
                                <View style={styles.topicActions}>
                                    <TouchableOpacity
                                        onPress={() => handleReorder(topic.id, 'up')}
                                        disabled={index === 0}
                                        style={styles.iconButton}
                                    >
                                        <Ionicons
                                            name="arrow-up"
                                            size={20}
                                            color={index === 0 ? theme.colors.border : theme.colors.text}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleReorder(topic.id, 'down')}
                                        disabled={index === topics.length - 1}
                                        style={styles.iconButton}
                                    >
                                        <Ionicons
                                            name="arrow-down"
                                            size={20}
                                            color={
                                                index === topics.length - 1
                                                    ? theme.colors.border
                                                    : theme.colors.text
                                            }
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleEditTopic(topic)}
                                        style={[styles.iconButton, { backgroundColor: theme.colors.primary + '15' }]}
                                    >
                                        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteTopic(topic)}
                                        style={[styles.iconButton, { backgroundColor: theme.colors.error + '15' }]}
                                    >
                                        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <ThemedText style={styles.topicContent} numberOfLines={2}>
                                {topic.content}
                            </ThemedText>
                            <View style={styles.topicMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                                    <ThemedText style={styles.metaText}>{topic.duration_minutes} min</ThemedText>
                                </View>
                                {topic.video_url && (
                                    <View style={styles.metaItem}>
                                        <Ionicons name="play-circle-outline" size={16} color={theme.colors.textSecondary} />
                                        <ThemedText style={styles.metaText}>Video</ThemedText>
                                    </View>
                                )}
                                {topic.example && (
                                    <View style={styles.metaItem}>
                                        <Ionicons name="code-outline" size={16} color={theme.colors.textSecondary} />
                                        <ThemedText style={styles.metaText}>Example</ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowAddModal(false)}
            >
                <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                        </TouchableOpacity>
                        <ThemedText style={styles.modalTitle}>
                            {editingTopic ? 'Edit Topic' : 'Add Topic'}
                        </ThemedText>
                        <TouchableOpacity onPress={handleSaveTopic}>
                            <ThemedText style={[styles.saveText, { color: theme.colors.primary }]}>
                                Save
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Title *</ThemedText>
                            <Input
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                                placeholder="e.g., Introduction to Variables"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Content *</ThemedText>
                            <ThemedText style={styles.helpText}>
                                Explain the topic in detail (minimum 10 characters)
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: theme.colors.card,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                    },
                                ]}
                                value={formData.content}
                                onChangeText={(text) => setFormData({ ...formData, content: text })}
                                placeholder="Describe what students will learn in this topic..."
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={6}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Code Example (Optional)</ThemedText>
                            <ThemedText style={styles.helpText}>
                                Provide a code snippet or example
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.textArea,
                                    {
                                        backgroundColor: theme.colors.card,
                                        color: theme.colors.text,
                                        borderColor: theme.colors.border,
                                        fontFamily: 'monospace',
                                    },
                                ]}
                                value={formData.example}
                                onChangeText={(text) => setFormData({ ...formData, example: text })}
                                placeholder="// Example code here"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Video URL (Optional)</ThemedText>
                            <Input
                                value={formData.video_url}
                                onChangeText={(text) => setFormData({ ...formData, video_url: text })}
                                placeholder="https://youtube.com/watch?v=..."
                                keyboardType="url"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Duration (minutes) *</ThemedText>
                            <Input
                                value={formData.duration_minutes}
                                onChangeText={(text) => setFormData({ ...formData, duration_minutes: text })}
                                placeholder="15"
                                keyboardType="numeric"
                            />
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
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
        padding: 18,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '700',
        marginLeft: 8,
    },
    addButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 18,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        marginTop: 40,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 24,
        opacity: 0.7,
    },
    emptyButton: {
        minWidth: 160,
    },
    topicCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    topicHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    topicInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    topicOrder: {
        fontSize: 20,
        fontWeight: '700',
        opacity: 0.3,
        minWidth: 32,
    },
    topicTitle: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        lineHeight: 24,
    },
    topicActions: {
        flexDirection: 'row',
        gap: 4,
    },
    iconButton: {
        padding: 8,
        borderRadius: 8,
    },
    topicContent: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 12,
        lineHeight: 20,
        marginLeft: 44,
    },
    topicMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginLeft: 44,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
        opacity: 0.8,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '700',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    helpText: {
        fontSize: 13,
        opacity: 0.6,
        marginBottom: 10,
        lineHeight: 18,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        textAlignVertical: 'top',
        lineHeight: 22,
    },
});
