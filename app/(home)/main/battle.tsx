import { Text } from '@/components/ui/text';
import api from '@/config/api';
import Alert from '@blazejkustra/react-native-alert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, StyleSheet, ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  battle_section: {
    height: "33.33%",
    flex: 1,
    flexDirection: "row"
  },
  half_battle_section: {
    width: "50%"
  },
  action_section: {
    height: "66.66%",
    borderColor: "#ffffffa9",
    borderTopWidth: 1
  },
});

const BattleScreen = () => {
    const [battle, setBattle] = useState({})
    const [actionBar, setActionBar] = useState([])

    const fetchBattleData = async () => {
        if (Object.keys(battle).length > 0) {
            return
        }

        console.log("Fetching battle")

        try {
            const uidValue = await AsyncStorage.getItem('uid')
            if (uidValue) {
                await api.get(`/battle/${JSON.parse(uidValue)}`)
                .then((response) => {
                    const battle = response?.data
                    battle.monster = JSON.parse(battle.monster)
                    battle.user = JSON.parse(battle.user)

                    if (!battle.monster.current_health) {
                        battle.monster.current_health = battle.monster.max_health
                    }

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
        <>
            <View style={styles.container}>
                <View style={styles.battle_section}>
                    <ScrollView style={styles.half_battle_section}>

                    </ScrollView>
                    <View style={styles.half_battle_section}>
                        <Text>{battle.monster?.title}</Text>
                        <Text>{battle.monster?.current_health} / {battle.monster?.max_health}</Text>
                    </View>
                </View>

                <View style={styles.action_section}>
                </View>
            </View>
        </>
    );
}

export default BattleScreen;