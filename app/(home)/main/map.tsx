import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../config/api';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import AnimatedMapRegion from 'react-native-maps/lib/AnimatedRegion';
import * as Location from "expo-location";
import Alert from '@blazejkustra/react-native-alert';
import axios from "axios";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

const INTERACTION_RANGE = 200

function deg2rad(deg: number) {
    return deg * (Math.PI/180)
}

function distanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number) {
    var earthRadius = 6371000;
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1); 
    var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2) 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var distance = earthRadius * c;
    return distance;
}

const MapScreen = () => {
    const [userData, setUserData] = useState({})
    const [currentLatitude, setCurrentLatitude] = useState(0.0)
    const [currentLongitude, setCurrentLongitude] = useState(0.0)
    const [currentRegion, setCurrentRegion] = useState<Region | AnimatedMapRegion | null>(null)
    const [refreshTimeout,  setRefreshTimeout] = useState<number | null>(null)

    const [region, setRegion] = useState({
        latitude: 0.0,
        longitude: 0.0,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    });

    const [interactables, setInteractables] = useState([])

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
        const getCurrentLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const position = await Location.getCurrentPositionAsync({});

            if (position) {
                const { latitude, longitude } = position.coords
                setCurrentLatitude(latitude)
                setCurrentLongitude(longitude)
                setRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0922,
                })
            }
        };
        getCurrentLocation();
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

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

        var currLatitude = currentLatitude
        var currLongitude = currentLongitude
        if (!currLatitude || ! currLongitude) {
            const position = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = position.coords
            currLatitude = latitude
            currLongitude = longitude
            setCurrentLatitude(latitude)
            setCurrentLongitude(longitude)
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
            // console.log("Top left: " + topLeftLatitude + ", " + topLeftLongitude)
            // console.log("Top right: " + topRightLatitude + ", " + topRightLongitude)
            // console.log("Bottom left: " + bottomLeftLatitude + ", " + bottomLeftLongitude)
            // console.log("Bottom right: " + bottomRightLatitude + ", " + bottomRightLongitude)

            await api.post('/map/load-region', {
                "current_latitude": currLatitude,
                "current_longitude": currLongitude,
                "top_left_latitude": topLeftLatitude,
                "top_left_longitude": topLeftLongitude,
                "top_right_latitude": topRightLatitude,
                "top_right_longitude": topRightLongitude,
                "bottom_left_latitude": bottomLeftLatitude,
                "bottom_left_longitude": bottomLeftLongitude,
                "bottom_right_latitude": bottomRightLatitude,
                "bottom_right_longitude": bottomRightLongitude
            })
            .then(function (response) {
                // console.log(response?.data)
                if (response?.data) {
                    setInteractables(response?.data.interactables)
                }
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
                initialRegion={region}
                region={region}
                style={styles.map}
                minZoomLevel={13}
                onRegionChangeComplete={onRegionChangeComplete}
            >
                <Circle
                    center = {{
                        latitude: currentLatitude,
                        longitude: currentLongitude
                    }}
                    radius = { INTERACTION_RANGE }
                    strokeWidth = { 2 }
                    strokeColor = { '#00349c' }
                    fillColor = { 'rgba(233, 240, 255, 0.18)' }
                />
                <Marker coordinate={{
                    latitude: currentLatitude,
                    longitude: currentLongitude
                }}>
                    <MaterialCommunityIcons name="human-child" size={48} color={"#59ff59"} />
                </Marker>
                {
                    interactables.map((interactable) => {
                        var icon
                        switch (interactable.type) {
                            case "event":
                                icon = <MaterialIcons name="question-mark" size={32} color="#ffffff" />
                                break;
                            case "monster":
                                icon = <MaterialCommunityIcons name="skull" size={32} color="#dd6969" />
                                break;
                            case "item":
                                icon = <MaterialCommunityIcons name="treasure-chest" size={32} color="#fff23c" />
                                break;
                            case "equipment":
                                icon = <MaterialCommunityIcons name="sword" size={32} color={"#00d9ff"} />
                                break;
                            default:
                                icon = <Feather name="box" size={32} color="black" />
                        }

                        return <Marker
                                key={interactable.id}
                                coordinate={{
                                    latitude: interactable.latitude,
                                    longitude: interactable.longitude
                                }}
                                onPress={() => {
                                    if (distanceBetweenPoints(interactable.latitude, interactable.longitude, currentLatitude, currentLongitude) < INTERACTION_RANGE) {
                                        Alert.alert(interactable.type, "In range")
                                    } else {
                                        Alert.alert(interactable.type, "You are too far from this location")
                                    }
                                }}>
                                    {icon}
                                </Marker>
                    })
                }
            </MapView>
        </View>
    );
}

export default MapScreen;