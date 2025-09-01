// app/index.tsx
import { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../lib/supabase';
import KitCard, { Kit } from '../components/KitCard';
import CartPanel from '../components/CartPanel';
import { useCart } from '../store/cart';

export default function IndexPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);

  const add = useCart((s) => s.add);
  const itemCount = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0)); // selector
  const { width } = useWindowDimensions();
  const isNarrow = width < 900; // stack on small screens

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      if (!supabase) {
        // No client configured (missing env): show empty (or swap to mocks if you prefer)
        setKits([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('kits')
        .select('id, name, description, price_cents, active')
        .eq('active', true)
        .order('name', { ascending: true });

      if (!alive) return;

      if (error) {
        console.warn('kits query error:', error.message);
        setKits([]);
      } else {
        setKits((data ?? []) as Kit[]);
      }

      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: isNarrow ? 'column' : 'row',
        padding: 16,
        gap: 16,
      }}
    >
      {/* LEFT: Store / Catalog */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Kits available</Text>

          {/* Right side header actions */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {/* Vendor Dashboard link styled as a button */}
            <Link href="/vendor" asChild>
              <TouchableOpacity
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderWidth: 1,
                  borderRadius: 8,
                }}
              >
                <Text>Vendor Dashboard</Text>
              </TouchableOpacity>
            </Link>

            {/* Tiny cart badge */}
            <View
              style={{
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderRadius: 999,
              }}
            >
              <Text>Cart: {itemCount}</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={kits}
            keyExtractor={(k) => String(k.id)}
            renderItem={({ item }) => (
              <KitCard
                kit={item}
                onAdd={(qty = 1) =>
                  add({
                    id: String(item.id),
                    name: item.name,
                    unit_cents: item.price_cents, // ✅ matches your store
                    qty,
                  })
                }
              />
            )}
            ListEmptyComponent={<Text>No kits available.</Text>}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
      </View>

      {/* RIGHT: Cart column (only when there are items) */}
      {!isNarrow && itemCount > 0 ? (
        <View style={{ width: 360, maxWidth: '100%' }}>
          <CartPanel />
        </View>
      ) : null}

      {/* On narrow screens, show cart below the list when items exist */}
      {isNarrow && itemCount > 0 ? (
        <View style={{ marginTop: 16 }}>
          <CartPanel />
        </View>
      ) : null}
    </View>
  );
}
