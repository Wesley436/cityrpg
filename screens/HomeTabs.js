// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import MapScreen from "./MapScreen";
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const Tab = createBottomTabNavigator()

// const HomeTabs = () => {
//     return (
//         <Tab.Navigator initialRouteName="Map"
//             screenOptions={(screen) => {
//                 let iconName = ''
//                 switch (screen.route.name) {
//                     case "Recipes":
//                         iconName = 'newspaper-outline'
//                         break;
//                     case "Add Ingredients":
//                         iconName = 'add-outline'
//                         break;
//                     case "Saved Recipes":
//                         iconName = 'bookmark-outline'
//                         break;
//                     case "Ingredients":
//                         iconName = 'home-outline'
//                         break;
//                     default:
//                         iconName = 'newspaper-outline'
//                         break;
//                 }

//                 return {
//                     headerShown: false,
//                     tabBarIcon: ({ focused, color, size }) => {
//                         return <Ionicons name={iconName} size={size} color={color}/>;
//                     },
//                     tabBarActiveTintColor: 'tomato',
//                     tabBarInactiveTintColor: 'gray',
//                 }
//             }}
//         >
//             <Tab.Screen
//                 name="Map"
//                 component={MapScreen}
//                 options={{
//                     headerShown: false
//                 }}
//                 />
//         </Tab.Navigator>
//     );
// }

// export default HomeTabs;