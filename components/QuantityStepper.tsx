import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

type Props = {
  value?: number;
  onChange?: (v: number) => void;
  min?: number;
};

export default function QuantityStepper({ value = 1, onChange, min = 1 }: Props) {
  const [qty, setQty] = useState(value);

  // keep local state in sync with external changes
  useEffect(() => {
    setQty(value);
  }, [value]);

  const update = (v: number) => {
    const n = Math.max(min, v);
    setQty(n);
    onChange?.(n);
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        disabled={qty <= min}
        onPress={() => update(qty - 1)}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: 1,
          borderRadius: 6,
          opacity: qty <= min ? 0.5 : 1,
        }}
      >
        <Text style={{ fontSize: 20 }}>−</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, minWidth: 28, textAlign: 'center' }}>{qty}</Text>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        onPress={() => update(qty + 1)}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderWidth: 1,
          borderRadius: 6,
        }}
      >
        <Text style={{ fontSize: 20 }}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}
