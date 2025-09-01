// components/KitCard.tsx
import { View, Text, TouchableOpacity } from 'react-native';

export type Kit = {
  id: string | number;
  name: string;
  description?: string | null;
  price_cents: number;
  // optional future fields:
  // in_stock?: boolean;
};

type Props = {
  kit: Kit;
  onAdd?: (qty?: number) => void;
  addLabel?: string;
  disabled?: boolean; // e.g., when out of stock or during network ops
};

function formatUSD(cents: number) {
  // Avoid Intl for maximum RN compatibility; simple, safe formatter
  return `$${(cents / 100).toFixed(2)}`;
}

export default function KitCard({ kit, onAdd, addLabel = 'Add to Cart', disabled = false }: Props) {
  return (
    <View style={{ padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>{kit.name}</Text>

      {kit.description ? (
        <Text style={{ marginTop: 6, color: '#555' }}>{kit.description}</Text>
      ) : null}

      <Text style={{ marginTop: 8, fontWeight: '700' }}>{formatUSD(kit.price_cents)}</Text>

      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
        {/* Optional quick +1 button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add one"
          onPress={() => onAdd?.(1)}
          disabled={disabled}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderWidth: 1,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text>{addLabel}</Text>
        </TouchableOpacity>

        {/* Optional +3 “boost” button—delete if you don’t want it */}
        {/* <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Add three"
          onPress={() => onAdd?.(3)}
          disabled={disabled}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            borderWidth: 1,
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <Text>+3</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}
