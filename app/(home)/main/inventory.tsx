import { useState, useEffect, JSX } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../config/api';
import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Alert from '@blazejkustra/react-native-alert';
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Button } from '@/components/ui/button';

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
  equipment_grid: {
    // flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  equipment_box: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 3,
    padding: 5,
    // borderColor: "transparent",
    width: "20%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    backgroundColor: "#ffffff1c"
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
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    minHeight: "20%",
    backgroundColor: "#0000006b",
    borderRadius: 10,
    padding: 10,
    alignItems: "center"
  },
  modalText: {
    padding: 10,
    margin: "auto",
    fontSize: 24
  },
  modalButton: {
    // minWidth: "25%",
    width: "40%",
    marginTop: "auto",
    marginHorizontal: "5%"
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold"
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
    const [usingItem, setUsingItem] = useState(false)

    const updateInventory = (inventory: string[]) => {
        const items: any[] = []
        inventory?.forEach((itemString: string) => {
            const item = JSON.parse(itemString)
            items.push(item)
        });



        setInventory(items)
    }

    const fetchUserData = async () => {
        try {
            const uidValue = await AsyncStorage.getItem('uid')
            if (uidValue) {
                await api.get(`/user/${JSON.parse(uidValue)}`)
                .then(async (response) => {
                    const user = response?.data
                    setUserData(user || {})
                    // console.log(user)
                    if (user) {
                        updateInventory(user.inventory)
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

    const getItemIconFromTitle = (title: string, itemProps: JSX.IntrinsicAttributes) => {
        switch (title) {
            case "Healing Potion": return <MaterialCommunityIcons name="bottle-tonic-plus" color="lightgreen" {...itemProps}/>
            case "Strength Potion": return <MaterialCommunityIcons name="bottle-tonic-plus" color="red" {...itemProps}/>
            case "Speed Potion": return <MaterialCommunityIcons name="bottle-tonic-plus" color="yellow" {...itemProps}/>
            case "Defense Potion": return <MaterialCommunityIcons name="bottle-tonic-plus" color="#3da6ec" {...itemProps}/>
            case "Helmet": return <FontAwesome5 name="hard-hat" color="silver" {...itemProps}/>
            case "Chestplate": return <FontAwesome6 name="shirt" color="silver" {...itemProps}/>
            case "Boots": return <MaterialCommunityIcons name="shoe-formal" color="silver" {...itemProps}/>
            case "Shield": return <MaterialCommunityIcons name="shield" color="lightblue" {...itemProps}/>
            case "Axe": return <MaterialCommunityIcons name="axe-battle" color="silver" {...itemProps}/>
            case "Single Sword": return <MaterialCommunityIcons name="sword" color="silver" {...itemProps}/>
            default:
                return <MaterialIcons name="question-mark" color="#ffffff" {...itemProps}/>
        }
    }

    const getEquippedItemIconFromSlot = (slot: string) => {
        const lowercaseSlot = slot.toLowerCase()

        var onPress = () => {
            setModalText(slot)
            setModalButtonText("Unequip")

            setOnModalAccept(() => async () => {
                setShowModal(false)
                setUsingItem(true)
                await api.post("/user/use-item", {"item_id": lowercaseSlot})
                .then(async function (response) {
                    console.log(response.data)

                    const user = response?.data
                    setUserData(user || {})
                    updateInventory(response.data.inventory)
                })
                .catch(function (error) {
                    if (axios.isAxiosError(error)) {
                        Alert.alert(error.response?.data.error)
                    }
                })
                .finally(() => {
                    setUsingItem(false)
                })
            })
            setShowModal(true)
        }

        const equippedItem = userData[lowercaseSlot]
        
        var itemProps = {
            size: 48,
            disabled: usingItem,
            onPress: () => {},
            style: {}
        }

        if (equippedItem) {
            itemProps.onPress = onPress
            itemProps.style = {"opacity": equippedItem ? 1 : 0.2}
            return getItemIconFromTitle(equippedItem, itemProps)
        } else {
            itemProps.style = {"opacity": 0.2}
            switch (lowercaseSlot) {
                case "helmet": return <FontAwesome5 name="hard-hat" color="silver" {...itemProps}/>
                case "chestplate": return <FontAwesome6 name="shirt" color="silver" {...itemProps}/>
                case "boots": return <MaterialCommunityIcons name="shoe-formal" color="silver" {...itemProps}/>
                case "shield": return <MaterialCommunityIcons name="shield" color="lightblue" {...itemProps}/>
                case "weapon": return <MaterialCommunityIcons name="sword" color="silver" {...itemProps}/>
                default:
                    return <MaterialIcons name="question-mark" size={48} color="#ffffff" />
            }
        }
    }

    const ItemBox = ({item}) => {
        const onPress = () => {
            setModalText(item.title)
            switch (item.type) {
                case "item": setModalButtonText("Use"); break
                case "equipment": setModalButtonText("Equip"); break
                default:
                    setModalButtonText("OK")
            }
            setOnModalAccept(() => async () => {
                setShowModal(false)
                setUsingItem(true)
                await api.post("/user/use-item", {"item_id": item.id})
                .then(async function (response) {
                    console.log(response.data)
                    
                    const user = response?.data
                    setUserData(user || {})
                    updateInventory(response.data.inventory)
                })
                .catch(function (error) {
                    if (axios.isAxiosError(error)) {
                        Alert.alert(error.response?.data.error)
                    }
                })
                .finally(() => {
                    setUsingItem(false)
                })
            })
            setShowModal(true)
        }

        const itemProps = {
            size: 48,
            onPress: onPress,
            disabled: usingItem
        }
        var icon = getItemIconFromTitle(item.title, itemProps)

        return (
            <View key={item.id} style={styles.item_box}>
                {icon}
            </View>
        )
    }

    return (
        <>
            <View style={styles.container}>
                <View style={styles.equipment_section}>
                    <Text style={{padding: 10}}>Equipped Items</Text>
                    <View style={styles.equipment_grid}>
                        <View style={styles.equipment_box}>
                            {getEquippedItemIconFromSlot("Helmet")}
                        </View>
                        <View style={styles.equipment_box}>
                            {getEquippedItemIconFromSlot("Chestplate")}
                        </View>
                        <View style={styles.equipment_box}>
                            {getEquippedItemIconFromSlot("Boots")}
                        </View>
                        <View style={styles.equipment_box}>
                            {getEquippedItemIconFromSlot("Weapon")}
                        </View>
                        <View style={styles.equipment_box}>
                            {getEquippedItemIconFromSlot("Shield")}
                        </View>
                    </View>
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
                            <FlatList data={inventory.filter((item: { type: string }) => item.type == "equipment")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id} />
                        </TabsContent>

                        <TabsContent value="items" style={styles.item_grid}>
                            <FlatList data={inventory.filter((item: { type: string }) => item.type == "item")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id} />
                        </TabsContent>

                        <TabsContent value="other" style={styles.item_grid}>
                            <FlatList data={inventory.filter((item: { type: string }) => item.type != "item" && item.type != "equipment")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id} />
                        </TabsContent>
                    </Tabs>
                </View>
            </View>
            {
                showModal
                &&
                <Modal animationType='fade' transparent={true}>
                    <View style={styles.modalView}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>{modalText}</Text>
                            <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                                <Button style={styles.modalButton} onPress={() => {
                                    onModalAccept();
                                    setShowModal(false)
                                    setOnModalAccept(() => () => {})
                                }}>
                                    <Text style={styles.modalButtonText}>{modalButtonText}</Text>
                                </Button>
                                <Button style={styles.modalButton} onPress={() => {setShowModal(false)}}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                </Modal>
            }
        </>
    );
}

export default InventoryScreen;