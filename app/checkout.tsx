// app/cart.tsx
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import CartPanel from '../components/CartPanel';
import { useCart } from '../store/cart';

export default function CartScreen() {
  const itemCount = useCart((s) => s.itemCount());
  const total = useCart((s) => s.totalCents());

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderColor: '#eee',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Link href="/">
          <Text style={{ textDecorationLine: 'underline' }}>← Back</Text>
        </Link>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>
          Cart ({itemCount}) • ${(total / 100).toFixed(2)}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Body */}
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f7f7f7' }}
        contentContainerStyle={{ padding: 16 }}
      >
        {itemCount === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Text style={{ fontSize: 16, marginBottom: 8 }}>Your cart is empty.</Text>
            <Link href="/" asChild>
              <TouchableOpacity
                style={{
                  marginTop: 8,
                  backgroundColor: '#0A84FF',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  Continue Shopping
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        ) : (
          <CartPanel />
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}
