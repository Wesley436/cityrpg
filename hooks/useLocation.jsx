import * as Location from "expo-location";
import { useState, useEffect } from "react";

const useLocation = () => {
    const [latitude, setLatitude] = useState(0.0)
    const [longitude, setLongitude] = useState(0.0)

    const getUserLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync()

        if (status != "granted") {
            return
        }

        let position = await Location.getCurrentPositionAsync()

        if (position) {
            const { latitude, longitude } = position.coords
            setLatitude(parseFloat(latitude))
            setLongitude(parseFloat(longitude))
        }
    }

    useEffect(() => {
        getUserLocation()
    }, [])

    return { latitude, longitude }
}

export default useLocation