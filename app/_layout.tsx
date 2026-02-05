import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { PortalHost } from "@rn-primitives/portal"
import { StatusBar } from "react-native";
import { NAV_THEME } from "@/lib/theme";
import "../css/global.css"

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME['dark']}>
      <StatusBar/>
      <Stack>
        <Stack.Screen
        name="(home)"
        options={{
          headerShown: false,
        }}/>
      </Stack>
    <PortalHost/>
  </ThemeProvider>
  );
}
