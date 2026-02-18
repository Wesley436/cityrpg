import { useState, useEffect, JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../config/api';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Alert from '@blazejkustra/react-native-alert';
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  equipment_section: {
    height: "33.33%",
  },
  inventory_section: {
    height: "66.66%",
    borderColor: "#ffffffa9",
    borderTopWidth: 1
  },
  tabs: {
    padding: 5
  },
  tab_list: {
    
  },
  tab_button: {
    flex: 1
  },
  tab_button_text: {
    fontSize: 16,
  },
  item_grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item_box: {
    borderRadius: 20,
    borderWidth: 5,
    // borderColor: "transparent",
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    backgroundColor: "#ffffff1c"
  }
});

const InventoryScreen = () => {
    const [tabValue, setTabValue] = useState("all")
    const [userData, setUserData] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [modalText, setModalText] = useState("")
    const [modalButtonText, setModalButtonText] = useState("")
    const [onModalAccept, setOnModalAccept] = useState(() => () => {})
    const [inventory, setInventory] = useState<any>([])

    const fetchUserData = async () => {
        try {
            const uidValue = await AsyncStorage.getItem('uid')
            if (uidValue) {
                await api.get(`/user/${JSON.parse(uidValue)}`)
                .then(async (response) => {
                    const user = response?.data
                    setUserData(user || {})
                    console.log(user)
                    if (user) {
                        const items: any[] = []
                        user.inventory?.forEach((itemString: string) => {
                            const item = JSON.parse(itemString)
                            items.push(item)
                        });

                        

                        setInventory(items)
                    }
                })
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching user data:', error);
                Alert.alert(error.response?.data.error)
            }
        }
    };

    useEffect(() => {
        console.log("Starting interval to refresh inventory");
        fetchUserData()

        const interval = setInterval(() => {
            fetchUserData()
        }, 10000);

        return () => {
            console.log("Clearing interval to refresh inventory");
            clearInterval(interval);
        };
    }, []);

    const ItemBox = ({item}) => {
        var icon
        switch (item.title) {
            case "Healing Potion": icon = <MaterialCommunityIcons name="bottle-tonic-plus" size={48} color="lightgreen" />; break
            case "Strength Potion": icon = <MaterialCommunityIcons name="bottle-tonic-plus" size={48} color="red" />; break
            case "Speed Potion": icon = <MaterialCommunityIcons name="bottle-tonic-plus" size={48} color="yellow" />; break
            case "Defense Potion": icon = <MaterialCommunityIcons name="bottle-tonic-plus" size={48} color="#3da6ec" />; break
            case "Helmet": icon = <FontAwesome5 name="hard-hat" size={48} color="silver" />; break
            case "Chestplate": icon = <FontAwesome6 name="shirt" size={48} color="silver" />; break
            case "Leggings": icon = <MaterialCommunityIcons name="bottle-tonic-plus" size={48} color="red" />; break
            case "Boots": icon = <MaterialCommunityIcons name="shoe-formal" size={48} color="silver" />; break
            case "Shield": icon = <MaterialCommunityIcons name="shield" size={48} color="lightblue" />; break
            case "Axe": icon = <MaterialCommunityIcons name="axe-battle" size={48} color="silver" />; break
            case "Single Sword": icon = <MaterialCommunityIcons name="sword" size={48} color="silver" />; break
            default:
                icon = <MaterialIcons name="question-mark" size={48} color="#ffffff" />
        }
        return (
            <View key={item.id} style={styles.item_box}>
                {icon}
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.equipment_section}>
            
            </View>
            <View style={styles.inventory_section}>
                <Tabs value={tabValue} onValueChange={setTabValue} style={styles.tabs}>
                    <TabsList style={styles.tab_list}>
                        <TabsTrigger value="all" style={styles.tab_button}>
                            <Text style={styles.tab_button_text}>All</Text>
                        </TabsTrigger>
                        <TabsTrigger value="equipment" style={styles.tab_button}>
                            <Text style={styles.tab_button_text}>Equipment</Text>
                        </TabsTrigger>
                        <TabsTrigger value="items" style={styles.tab_button}>
                            <Text style={styles.tab_button_text}>Items</Text>
                        </TabsTrigger>
                        <TabsTrigger value="other" style={styles.tab_button}>
                            <Text style={styles.tab_button_text}>Other</Text>
                        </TabsTrigger>
                    </TabsList>
            
                    <TabsContent value="all" style={styles.item_grid}>
                        <FlatList data={inventory} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id} />
                    </TabsContent>
            
                    <TabsContent value="equipment" style={styles.item_grid}>
                        <FlatList data={inventory.filter(item => item.type == "equipment")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id} />
                    </TabsContent>

                    <TabsContent value="items" style={styles.item_grid}>
                        <FlatList data={inventory.filter(item => item.type == "item")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id} />
                    </TabsContent>

                    <TabsContent value="other" style={styles.item_grid}>
                        <FlatList data={inventory.filter(item => item.type != "item" && item.type != "equipment")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id} />
                    </TabsContent>
                </Tabs>
            </View>
        </View>
    );
}

export default InventoryScreen;