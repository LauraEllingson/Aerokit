// components/KitsList.tsx
import { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, ActivityIndicator, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';
import KitCard, { Kit } from './KitCard';
import { useCart } from '../store/cart';

const MOCKS: Kit[] = [
  { id: 'mock1', name: 'Beverage Kit', description: 'Ice, water, soda, cups, napkins', price_cents: 20000 },
  { id: 'mock2', name: 'Cabin Clean Kit', description: 'Wipes, trash bags, gloves, freshener', price_cents: 15000 },
  { id: 'mock3', name: 'Snack Pack',     description: 'Chips, trail mix, protein bars',     price_cents: 18000 },
];

export default function KitsList() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const { add } = useCart();

  const load = useCallback(async () => {
    setErrorMsg(null);
    setLoading(true);

    if (!supabase) {
      // fallback to demo if env isn’t wired yet
      setKits(MOCKS);
      setDemo(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('kits')
      .select('id, name, description, price_cents, active')
      .eq('active', true)
      .order('name', { ascending: true });

    if (error) {
      console.warn('kits query error:', error.message);
      setErrorMsg('Could not load kits.');
      // Optional: also show demo data on error
      setKits(MOCKS);
      setDemo(true);
    } else {
      setKits((data ?? []) as Kit[]);
      setDemo(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await load();
    })();
    return () => { alive = false; };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) return <ActivityIndicator />;

  if (!kits.length) {
    return (
      <View style={{ padding: 16, gap: 8 }}>
        {errorMsg ? <Text style={{ color: '#c00' }}>{errorMsg}</Text> : null}
        <Text>No kits available.</Text>
        <TouchableOpacity
          onPress={load}
          style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, alignSelf: 'flex-start' }}
        >
          <Text>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setKits(MOCKS); setDemo(true); }}
          style={{ paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, alignSelf: 'flex-start' }}
        >
          <Text>Use Demo Data</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ padding: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {demo ? (
        <Text style={{ marginBottom: 8, padding: 8, borderWidth: 1, borderRadius: 8 }}>
          Demo mode: showing mock kits.
        </Text>
      ) : null}

      {kits.map(k => (
        <KitCard
          key={k.id}
          kit={k}
          onAdd={(qty = 1) =>
            add({
              id: String(k.id),
              name: k.name,
              unit_cents: k.price_cents, // ✅ matches your store
              qty,
            })
          }
        />
      ))}
    </ScrollView>
  );
}
