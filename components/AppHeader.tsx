import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function AppHeader() {
  const router = useRouter();
  return (
    <View style={{
      paddingTop: 14,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: '#0A84FF', // brand color (iOS blue vibe)
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>
          AeroKits
        </Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', gap: 18 }}>
        <Link href="/vendor" asChild>
          <TouchableOpacity accessibilityLabel="Vendor dashboard">
            <Text style={{ color: 'white', fontWeight: '600' }}>Vendor</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/cart" asChild>
          <TouchableOpacity accessibilityLabel="Cart">
            <Text style={{ color: 'white', fontWeight: '600' }}>Cart</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
