import { Text } from '@/components/ui/text';
import api from '@/config/api';
import Alert from '@blazejkustra/react-native-alert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';

const BattleScreen = () => {
    const [battle, setBattle] = useState({})
    const [actionBar, setActionBar] = useState([])

    const fetchBattleData = async () => {
        console.log("Fetching battle")
        try {
            const uidValue = await AsyncStorage.getItem('uid')
            if (uidValue) {
                await api.get(`/battle/${JSON.parse(uidValue)}`)
                .then((response) => {
                    const battle = response?.data
                    console.log(battle)
                    setBattle(battle)
                })
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching battle data:', error);
                Alert.alert(error.response?.data.error)
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBattleData()
        }, [])
    );

    return (
        <Text className="text-gray-500">
            Battle
        </Text>
    );
}

export default BattleScreen;