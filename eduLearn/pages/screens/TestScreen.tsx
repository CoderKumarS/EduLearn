import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TestScreen: React.FC = () => {
    console.log('TEST SCREEN - Rendering');
    return (
        <View style={styles.container}>
            <Text style={styles.text}>✅ Test Screen Works!</Text>
            <Text style={styles.subtext}>If you see this, navigation is working correctly.</Text>
            <Text style={styles.subtext}>The issue is likely in LoginScreen or its components.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 20,
        textAlign: 'center',
    },
    subtext: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 10,
        textAlign: 'center',
    },
});
