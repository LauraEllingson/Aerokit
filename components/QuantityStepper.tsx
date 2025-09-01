import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function QuantityStepper({ value = 1, onChange }:{ value?: number; onChange?: (v:number)=>void }){
  const [qty,setQty] = useState(value);
  const set = (v:number) => {
    const n = Math.max(1, v);
    setQty(n);
    onChange?.(n);
  };
  return (
    <View style={{flexDirection:'row', alignItems:'center', gap:12}}>
      <TouchableOpacity onPress={()=>set(qty-1)} accessibilityLabel="Decrease quantity"><Text style={{fontSize:24}}>-</Text></TouchableOpacity>
      <Text style={{fontSize:18, minWidth:24, textAlign:'center'}}>{qty}</Text>
      <TouchableOpacity onPress={()=>set(qty+1)} accessibilityLabel="Increase quantity"><Text style={{fontSize:24}}>+</Text></TouchableOpacity>
    </View>
  );
}
