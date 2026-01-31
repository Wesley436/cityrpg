import { Text, View, TouchableOpacity, Alert } from "react-native";
import { apiUrl } from "../config/config.js"
import axios from "axios";

export default function Index() {
  const testApi = async () => {
      const response = await axios.get(apiUrl);
      Alert.alert(response.data);
  };


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TouchableOpacity onPress={testApi}>
          <Text>Test Node.js Endpoint</Text>
      </TouchableOpacity>
    </View>
  );
}
