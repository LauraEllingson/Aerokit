// app/_layout.tsx
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerTitle: 'AeroKits' }}>
        <Stack.Screen name="index" options={{ title: 'Catalog' }} />
        <Stack.Screen name="vendor/index" options={{ title: 'Vendor Dashboard' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
