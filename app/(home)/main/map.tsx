import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../config/api';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import AnimatedMapRegion from 'react-native-maps/lib/AnimatedRegion';
import * as Location from "expo-location";
import Alert from '@blazejkustra/react-native-alert';
import axios from "axios";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
    const [userData, setUserData] = useState({})
    const [currentLatitude, setCurrentLatitude] = useState(0.0)
    const [currentLongitude, setCurrentLongitude] = useState(0.0)
    const [currentRegion, setCurrentRegion] = useState<Region | AnimatedMapRegion | null>(null)
    const [refreshTimeout,  setRefreshTimeout] = useState<number | null>(null)

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

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const position = await Location.getCurrentPositionAsync({});

            if (position) {
                const { latitude, longitude } = position.coords
                setCurrentLatitude(latitude)
                setCurrentLongitude(longitude)
            }

            const liveLocationUpdate = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Highest,
                    timeInterval: 10000,
                    distanceInterval: 5,
                },
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCurrentLatitude(latitude)
                    setCurrentLongitude(longitude)
                }
            );

            return () => liveLocationUpdate.remove();
        })();
    }, []);

    useEffect(() => {
        console.log("Starting interval to refreshing map");
        refreshMap(null)

        const interval = setInterval(() => {
            refreshMap(currentRegion)
        }, 30000);

        return () => {
            console.log("Clearing interval to refreshing map");
            clearInterval(interval);
        };
    }, []);

    function onRegionChangeComplete(region: Region | AnimatedMapRegion | null) {
        setCurrentRegion(region)
        refreshMap(region)
    }

    async function refreshMap(region: Region | AnimatedMapRegion | null) {
        if (!region) {
            if (!currentRegion) {
                const position = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = position.coords
                region = {
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }
                setCurrentRegion(region)
            } else {
                region = currentRegion
            }
        }
        
        if (region && !refreshTimeout) {
            console.log("Refreshing map");
            const timeout = setTimeout(function() {setRefreshTimeout(null)}, 5000)
            setRefreshTimeout(timeout)
            const lat = region.latitude
            const long = region.longitude
            const latDelta = region.latitudeDelta
            const longDelta = region.longitudeDelta
            const topLeftLatitude = lat + latDelta/2
            const topLeftLongitude = long - longDelta/2
            const topRightLatitude = lat + latDelta/2
            const topRightLongitude = long + longDelta/2
            const bottomLeftLatitude = lat - latDelta/2
            const bottomLeftLongitude = long - longDelta/2
            const bottomRightLatitude = lat - latDelta/2
            const bottomRightLongitude = long + longDelta/2
            console.log("Top left: " + topLeftLatitude + ", " + topLeftLongitude)
            console.log("Top right: " + topRightLatitude + ", " + topRightLongitude)
            console.log("Bottom left: " + bottomLeftLatitude + ", " + bottomLeftLongitude)
            console.log("Bottom right: " + bottomRightLatitude + ", " + bottomRightLongitude)

            await api.post('/map/load-region', {
                "top_left_latitude": topLeftLatitude,
                "top_left_longitude": topLeftLongitude,
                "top_right_latitude": topRightLatitude,
                "top_right_longitude": topRightLongitude,
                "bottom_left_latitude": bottomLeftLatitude,
                "bottom_left_longitude": bottomLeftLongitude,
                "bottom_right_latitude": bottomRightLatitude,
                "bottom_right_longitude": bottomRightLongitude
            }
            )
            .then(async function (response) {
                
            })
            .catch(function (error) {
                if (axios.isAxiosError(error)) {
                    console.log(error.response?.data.error)
                }
            })
        }
    }

    return (
        <View style={styles.container}>
            <MapView
                region={{
                    latitude: currentLatitude,
                    longitude: currentLongitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                style={styles.map}
                minZoomLevel={13}
                onRegionChangeComplete={onRegionChangeComplete}
            >
                <Marker coordinate={{latitude: currentLatitude,
                    longitude: currentLongitude}}>
                        <MaterialCommunityIcons name="human-child" size={32} color={"lightgreen"} />
                </Marker>
            </MapView>
        </View>
    );
}

export default MapScreen;