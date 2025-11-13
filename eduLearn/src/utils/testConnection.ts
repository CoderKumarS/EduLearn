import axios from 'axios';
import config from '../constants/config';

export const testBackendConnection = async (): Promise<void> => {
    console.log('\n=== Testing Backend Connection ===');
    console.log('Testing URL:', config.apiAuthUrl);

    try {
        // Test 1: Check if server is reachable
        console.log('\n1. Testing server reachability...');
        const response = await axios.get(`${config.apiBaseUrl}/`, {
            timeout: 5000,
        });
        console.log('✅ Server is reachable!');
        console.log('Response status:', response.status);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (!error.response) {
                console.log('❌ Cannot reach server - Network error');
                console.log('This usually means:');
                console.log('  1. Backend server is not running');
                console.log('  2. Wrong IP address in .env file');
                console.log('  3. Firewall blocking connection');
                console.log('  4. Device and computer not on same network');
            } else {
                console.log('✅ Server responded (even if with error)');
                console.log('Status:', error.response.status);
            }
        }
    }

    try {
        // Test 2: Check auth endpoint
        console.log('\n2. Testing auth endpoint...');
        await axios.get(`${config.apiAuthUrl}/token/`);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 405) {
                console.log('✅ Auth endpoint exists (Method not allowed is expected for GET)');
            } else if (!error.response) {
                console.log('❌ Cannot reach auth endpoint');
            } else {
                console.log('Auth endpoint status:', error.response.status);
            }
        }
    }

    console.log('\n=== Connection Test Complete ===\n');
};
