import React, { useState, useEffect } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView } from '../../components/common/ThemedView';
import { ThemedText } from '../../components/common/ThemedText';
import { Button } from '../../components/common/Button';
import topicService from '../../services/topicService';
import progressService from '../../services/progressService';
import { Topic } from '../../types/course';
import { handleApiError } from '../../utils/errorHandler';

interface TopicDetailScreenProps {
    topicId: number;
    chapterId: number;
    onNavigateBack: () => void;
    onNavigateToNext?: (topicId: number) => void;
    onNavigateToPrevious?: (topicId: number) => void;
}

export const TopicDetailScreen: React.FC<TopicDetailScreenProps> = ({
    topicId,
    chapterId,
    onNavigateBack,
    onNavigateToNext,
    onNavigateToPrevious,
}) => {
    const { theme } = useTheme();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [allTopics, setAllTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingComplete, setMarkingComplete] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        loadTopicData();
    }, [topicId, chapterId]);

    const loadTopicData = async () => {
        try {
            setLoading(true);
            const [topicData, chapterTopics] = await Promise.all([
                topicService.getTopic(topicId),
                topicService.getTopics(chapterId),
            ]);

            setTopic(topicData);
            setAllTopics(chapterTopics);

            const index = chapterTopics.findIndex((t) => t.id === topicId);
            setCurrentIndex(index);
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };


    const handleMarkComplete = async () => {
        if (!topic) return;

        try {
            setMarkingComplete(true);
            await topicService.markTopicComplete(topic.id);

            // Reload topic to get updated completion status
            const updatedTopic = await topicService.getTopic(topic.id);
            setTopic(updatedTopic);

            // Clear progress cache
            progressService.clearAllCache();
        } catch (error) {
            handleApiError(error);
        } finally {
            setMarkingComplete(false);
        }
    };

    const handleOpenVideo = async () => {
        if (topic?.video_url) {
            try {
                await Linking.openURL(topic.video_url);
            } catch (error) {
                console.error('Failed to open video URL:', error);
            }
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0 && onNavigateToPrevious) {
            const previousTopic = allTopics[currentIndex - 1];
            onNavigateToPrevious(previousTopic.id);
        }
    };

    const handleNext = () => {
        if (currentIndex < allTopics.length - 1 && onNavigateToNext) {
            const nextTopic = allTopics[currentIndex + 1];
            onNavigateToNext(nextTopic.id);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <ThemedText style={styles.loadingText}>Loading topic...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (!topic) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
                    <ThemedText style={styles.errorText}>Topic not found</ThemedText>
                    <Button title="Go Back" onPress={onNavigateBack} />
                </View>
            </SafeAreaView>
        );
    }

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < allTopics.length - 1;
    const topicPosition = `Topic ${currentIndex + 1} of ${allTopics.length}`;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <ThemedText style={styles.headerTitle} numberOfLines={1}>
                        {topic.title}
                    </ThemedText>
                    <ThemedText style={styles.headerSubtitle}>{topicPosition}</ThemedText>
                </View>
                <View style={styles.headerRight}>
                    {topic.is_completed && (
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                    )}
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Topic Content */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Content</ThemedText>
                    <ThemedText style={styles.contentText}>{topic.content}</ThemedText>
                </View>

                {/* Code Example */}
                {topic.example && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Example</ThemedText>
                        <View style={[styles.codeBlock, { backgroundColor: theme.colors.card }]}>
                            <ThemedText style={styles.codeText}>{topic.example}</ThemedText>
                        </View>
                    </View>
                )}

                {/* Video */}
                {topic.video_url && (
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Video Lecture</ThemedText>
                        <TouchableOpacity
                            style={[styles.videoButton, { backgroundColor: theme.colors.primary }]}
                            onPress={handleOpenVideo}
                        >
                            <Ionicons name="play-circle-outline" size={24} color="#fff" />
                            <ThemedText style={styles.videoButtonText}>Watch Video</ThemedText>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Duration */}
                <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
                    <ThemedText style={styles.infoText}>
                        Estimated time: {topic.duration_minutes} minutes
                    </ThemedText>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { borderTopColor: theme.colors.border }]}>
                {/* Mark Complete Button */}
                {!topic.is_completed && (
                    <Button
                        title={markingComplete ? 'Marking...' : 'Mark as Complete'}
                        onPress={handleMarkComplete}
                        disabled={markingComplete}
                        style={styles.completeButton}
                    />
                )}

                {/* Navigation Buttons */}
                <View style={styles.navigationButtons}>
                    <Button
                        title="Previous"
                        onPress={handlePrevious}
                        disabled={!hasPrevious}
                        variant="outline"
                        style={styles.navButton}
                    />
                    <Button
                        title="Next"
                        onPress={handleNext}
                        disabled={!hasNext}
                        style={styles.navButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 18,
        marginTop: 16,
        marginBottom: 24,
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
    headerCenter: {
        flex: 1,
        marginHorizontal: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    contentText: {
        fontSize: 16,
        lineHeight: 24,
    },
    codeBlock: {
        padding: 16,
        borderRadius: 8,
    },
    codeText: {
        fontFamily: 'monospace',
        fontSize: 14,
        lineHeight: 20,
    },
    videoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
    },
    videoButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoText: {
        fontSize: 14,
        marginLeft: 8,
    },
    bottomBar: {
        padding: 16,
        borderTopWidth: 1,
    },
    completeButton: {
        marginBottom: 12,
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    navButton: {
        flex: 1,
        marginHorizontal: 4,
    },
});
