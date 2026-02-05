import axios from "axios";
import { useRouter } from "expo-router";

// const apiUrl = "http://ec2-54-235-233-32.compute-1.amazonaws.com"
const apiUrl = "http://localhost:8080"
const router = useRouter();
const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use(
    async (config) => {
        return config
    },
    (error) => Promise.reject(error)
)

export default api;