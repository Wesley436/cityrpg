import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "./sign-in";
import SignUpScreen from "./sign-up";

const HomeStack = createNativeStackNavigator();

const Index = () => {
  return (
    <HomeStack.Navigator initialRouteName="SignInScreen">
        <HomeStack.Screen
            name="SignInScreen"
            component={SignInScreen}
            options={{
                headerShown: false
            }}
        />
        <HomeStack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={{
                headerShown: false
            }}
        />
  </HomeStack.Navigator>
  )
}

export default Index;