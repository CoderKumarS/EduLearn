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
            setTopics(data || []);
        } catch (error) {
            handleApiError(error);
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTopic = () => {
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

        try {
            const topicData = {
                chapter: chapterId,
                title: formData.title.trim(),
                content: formData.content.trim(),
                example: formData.example.trim(),
                video_url: formData.video_url.trim(),
                duration_minutes: parseInt(formData.duration_minutes) || 15,
                order: editingTopic ? editingTopic.order : (Array.isArray(topics) ? topics.length + 1 : 1),
            };

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
            handleApiError(error);
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
                        <Ionicons name="document-outline" size={64} color={theme.colors.textSecondary} />
                        <ThemedText style={styles.emptyText}>No topics yet</ThemedText>
                        <Button title="Add First Topic" onPress={handleAddTopic} />
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
                                        style={styles.iconButton}
                                    >
                                        <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteTopic(topic)}
                                        style={styles.iconButton}
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
                        <Input
                            // label="Title *"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="Enter topic title"
                        />

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Content *</ThemedText>
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
                                placeholder="Enter topic content"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={6}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Code Example</ThemedText>
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
                                placeholder="Enter code example"
                                placeholderTextColor={theme.colors.textSecondary}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <Input
                            // label="Video URL"
                            value={formData.video_url}
                            onChangeText={(text) => setFormData({ ...formData, video_url: text })}
                            placeholder="https://youtube.com/..."
                            keyboardType="url"
                        />

                        <Input
                            // label="Duration (minutes)"
                            value={formData.duration_minutes}
                            onChangeText={(text) => setFormData({ ...formData, duration_minutes: text })}
                            placeholder="15"
                            keyboardType="numeric"
                        />
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
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    addButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
    },
    emptyText: {
        fontSize: 18,
        marginTop: 16,
        marginBottom: 24,
        opacity: 0.7,
    },
    topicCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    topicHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    topicInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    topicOrder: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 8,
        opacity: 0.7,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    topicActions: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 8,
    },
    topicContent: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 8,
    },
    topicMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginTop: 4,
    },
    metaText: {
        fontSize: 12,
        marginLeft: 4,
        opacity: 0.7,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    cancelText: {
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
    },
});
