import { useState, useEffect, JSX, useCallback } from 'react';
import api from '../../../config/api';
import { FlatList, Modal, RefreshControl, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import Alert from '@blazejkustra/react-native-alert';
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Button } from '@/components/ui/button';
import useUserData from '@/hooks/useUserData';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  equipment_section: {
    height: "33.33%",
    flex: 1,
  },
  stat_section: {
    padding: 10,
    flexDirection: "row"
  },
  stat: {
    padding: 5,
    width: "25%"
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
    // flexDirection: 'row',
    // flexWrap: 'wrap'
    paddingBottom: "25%"
  },
  item_box: {
    borderRadius: 20,
    borderWidth: 5,
    // borderColor: "transparent",
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
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
  modalDescription: {
    padding: 10,
    margin: "auto",
    fontSize: 16
  },
  modalButton: {
    // minWidth: "25%",
    width: "40%",
    marginVertical: "1%",
    marginHorizontal: "5%"
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold"
  }
});

const InventoryScreen = () => {
    const [tabValue, setTabValue] = useState("all")
    const [showModal, setShowModal] = useState(false)
    const [modalText, setModalText] = useState("")
    const [modalDescription, setModalDescription] = useState("")
    const [modalButtonText, setModalButtonText] = useState("")
    const [onModalAccept, setOnModalAccept] = useState(() => () => {})
    const [onModalDiscard, setOnModalDiscard] = useState(() => () => {})
    const [processingItem, setProcessingItem] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false);
 
    const { userData, updateUserData, inventory, fetchUserData } = useUserData()

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

    const customTitleOrder = ["Helmet", "Chestplate", "Boots", "Single Sword", "Axe", "Shield", "Healing Potion", "Strength Potion", "Speed Potion", "Defense Potion"];
    const customRarityOrder = ["Epic", "Rare", "Uncommon", "Common"];
    const getInventoryList = () => {
        var temp = inventory
        temp.sort((a, b) => {
            const titleOrder = customTitleOrder.indexOf(a.title) - customTitleOrder.indexOf(b.title)
            const rarityOrder = customRarityOrder.indexOf(a.rarity) - customRarityOrder.indexOf(b.rarity)
            if (titleOrder != 0) {
                return titleOrder
            } else if (rarityOrder != 0) {
                return rarityOrder
            } else {
                return 0
            }
        });
        
        return temp
    }

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

    const setModalTextForItem = (item: { title: string; rarity: string; description:string; }) => {
        var text = item.title
        if (item.rarity) {
            text += ` (${item.rarity})`
        }
        setModalText(text)

        if (item.description) {
            setModalDescription(item.description)
        } else {
            setModalDescription("")
        }
    }

    const sentItem = async (url: string, item_id: string) => {
        setShowModal(false)
        setProcessingItem(true)
        await api.post(url, {"item_id": item_id})
        .then(async function (response) {
            if (response.data) {
                const user = response?.data
                await updateUserData(user)
            }
        })
        .catch(function (error) {
            if (axios.isAxiosError(error)) {
                Alert.alert(error.response?.data.error)
            }
        })
        .finally(() => {
            setProcessingItem(false)
        })
    }

    const getEquippedItemIconFromSlot = (slot: string) => {
        const lowercaseSlot = slot.toLowerCase()

        var onPress = () => {
            const item = userData[lowercaseSlot]
            setModalTextForItem(item)
            setModalButtonText("Unequip")

            setOnModalAccept(() => async () => {
                sentItem("/user/use-item", lowercaseSlot)
            })
            setOnModalDiscard(() => async () => {
                sentItem("/user/discard-item", item.id)
            })
            setShowModal(true)
        }

        const equippedItem = userData[lowercaseSlot]
        
        var itemProps = {
            size: 48,
            disabled: processingItem,
            onPress: () => {},
            style: {}
        }

        if (equippedItem) {
            itemProps.onPress = onPress

            itemProps.style = {"opacity": equippedItem ? 1 : 0.2}
            return getItemIconFromTitle(equippedItem.title, itemProps)
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
            setModalTextForItem(item)

            switch (item.type) {
                case "item": setModalButtonText("Use"); break
                case "equipment": setModalButtonText("Equip"); break
                default:
                    setModalButtonText("OK")
            }
            setOnModalAccept(() => async () => {
                await sentItem("/user/use-item", item.id)
            })
            setOnModalDiscard(() => async () => {
                await sentItem("/user/discard-item", item.id)
            })
            setShowModal(true)
        }

        const itemProps = {
            size: 48,
            onPress: onPress,
            disabled: processingItem
        }
        var icon = getItemIconFromTitle(item.title, itemProps)

        var backgroundColor = "#ffffff1c"

        if (item.rarity) {
            switch (item.rarity) {
                case "Common": backgroundColor = "#ffffff1c"; break;
                case "Uncommon": backgroundColor = "#68ff632a"; break;
                case "Rare": backgroundColor = "#00e1ff2c"; break;
                case "Epic": backgroundColor = "#f700ff21"; break;
            }
        }

        return (
            <View key={item.id} style={{...styles.item_box, backgroundColor: backgroundColor}}>
                {icon}
            </View>
        )
    }

    const handleRefresh = useCallback(async () => {
        console.log("refreshing")
        setIsRefreshing(true)
        await fetchUserData()
        setIsRefreshing(false)
    }, []);

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

                    <View style={styles.stat_section}>
                        <Text style={{...styles.stat, color: "lightgreen"}}>HP{"\n"}{parseFloat(userData.health?.current.toFixed(2))} / {userData.health?.currentMax}</Text>
                        <Text style={{...styles.stat, color: "red"}}>Strength{"\n"}{userData.strength?.currentBeforeAdditional + (userData.strength?.additional ? ` + ${userData.strength?.additional}` : "")}</Text>
                        <Text style={{...styles.stat, color: "#3da6ec"}}>Defense{"\n"}{userData.defense?.currentBeforeAdditional + (userData.defense?.additional ? ` + ${userData.defense?.additional}` : "")}</Text>
                        <Text style={{...styles.stat, color: "yellow"}}>Speed{"\n"}{userData.speed?.currentBeforeAdditional + (userData.speed?.additional ? ` + ${userData.speed?.additional}` : "")}</Text>
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
                            <FlatList data={getInventoryList()} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={handleRefresh}
                                    />
                                }
                            />
                        </TabsContent>
                
                        <TabsContent value="equipment" style={styles.item_grid}>
                            <FlatList data={inventory.filter((item: { type: string }) => item.type == "equipment")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={handleRefresh}
                                    />
                                }
                            />
                        </TabsContent>

                        <TabsContent value="items" style={styles.item_grid}>
                            <FlatList data={inventory.filter((item: { type: string }) => item.type == "item")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={handleRefresh}
                                    />
                                }
                            />
                        </TabsContent>

                        <TabsContent value="other" style={styles.item_grid}>
                            <FlatList data={inventory.filter((item: { type: string }) => item.type != "item" && item.type != "equipment")} numColumns={4} renderItem={ItemBox} keyExtractor={item => item.id}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={isRefreshing}
                                        onRefresh={handleRefresh}
                                    />
                                }
                            />
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
                            {
                                modalDescription
                                &&
                                <Text style={styles.modalDescription}>{modalDescription}</Text>
                            }
                            <View style={{flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap", justifyContent: "center"}}>
                                <Button style={styles.modalButton} onPress={() => {
                                    onModalAccept();
                                    setOnModalAccept(() => () => {})
                                    setOnModalDiscard(() => () => {})
                                }}>
                                    <Text style={styles.modalButtonText}>{modalButtonText}</Text>
                                </Button>
                                <Button style={styles.modalButton} onPress={() => {
                                    setShowModal(false)
                                    setOnModalAccept(() => () => {})
                                    setOnModalDiscard(() => () => {})
                                }}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </Button>
                                <Button style={styles.modalButton} onPress={() => {
                                    onModalDiscard()
                                    setOnModalAccept(() => () => {})
                                    setOnModalDiscard(() => () => {})
                                }}>
                                    <Text style={styles.modalButtonText}>Discard</Text>
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