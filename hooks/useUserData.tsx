import { useState, useEffect, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/config/api';
import Alert from '@blazejkustra/react-native-alert';
import axios from "axios";
import * as Notifications from 'expo-notifications';

const INTERACTION_RANGE = 400
const BASE_HP = 100
const BASE_STRENGTH = 100
const BASE_DEFENSE = 100
const BASE_SPEED = 100
const SECONDS_PER_HEALTH_REGNERATION = 1

const calculateEquipmentStrength = (user: { weapon: { strength: any; }; }) => {
    var strengthEquipment = 0
    if (user.weapon?.strength) {
        strengthEquipment += user.weapon.strength
    }

    return strengthEquipment
}

const calculateEquipmentDefense = (user: { chestplate: { defense: any; }; }) => {
    var defenseEquipment = 0
    if (user.chestplate?.defense) {
        defenseEquipment += user.chestplate.defense
    }

    return defenseEquipment
}

const calculateEquipmentSpeed = (user: { boots: { speed: any; }; }) => {
    var speedEquipment = 0
    if (user.boots?.speed) {
        speedEquipment += user.boots.speed
    }

    return speedEquipment
}

const calculateStats = async (user: any) => {
    const healthBefore = user.health ? JSON.parse(user.health) : null

    const statsBefore = {
        health: user.health ? JSON.parse(user.health) : null,
        strength: user.strength ? JSON.parse(user.strength) : null,
        defense: user.defense ? JSON.parse(user.defense) : null,
        speed: user.speed ? JSON.parse(user.speed) : null
    }

    const statusEffectsObject = user.status_effects ? user.status_effects : {}
    var statusEffects = Object.keys(statusEffectsObject).map(function (key) {
        return statusEffectsObject[key];
    });

    var maxHealthEquipment = 0
    var maxHealthAdditional = 0
    var maxHealth = BASE_HP + maxHealthEquipment + maxHealthAdditional

    var currentHealth = healthBefore?.current === null ? maxHealth : healthBefore?.current
    var lastRegeneratedAt = healthBefore?.lastRegeneratedAt === null ? Date.now() : healthBefore?.lastRegeneratedAt
    user.health = {
        current: currentHealth,
        maxBase: BASE_HP,
        maxEquipment: maxHealthEquipment,
        maxAdditional: maxHealthAdditional,
        maxBeforeAdditional: BASE_HP + maxHealthEquipment,
        currentMax: maxHealth,
        lastRegeneratedAt: lastRegeneratedAt
    }

    if (!user.in_battle) {
        if (lastRegeneratedAt) {
            var secondsSinceLastRegeneration = (Date.now() - lastRegeneratedAt) / 1000
            if (secondsSinceLastRegeneration >= SECONDS_PER_HEALTH_REGNERATION) {
                var healthRegenerated = parseFloat((secondsSinceLastRegeneration / SECONDS_PER_HEALTH_REGNERATION).toFixed(2))
                user.health.current = Math.min(user.health.currentMax, user.health.current + healthRegenerated)
                user.health.lastRegeneratedAt = Date.now()
            }
        }

        if (user.health.current < user.health.currentMax && user.enable_notifications) {
            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldPlaySound: false,
                    shouldSetBadge: false,
                    shouldShowBanner: true,
                    shouldShowList: true,
                }),
            });

            const timeUntilFullHealth =
                SECONDS_PER_HEALTH_REGNERATION
                * parseInt(
                    (user.health.currentMax - user.health.current).toFixed(0)
                )

            await Notifications.cancelAllScheduledNotificationsAsync()
            Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Your health has regenerated to full.'
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    seconds: timeUntilFullHealth + SECONDS_PER_HEALTH_REGNERATION,
                },
            });
        }
    }

    var strengthEquipment = calculateEquipmentStrength(user)
    const strengthEffects = statusEffects.filter((e: { type: string }) => e.type == "strength")
    var strengthAdditional = strengthEffects.reduce((a, e) => a + e.amount, 0)
    user.strength = {
        base: BASE_STRENGTH,
        equipment: strengthEquipment,
        additional: strengthAdditional,
        currentBeforeAdditional: BASE_STRENGTH + strengthEquipment,
        current: BASE_STRENGTH + strengthEquipment + strengthAdditional
    }

    var defenseEquipment = calculateEquipmentDefense(user)
    const defenseEffects = statusEffects.filter((e: { type: string }) => e.type == "defense")
    var defenseAdditional = defenseEffects.reduce((a, e) => a + e.amount, 0)
    user.defense = {
        base: BASE_DEFENSE,
        equipment: defenseEquipment,
        additional: defenseAdditional,
        currentBeforeAdditional: BASE_DEFENSE + defenseEquipment,
        current: BASE_DEFENSE + defenseEquipment + defenseAdditional
    }

    var speedEquipment = calculateEquipmentSpeed(user)
    const speedEffects = statusEffects.filter((e: { type: string }) => e.type == "speed")
    var speedAdditional = speedEffects.reduce((a, e) => a + e.amount, 0)
    user.speed = {
        base: BASE_SPEED,
        equipment: speedEquipment,
        additional: speedAdditional,
        currentBeforeAdditional: BASE_SPEED + speedEquipment,
        current: BASE_SPEED + speedEquipment + speedAdditional
    }

    const statsAfter = {
        health: user.health,
        strength: user.strength,
        defense: user.defense,
        speed: user.speed
    }

    if (JSON.stringify(statsBefore) !== JSON.stringify(statsAfter)) {
        console.log("Updating stats")
        await api.post("/user/update-stats", statsAfter)
        .catch(function (error) {
            if (axios.isAxiosError(error)) {
                Alert.alert(error.response?.data.error)
            }
        })
    }
}

const useUserData = () => {
    const [userData, setUserData] = useState({})
    const [inventory, setInventory] = useState<any>([])

    const updateInventory = (inventory: string[]) => {
        const items: any[] = []
        inventory?.forEach((itemString: string) => {
            const item = JSON.parse(itemString)
            items.push(item)
        });

        setInventory(items)
        return items
    }

    const getInteractionRange = () => {
        var range = INTERACTION_RANGE

        if (userData?.helmet) {
            const helmet = userData.helmet
            switch (helmet.rarity) {
                case "Common":
                    range += 50
                    break;
                case "Uncommon":
                    range += 100
                    break;
                case "Rare":
                    range += 150
                    break;
                case "Epic":
                    range += 200
                    break;
                default:
                    break;
            }
        }

        return range
    }

    const updateUserData = async (user: any) => {
        if (user) {
            for (const key of ["helmet", "chestplate", "boots", "weapon", "shield"]) {
                if (user[key]) {
                    user[key] = JSON.parse(user[key])
                }
            }

            const items = updateInventory(user.inventory)
            user.inventory = items

            await calculateStats(user)
        }

        setUserData(user || {})
        
        if (user.enable_notifications) {
            AsyncStorage.setItem('enable_notifications', JSON.stringify(user.enable_notifications))
        }
    }

    const fetchUserData = async () => {
        // console.log("Fetching userData")
        try {
            const uidValue = await AsyncStorage.getItem('uid')
            if (uidValue) {
                await api.get(`/user/${JSON.parse(uidValue)}`)
                .then(async (response) => {
                    const user = response?.data
                    await updateUserData(user)
                })
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching user data:', error);
                Alert.alert(error.response?.data.error)
            }
        }
    };

    return { userData, updateUserData, inventory, setInventory, fetchUserData, updateInventory, getInteractionRange }
}

export default useUserData