import { View, ScrollView } from "react-native";
import SignUpForm from "../../components/sign-up-form";

const SignUpScreen = () => {
    return (
        <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
        keyboardDismissMode="interactive">
            <View className="w-full max-w-sm">
                <SignUpForm/>
            </View>
        </ScrollView>
    );
}

export default SignUpScreen;