import { Text, View, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

export default function Index() {
  const testApi = async () => {
      const response = await axios.get("http://ec2-54-235-233-32.compute-1.amazonaws.com/");
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
