import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { CampusProvider } from "@/context/CampusContext";

export default function RootLayout() {
  return (
    <CampusProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </CampusProvider>
  );
}
