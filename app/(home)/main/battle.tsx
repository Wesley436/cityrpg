import { Text } from '@/components/ui/text';
import api from '@/config/api';
import Alert from '@blazejkustra/react-native-alert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { View, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image } from 'react-native';

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
    const [actionBar, setActionBar] = useState<{ entity: any; cooldown: any; }[]>([])
    const [processingAction, setProcessingAction] = useState(false)

    const scrollViewRef = useRef(null);

    const fetchBattleData = async () => {
        if (Object.keys(battle).length > 0) {
            return
        }

        // console.log("Fetching battle")

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
                        var new_action_bar = []
                        var user_action = {
                            entity: "user",
                            cooldown: 0
                        }

                        var monster_action = {
                            entity: battle.monster.title,
                            cooldown: battle.monster.delay
                        }

                        new_action_bar.push(user_action)
                        new_action_bar.push(monster_action)

                        setActionBar(new_action_bar)
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

        if (updatingBattle.logs[updatingBattle.logs.length - 1] === "You are defeated") {
            setBattle({})
            return
        }

        if (typeof battle.monster === "object") {
            updatingBattle.monster = JSON.stringify(updatingBattle.monster)
        }
        if (typeof battle.user === "object") {
            updatingBattle.user = JSON.stringify(updatingBattle.user)
        }

        await api.post("/battle/update-battle", {"battle": updatingBattle, "action_bar": actionBar})
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
        .then(async function () {
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

    const processAction = async (latest_battle, entity: { strength: string | number; }, action: { base_damage: any; action_id?: any; name?: any; base_cooldown?: any; }) => {
        setProcessingAction(true)

        var damage = 0
        if (action.base_damage) {
            damage = getActionDamage(entity.strength, action)
        }

        if (!latest_battle.logs) {
            latest_battle.logs = []
        }

        var user_health = JSON.parse(latest_battle.user.health)
        var user_defense = JSON.parse(latest_battle.user.defense)

        switch (action.action_id) {
            case 1:
                latest_battle.monster.current_health -= damage
                latest_battle.logs.push(`${battle.monster.title} took ${damage} damage from ${action.name}`)
                break;
            case 2:
                latest_battle.monster.current_health -= damage
                latest_battle.logs.push(`${battle.monster.title} took ${damage} damage from ${action.name}`)
                break;
            case 3:
                damage = getDamgeAfterDefense(damage, user_defense.current)
                user_health.current -= damage
                latest_battle.logs.push(`You took ${damage} damage from ${action.name}`)
                break;
            case 4:
                damage = getDamgeAfterDefense(damage, user_defense.current)
                user_health.current -= damage
                latest_battle.logs.push(`You took ${damage} damage from ${action.name}`)
                break;
            case 999:
                await endBattle(latest_battle)
                return
            default:
                break;
        }

        latest_battle.user.health = JSON.stringify(user_health)

        if (latest_battle.monster.current_health <= 0) {
            latest_battle.logs.push(`${battle.monster.title} is defeated`)
            Alert.alert(`${battle.monster.title} is defeated`)
            await endBattle(latest_battle)

            return
        } else if (user_health.current <= 0) {
            latest_battle.logs.push(`You are defeated`)
            Alert.alert(`You are defeated`)
            await endBattle(latest_battle)

            return
        } else {
            await nextAction(latest_battle, action.base_cooldown)
        }

        setBattle(latest_battle)
        await updateBattle(latest_battle)
    }
    
    const nextAction = async (latest_battle: { user?: any; monster?: any; }, base_cooldown: number) => {
        var current_entity = actionBar.shift()

        if (current_entity) {
            var speed = 100

            if (current_entity.entity === "user") {
                speed = JSON.parse(latest_battle.user.speed).current
            } else {
                speed = latest_battle.monster.speed
            }

            var cooldown = base_cooldown * 100 / speed
            current_entity.cooldown = cooldown

            actionBar.push(current_entity)
            actionBar.sort((a, b) => a.cooldown - b.cooldown)
        }

        const passed_cooldown = actionBar[0].cooldown

        actionBar.forEach((entity) => {
            entity.cooldown -= passed_cooldown
        })

        if (actionBar[0].entity !== "user") {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const actions = latest_battle.monster.actions
            await processAction(latest_battle, latest_battle.monster, actions[Math.floor(Math.random()*actions.length)])
        }
    }

    const ActionBox = ({item}) => {
        const onPress = async () => {
            await processAction({...battle}, battle.user, item)
        }

        var backgroundColor = "#ffffff1c"

        return (
            <TouchableOpacity disabled={item.name !== "Escape" && (processingAction || !isPlayerTurn() || JSON.parse(battle.user.health).current === 0)} onPress={onPress} key={item.id} style={{...styles.action_box, backgroundColor: backgroundColor}}>
                <Text>{item.name}</Text>
                {
                    item.base_damage
                    &&
                    <Text>{getActionDamage(battle.user.strength, item)} damage</Text>
                }
            </TouchableOpacity>
        )
    }

    const getActionDamage = (strength: number | string, action: { base_damage: number; }) => {
        var str = 0
        if (typeof strength === "string") {
            str = JSON.parse(strength).current
        } else {
            str = strength
        }

        if (action.base_damage && str) {
            return action.base_damage * str / 100
        } else {
            return 0
        }
    }

    const getDamgeAfterDefense = (damage: number, defense: number) => {
        return parseFloat(
            (
                damage
                * (1 - (defense / (defense + 200)))
            )
            .toFixed(2)
        )
    }

    const getActionList = () => {
        const actions = []
        if (battle.user.weapon) {
            const weapon = JSON.parse(battle.user.weapon)
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
        return actionBar[0].entity === "user"
    }

    const getMonsterImagePath = () => {
        switch(battle.monster.title) {
            case "Slime":
                return require("../../../assets/images/slime.png")
            case "Wolf":
                return require("../../../assets/images/wolf.png")
            case "Bear":
                return require("../../../assets/images/bear.png")
            default:
                return require("../../../assets/images/slime.png")
        }
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
                            <Text>{(JSON.parse(battle.user.health).current).toFixed(2)} / {JSON.parse(battle.user.health).currentMax}</Text>
                            <Text></Text>
                            <View style={{flex: 1, flexDirection: "row"}}>
                                <View>
                                    <Text>{battle.monster.title}</Text>
                                    <Text>{battle.monster.current_health} / {battle.monster.max_health}</Text>
                                </View>
                                <Image source={
                                    getMonsterImagePath()
                                }
                                style={{ width: 100, height: 100 }}
                                />
                            </View>

                            <Text></Text>
                            <Text></Text>

                                <Text style={{fontSize: 24}}>{isPlayerTurn() ? "Your Turn": "Enemy Turn"}</Text>
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