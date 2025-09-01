import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Link } from 'expo-router';
import { useCart } from '../store/cart';

export default function Cart() {
  const { items, inc, dec, remove, clear, totalCents } = useCart();
  const total = totalCents();

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>Your cart</Text>

      <FlatList
        style={{ marginTop:12 }}
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical:10, borderBottomWidth:1, borderColor:'#eee' }}>
            <Text style={{ fontWeight:'600' }}>{item.name}</Text>
            <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginTop:6 }}>
              <TouchableOpacity onPress={() => dec(item.id)}><Text style={{ fontSize:18 }}>−</Text></TouchableOpacity>
              <Text>{item.qty}</Text>
              <TouchableOpacity onPress={() => inc(item.id)}><Text style={{ fontSize:18 }}>＋</Text></TouchableOpacity>
              <Text style={{ marginLeft:8 }}>${(item.unit_cents/100).toFixed(2)} ea</Text>
              <TouchableOpacity onPress={() => remove(item.id)} style={{ marginLeft:12 }}>
                <Text style={{ color:'#c00' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop:8 }}>Your cart is empty.</Text>}
      />

      <View style={{ marginTop:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <Text style={{ fontSize:16, fontWeight:'700' }}>Total: ${(total/100).toFixed(2)}</Text>
        <TouchableOpacity onPress={clear} style={{ paddingVertical:8, paddingHorizontal:12, borderWidth:1, borderRadius:8 }}>
          <Text>Clear Cart</Text>
        </TouchableOpacity>
      </View>

      <Link href="/checkout" asChild>
        <TouchableOpacity
          style={{ marginTop:16, backgroundColor:'#0A84FF', padding:12, borderRadius:10, alignItems:'center' }}
          disabled={!items.length}
        >
          <Text style={{ color:'white', fontWeight:'700' }}>
            {items.length ? 'Proceed to Checkout' : 'Add items to continue'}
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
