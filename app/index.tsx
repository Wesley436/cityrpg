import { Text, View, TouchableOpacity, Alert, ScrollView } from "react-native";
import { apiUrl } from "../config/config.js"
import axios from "axios";
import { SignInForm } from "@/components/sign-in-form";

export default function Index() {
  const testApi = async () => {
      const response = await axios.get(apiUrl);
      Alert.alert(response.data);
  };


  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
      keyboardDismissMode="interactive">
      <View className="w-full max-w-sm">
        <SignInForm />
      </View>
    </ScrollView>
  );
}
