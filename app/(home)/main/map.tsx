import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../config/api';
import MapView from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import useLocation from '../../../hooks/useLocation';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

const MapScreen = () => {
    const [userData, setUserData] = useState({});

    const {latitude, longitude} = useLocation();

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
        <View style={styles.container}>
            <MapView
                region={{
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                style={styles.map}
            />
        </View>
    );
}

export default MapScreen;