import { View, Text } from 'react-native';
import { useCart } from '../store/cart';

export default function Checkout() {
  const total = useCart(s => s.totalCents());
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>Checkout</Text>
      <Text style={{ marginTop:8 }}>Order total: ${(total/100).toFixed(2)}</Text>
      <Text style={{ marginTop:8, color:'#666' }}>Delivery details & payment coming next.</Text>
    </View>
  );
}
