import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";

// const apiUrl = "http://ec2-54-235-233-32.compute-1.amazonaws.com"
const apiUrl = "http://192.168.0.154:8080"
// const apiUrl = "http://localhost:8080"

const router = useRouter();
const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use(
    async (request) => {
        const uid = JSON.parse(await AsyncStorage.getItem('uid'))
        const id_token = JSON.parse(await AsyncStorage.getItem('id_token'))
        if (id_token) {
            request.headers.uid = uid
        }
        if (id_token) {
            request.headers.Authorization = `Bearer ${id_token}`
        }

        return request
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const uid = JSON.parse(await AsyncStorage.getItem('uid'))
        const refresh_token = JSON.parse(await AsyncStorage.getItem('refresh_token'))

        try {
            const response = await api.post('/auth/refresh-token', { uid: uid, refresh_token: refresh_token });
            const id_token = response.headers["id_token"]

            await AsyncStorage.setItem('uid', JSON.stringify(response.headers["uid"]));
            await AsyncStorage.setItem('id_token', JSON.stringify(response.headers["id_token"]));
            await AsyncStorage.setItem('refresh_token', JSON.stringify(response.headers["refresh_token"]));

            api.defaults.headers.common['Authorization'] = `Bearer ${id_token}`
            originalRequest.headers.Authorization = `Bearer ${id_token}`

            return api(originalRequest)
        } catch (error) {
            console.error('Token refresh failed:', error);
            await AsyncStorage.removeItem('uid');
            await AsyncStorage.removeItem('id_token');
            await AsyncStorage.removeItem('refresh_token');
            
            router.navigate("/sign-up")
            Alert.alert("Your session has expired, please login again.")
            return;
        }
    } else {
        return Promise.reject(error);
    }
  }
);

export default api;