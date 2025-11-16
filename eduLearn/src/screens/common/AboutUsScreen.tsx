import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedView, ThemedText } from '../../components';
import { TeamMemberCard } from '../../components/common/TeamMemberCard';
import { Ionicons } from '@expo/vector-icons';

interface AboutUsScreenProps {
    onNavigateBack?: () => void;
}

interface TeamMember {
    id: string;
    name: string;
    title: string;
    bio: string;
    photo: string;
}

const TEAM_MEMBERS: TeamMember[] = [
    {
        id: '1',
        name: 'Dr. Sarah Johnson',
        title: 'Founder & CEO',
        bio: 'AI researcher with 15+ years of experience in educational technology and machine learning.',
        photo: '',
    },
    {
        id: '2',
        name: 'Michael Chen',
        title: 'Chief Technology Officer',
        bio: 'Full-stack developer passionate about creating innovative learning platforms.',
        photo: '',
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        title: 'Head of Content',
        bio: 'Curriculum designer with expertise in creating engaging educational content.',
        photo: '',
    },
    {
        id: '4',
        name: 'David Kim',
        title: 'Lead AI Engineer',
        bio: 'Specializes in natural language processing and conversational AI systems.',
        photo: '',
    },
];

export const AboutUsScreen: React.FC<AboutUsScreenProps> = ({
    onNavigateBack,
}) => {
    const { theme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
                <ThemedText style={styles.headerTitle}>About Us</ThemedText>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={[styles.heroSection, { backgroundColor: theme.colors.primary + '20' }]}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
                        <Ionicons name="school" size={48} color="#FFFFFF" />
                    </View>
                    <ThemedText style={styles.heroTitle}>AI LearnHub</ThemedText>
                    <ThemedText variant="secondary" style={styles.heroSubtitle}>
                        Empowering learners through AI-driven education
                    </ThemedText>
                </View>

                {/* Our Mission Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Our Mission</ThemedText>
                    <ThemedText style={styles.sectionText}>
                        At AI LearnHub, we believe that education should be accessible, personalized, and
                        engaging for everyone. Our mission is to revolutionize online learning by combining
                        cutting-edge artificial intelligence with expert-crafted content to create a truly
                        adaptive learning experience.
                    </ThemedText>
                    <ThemedText style={styles.sectionText}>
                        We strive to break down barriers to education and empower learners worldwide to
                        achieve their full potential through innovative technology and quality instruction.
                    </ThemedText>
                </View>

                {/* Our Story Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Our Story</ThemedText>
                    <ThemedText style={styles.sectionText}>
                        Founded in 2023, AI LearnHub was born from a simple observation: traditional online
                        learning platforms weren't adapting to individual learner needs. Our founders, a team
                        of educators and AI researchers, set out to create a platform that could understand
                        each student's unique learning style and pace.
                    </ThemedText>
                    <ThemedText style={styles.sectionText}>
                        What started as a small project has grown into a comprehensive learning platform
                        serving thousands of students worldwide. Today, we offer courses across multiple
                        disciplines, all enhanced by our proprietary AI tutor that provides personalized
                        guidance and support 24/7.
                    </ThemedText>
                    <ThemedText style={styles.sectionText}>
                        Our journey is just beginning, and we're committed to continuously improving and
                        expanding our platform to serve the evolving needs of learners everywhere.
                    </ThemedText>
                </View>

                {/* Meet Our Team Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Meet Our Team</ThemedText>
                    <ThemedText variant="secondary" style={styles.teamIntro}>
                        Our diverse team of educators, engineers, and designers is dedicated to creating
                        the best learning experience possible.
                    </ThemedText>

                    <View style={styles.teamGrid}>
                        {TEAM_MEMBERS.map((member, index) => (
                            <View
                                key={member.id}
                                style={[
                                    styles.teamMemberContainer,
                                    index % 2 === 0 ? styles.teamMemberLeft : styles.teamMemberRight,
                                ]}
                            >
                                <TeamMemberCard
                                    name={member.name}
                                    title={member.title}
                                    bio={member.bio}
                                    photo={member.photo}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Values Section */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Our Values</ThemedText>

                    <View style={[styles.valueCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.valueIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="bulb" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.valueContent}>
                            <ThemedText style={styles.valueTitle}>Innovation</ThemedText>
                            <ThemedText variant="secondary" style={styles.valueText}>
                                We constantly push boundaries to create better learning experiences.
                            </ThemedText>
                        </View>
                    </View>

                    <View style={[styles.valueCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.valueIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="people" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.valueContent}>
                            <ThemedText style={styles.valueTitle}>Accessibility</ThemedText>
                            <ThemedText variant="secondary" style={styles.valueText}>
                                Quality education should be available to everyone, everywhere.
                            </ThemedText>
                        </View>
                    </View>

                    <View style={[styles.valueCard, { backgroundColor: theme.colors.card }]}>
                        <View style={[styles.valueIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                            <Ionicons name="star" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.valueContent}>
                            <ThemedText style={styles.valueTitle}>Excellence</ThemedText>
                            <ThemedText variant="secondary" style={styles.valueText}>
                                We maintain the highest standards in content quality and platform performance.
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    placeholder: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 20,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16,
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    teamIntro: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
    },
    teamGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    teamMemberContainer: {
        width: '50%',
        paddingHorizontal: 8,
    },
    teamMemberLeft: {},
    teamMemberRight: {},
    valueCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    valueIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    valueContent: {
        flex: 1,
    },
    valueTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    valueText: {
        fontSize: 14,
        lineHeight: 20,
    },
    bottomSpacer: {
        height: 32,
    },
});
