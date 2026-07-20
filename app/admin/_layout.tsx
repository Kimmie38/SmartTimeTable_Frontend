import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="upload-timetable" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="lectures" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="tests" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}