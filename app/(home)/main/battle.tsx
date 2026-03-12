import { Text } from '@/components/ui/text';
import api from '@/config/api';
import Alert from '@blazejkustra/react-native-alert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';

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
    width: "50%",
    paddingHorizontal: 5
  },
  action_section: {
    height: "66.66%",
    borderColor: "#ffffffa9",
    borderTopWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    // justifyContent: "space-evenly"
  },
  action_box: {
    width: "45%",
    aspectRatio: 16/9,
    borderRadius: 20,
    padding: 10,
    margin: 5
  },
});

const BattleScreen = () => {
    const router = useRouter()
    
    const [battle, setBattle] = useState({})
    const [actionBar, setActionBar] = useState([])
    const [processingAction, setProcessingAction] = useState(false)

    const scrollViewRef = useRef(null);

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

                    if (typeof battle.monster === "string") {
                        battle.monster = JSON.parse(battle.monster)
                    }

                    if (typeof battle.user === "string") {
                        battle.user = JSON.parse(battle.user)
                    }

                    if (!battle.monster.current_health) {
                        battle.monster.current_health = battle.monster.max_health
                    }

                    if (battle.action_bar) {
                        setActionBar(battle.action_bar)
                    } else {
                        
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

            return () => {
                setBattle({})
            };
        }, [])
    );

    const updateBattle = async (battle) => {
        const updatingBattle = {...battle}

        if (typeof battle.monster === "object") {
            updatingBattle.monster = JSON.stringify(updatingBattle.monster)
        }
        if (typeof battle.user === "object") {
            updatingBattle.user = JSON.stringify(updatingBattle.user)
        }

        await api.post("/battle/update-battle", {"battle": updatingBattle})
        .catch(function (error) {
            if (axios.isAxiosError(error)) {
                Alert.alert(error.response?.data.error)
            }
        })
        .finally(() => {
            setProcessingAction(false)
        })
    }

    const endBattle = async (battle) => {
        await api.post("/battle/end-battle", {"battle": battle})
        .then(function () {
            router.replace("/main/map")
        })
        .catch(function (error) {
            if (axios.isAxiosError(error)) {
                Alert.alert(error.response?.data.error)
            }
        })
        .finally(() => {
            setProcessingAction(false)
        })
    }

    const processAction = async (action) => {
        setProcessingAction(true)
        const latest_battle = {...battle}

        var damage = 0
        if (action.base_damage) {
            damage = getActionDamage(action)
        }

        if (!latest_battle.logs) {
            latest_battle.logs = []
        }

        switch (action.action_id) {
            case 1:
                latest_battle.monster.current_health -= damage
                latest_battle.logs.push(`${battle.monster.title} took ${damage} damage from ${action.name}`)
                break;
            case 2:
                latest_battle.monster.current_health -= damage
                latest_battle.logs.push(`${battle.monster.title} took ${damage} damage from ${action.name}`)
                break;
            case 999:
                await endBattle(latest_battle)
                return
            default:
                break;
        }

        if (latest_battle.monster.current_health < 0) {
            latest_battle.logs.push(`${battle.monster.title} is defeated`)
            await endBattle(latest_battle)
        } else if (latest_battle.user.current_health < 0) {
            latest_battle.logs.push(`You are defeated`)
            await endBattle(latest_battle)
        } else {
            setBattle(latest_battle)
            await updateBattle(latest_battle)
        }
    }

    const ActionBox = ({item}) => {
        const onPress = async () => {
            await processAction(item)
        }

        var backgroundColor = "#ffffff1c"

        return (
            <TouchableOpacity disabled={processingAction} onPress={onPress} key={item.id} style={{...styles.action_box, backgroundColor: backgroundColor}}>
                <Text>{item.name}</Text>
                {
                    item.base_damage
                    &&
                    <Text>{getActionDamage(item)}</Text>
                }
            </TouchableOpacity>
        )
    }

    const getActionDamage = (action) => {
        if (action.base_damage && battle.user?.strength) {
            const strength = JSON.parse(battle.user?.strength)
            return action.base_damage * strength.current / 100
        } else {
            return 0
        }
    }

    const getActionList = () => {
        const actions = []
        if (battle.user?.weapon) {
            const weapon = JSON.parse(battle.user?.weapon)
            actions.push(...weapon.actions)
        }

        const escape = {
            name: "Escape",
            action_id: 999,
            base_cooldown: 0
        }

        actions.push(escape)

        return actions
    }

    const isPlayerTurn = () => {
        return true
    }

    return (
        <View style={styles.container}>
            {
                Object.keys(battle).length > 0
                ?
                <>
                    <View style={styles.battle_section}>
                        <View style={styles.half_battle_section}>
                            <Text>Your Health</Text>
                            <Text>{JSON.parse(battle.user?.health)?.current} / {JSON.parse(battle.user?.health)?.currentMax}</Text>
                            <Text></Text>
                            <Text>{battle.monster?.title}</Text>
                            <Text>{battle.monster?.current_health} / {battle.monster?.max_health}</Text>

                            <Text></Text>
                            <Text></Text>

                                <Text style={{fontSize: 32}}>{isPlayerTurn() ? "Your Turn": "Enemy Turn"}</Text>
                        </View>
                        <ScrollView
                            style={styles.half_battle_section}
                            ref={scrollViewRef}
                            onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                        >
                            {
                                battle.logs
                                &&
                                battle.logs.map((log, i) => 
                                    <Text key={i}>{log}</Text>
                                )
                            }
                        </ScrollView>
                    </View>

                    <View style={styles.action_section}>
                        <FlatList data={getActionList()} numColumns={2} renderItem={ActionBox} keyExtractor={item => item.id} columnWrapperStyle={{ justifyContent: "space-evenly" }}/>
                    </View>
                </>
                :
                <View style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
                    <Text>You are not in a battle</Text>
                </View>
            }
        </View>
    );
}

export default BattleScreen;