// components/KitCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';

export type Kit = { id: string | number; name: string; description?: string; price_cents: number };

export default function KitCard({
  kit,
  onAdd,
}: {
  kit: Kit;
  onAdd?: (qty?: number) => void;
}) {
  return (
    <View style={{ padding:16, borderWidth:1, borderRadius:12, marginBottom:12 }}>
      <Text style={{ fontSize:18, fontWeight:'600' }}>{kit.name}</Text>
      {kit.description ? <Text style={{ marginTop:6, color:'#555' }}>{kit.description}</Text> : null}
      <Text style={{ marginTop:8, fontWeight:'700' }}>${(kit.price_cents/100).toFixed(2)}</Text>

      <View style={{ marginTop:12, flexDirection:'row', justifyContent:'flex-end' }}>
        <TouchableOpacity
          onPress={() => onAdd?.(1)}
          style={{ paddingVertical:8, paddingHorizontal:14, borderRadius:8, borderWidth:1 }}
        >
          <Text>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
