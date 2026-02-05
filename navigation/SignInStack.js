import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createNativeStackNavigator();

const SignInStack = () => {
    return (
        <Stack.Navigator initialRouteName="SignInScreen">
            <Stack.Screen
                name="SignInScreen"
                component={SignInScreen}
                options={{
                    headerShown: false
                }} />
            <Stack.Screen
                name="SignUpScreen"
                component={SignUpScreen}
                options={{
                    headerShown: false
                }} />
        </Stack.Navigator>
    )
}

export default SignInStack;