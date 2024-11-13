import { Stack } from "expo-router";
import "@/assets/styles/global.css";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
