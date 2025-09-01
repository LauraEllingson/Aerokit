// app/cart.tsx
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import CartPanel from '../components/CartPanel';
import { useCart } from '../store/cart';

export default function CartScreen() {
  const itemCount = useCart((s) => s.itemCount());
  const total = useCart((s) => s.totalCents());

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/"><Text style={{ textDecorationLine: 'underline' }}>← Back</Text></Link>
        <Text style={{ fontSize: 18, fontWeight: '700' }}>Cart ({itemCount}) • ${(total / 100).toFixed(2)}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Cart */}
      <View style={{ flex: 1, padding: 16 }}>
        <CartPanel />
      </View>
    </View>
  );
}
