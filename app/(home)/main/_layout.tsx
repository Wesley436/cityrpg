import { Tabs } from "expo-router";
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MainLayout() {
  const router = useRouter()

  return (
    <Tabs screenOptions = {
      ({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let color = focused ? "white" : "gray";

          switch (route.name) {
            case "battle":
              return <MaterialCommunityIcons name="sword" size={24} color={color} />
            case "inventory":
              return <MaterialIcons name="inventory" size={24} color={color} />
            case "settings":
              return <Feather name="settings" size={24} color={color} />
            default:
              return <Entypo name="map" size={24} color={color} />
          };
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
        headerLeft: () => (
          <DropdownMenu >
            <DropdownMenuTrigger style={{marginLeft: "15"}}>
              <AntDesign name="menu" size={24} color="white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Text>Profile</Text>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onPress={async () => {
                  await AsyncStorage.removeItem('uid');
                  await AsyncStorage.removeItem('id_token');
                  await AsyncStorage.removeItem('refresh_token');
                  
                  router.replace("/sign-in")
                }}>
                <Text>
                  Logout
                </Text>
              </DropdownMenuItem> 
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })
    }>
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map'
        }}
      />
      <Tabs.Screen
        name="battle"
        options={{
          title: 'Battle',
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
