import { useState, useEffect, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/config/api';
import Alert from '@blazejkustra/react-native-alert';
import axios from "axios";

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
    }

    const fetchUserData = async () => {
        console.log("Fetching userData")
        try {
            const uidValue = await AsyncStorage.getItem('uid')
            if (uidValue) {
                await api.get(`/user/${JSON.parse(uidValue)}`)
                .then(async (response) => {
                    const user = response?.data
                    setUserData(user || {})
                    // console.log(user)
                    if (user) {
                        updateInventory(user.inventory)
                    }
                })
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching user data:', error);
                Alert.alert(error.response?.data.error)
            }
        }
    };

    return { userData, setUserData, inventory, setInventory, fetchUserData, updateInventory }
}

export default useUserData