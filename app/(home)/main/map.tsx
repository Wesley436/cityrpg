import { Text } from '@/components/ui/text';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../config/api';
import { useRouter } from 'expo-router';

const MapScreen = () => {
    const router = useRouter()

    const [userData, setUserData] = useState({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const uidValue = await AsyncStorage.getItem('uid')
                if (uidValue) {
                    await api.get(`/user/${JSON.parse(uidValue)}`)
                    .then(async (response) => {
                        setUserData(response?.data || {})
                    })
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUserData();
    }, []);

    return (
        <Text className="text-gray-500" onPress={async () => {
            await AsyncStorage.removeItem('uid');
            await AsyncStorage.removeItem('id_token');
            await AsyncStorage.removeItem('refresh_token');
            
            router.navigate("/sign-in")
        }}>
            {JSON.stringify(userData)}
        </Text>
    );
}

export default MapScreen;