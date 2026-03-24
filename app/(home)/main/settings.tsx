import { StyleSheet, View } from 'react-native';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import api from '@/config/api';
import Alert from '@blazejkustra/react-native-alert';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    padding: 10
  },
});

const SettingsScreen = () => {
    const [enableNotifications, setEnableNotifications] = useState(false);

    useEffect(() => {
        async function loadSettings() {
            const enable_notifications = JSON.parse(await AsyncStorage.getItem('enable_notifications') || "false")
            setEnableNotifications(enable_notifications)
        }
        loadSettings()
    }, []);
    
    function onEnableNotificationsPress() {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEnableNotifications((prev) => !prev);
    }

    async function onEnableNotificationsChange(checked: boolean) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEnableNotifications(checked);

        if (!checked) {
            await Notifications.cancelAllScheduledNotificationsAsync()
        }

        await api.post("/user/update-settings", {enableNotiications: checked})
        .catch(function (error) {
            if (axios.isAxiosError(error)) {
                Alert.alert(error.response?.data.error)
            }
        })
    }

    return (
        <View style={styles.container}>
            <View style={{flexDirection: "row", padding: "5%"}}>
                <Label style={{}} nativeID="enable-notifications" htmlFor="enable-notifications" onPress={onEnableNotificationsPress}>
                    Enable Notifications
                </Label>
                <Switch
                    checked={enableNotifications}
                    onCheckedChange={onEnableNotificationsChange}
                    id="enable-notifications"
                    nativeID="enable-notifications"
                    style={{marginLeft: "auto"}}
                />
            </View>
        </View>
    );
}

export default SettingsScreen