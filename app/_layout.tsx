import { useEffect } from "react";
import { Stack } from "expo-router";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import { AppStoreProvider } from "../utils/appStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
const [fontsLoaded] = useFonts({
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
});

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AppStoreProvider>

    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(splash)/index" />
      <Stack.Screen name="(auth)/login" />
    </Stack>
     </AppStoreProvider>
  );
}