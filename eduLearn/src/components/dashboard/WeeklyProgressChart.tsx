import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 32;
const CHART_HEIGHT = 200;
const BAR_WIDTH = (CHART_WIDTH - 80) / 7;

interface WeeklyProgressChartProps {
    data: {
        date: string;
        minutesLearned: number;
    }[];
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
    data,
}) => {
    const { theme } = useTheme();

    // Find max value for scaling
    const maxMinutes = Math.max(...data.map((d) => d.minutesLearned), 1);

    // Get day labels
    const getDayLabel = (dateString: string): string => {
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                },
            ]}
        >
            <Text
                style={[
                    styles.title,
                    theme.typography.h3,
                    { color: theme.colors.text },
                ]}
            >
                Weekly Progress
            </Text>
            <Text
                style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary },
                ]}
            >
                Learning minutes per day
            </Text>

            <View style={styles.chartContainer}>
                <View style={styles.barsContainer}>
                    {data.map((item, index) => {
                        const barHeight =
                            (item.minutesLearned / maxMinutes) * (CHART_HEIGHT - 60);

                        return (
                            <View key={index} style={styles.barWrapper}>
                                <View style={styles.barColumn}>
                                    {item.minutesLearned > 0 && (
                                        <Text
                                            style={[
                                                styles.valueLabel,
                                                { color: theme.colors.textSecondary },
                                            ]}
                                        >
                                            {item.minutesLearned}
                                        </Text>
                                    )}
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: Math.max(barHeight, 4),
                                                backgroundColor:
                                                    item.minutesLearned > 0
                                                        ? theme.colors.primary
                                                        : theme.colors.border,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text
                                    style={[
                                        styles.dayLabel,
                                        { color: theme.colors.textSecondary },
                                    ]}
                                >
                                    {getDayLabel(item.date)}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            { backgroundColor: theme.colors.primary },
                        ]}
                    />
                    <Text
                        style={[
                            styles.legendText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Active days
                    </Text>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            { backgroundColor: theme.colors.border },
                        ]}
                    />
                    <Text
                        style={[
                            styles.legendText,
                            { color: theme.colors.textSecondary },
                        ]}
                    >
                        Inactive days
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    title: {
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    chartContainer: {
        height: CHART_HEIGHT,
        justifyContent: 'flex-end',
    },
    barsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: CHART_HEIGHT - 40,
    },
    barWrapper: {
        alignItems: 'center',
        width: BAR_WIDTH,
    },
    barColumn: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        flex: 1,
        width: '100%',
    },
    bar: {
        width: BAR_WIDTH - 8,
        borderRadius: 4,
        minHeight: 4,
    },
    valueLabel: {
        fontSize: 10,
        marginBottom: 4,
        fontWeight: '600',
    },
    dayLabel: {
        fontSize: 12,
        marginTop: 8,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16,
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
    },
});
