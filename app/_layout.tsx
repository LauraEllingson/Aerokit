import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerTitle: 'AeroKits' }}>
        <Stack.Screen name="index" options={{ title: 'Catalog' }} />
        <Stack.Screen name="cart" options={{ title: 'Cart' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="orders/[id]" options={{ title: 'Order' }} />
        <Stack.Screen name="vendor/index" options={{ title: 'Vendor' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
