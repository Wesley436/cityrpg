import { View, ScrollView } from "react-native";
import SignInForm from "../../components/sign-in-form";

const SignInScreen = () => {
    return (
        <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="sm:flex-1 items-center justify-center p-4 py-8 sm:py-4 sm:p-6 mt-safe"
        keyboardDismissMode="interactive">
            <View className="w-full max-w-sm">
                <SignInForm/>
            </View>
        </ScrollView>
    );
}

export default SignInScreen;