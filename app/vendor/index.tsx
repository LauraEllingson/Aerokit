// app/vendor/index.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

type OrderRow = {
  id: string;
  status: string;
  tail_number: string | null;
  fbo_label: string | null;
  subtotal_cents: number;
  total_cents: number;
  window_start: string;
  window_end: string;
  invoice_number: number; // now an int in DB
  items_json?: {
    id: string;
    name: string;
    qty: number;
    unit_cents: number;
    line_total_cents: number;
  }[];
  created_at?: string;
};

type TailGroup = {
  tail: string;
  orders: OrderRow[];
  nextTime: number;
};

export default function VendorDashboard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('window_start', { ascending: true });

    if (error) {
      setErrorMsg(error.message);
      setOrders([]);
    } else {
      setOrders((data ?? []) as OrderRow[]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => load()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  async function markDelivered(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'delivered' })
      .eq('id', orderId);
    if (error) alert('Failed to update: ' + error.message);
  }

  // Group by tail; sort within each tail; sort cards by earliest delivery
  const tailGroups: TailGroup[] = useMemo(() => {
    const grouped = orders.reduce<Record<string, OrderRow[]>>((acc, o) => {
      const key = (o.tail_number || 'UNKNOWN').toUpperCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});

    const arr: TailGroup[] = Object.entries(grouped).map(([tail, list]) => {
      const sorted = [...list].sort(
        (a, b) =>
          new Date(a.window_start).getTime() - new Date(b.window_start).getTime()
      );
      return {
        tail,
        orders: sorted,
        nextTime: sorted.length
          ? new Date(sorted[0].window_start).getTime()
          : Number.MAX_SAFE_INTEGER,
      };
    });

    arr.sort((a, b) => a.nextTime - b.nextTime);
    return arr;
  }, [orders]);

  const screenW = Dimensions.get('window').width;
  const cardW = Math.min(380, screenW - 48);

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Vendor Dashboard</Text>
        <Link href="/">
          <Text style={{ textDecorationLine: 'underline' }}>← Back to Store</Text>
        </Link>
      </View>

      {loading && (
        <View style={{ padding: 16 }}>
          <ActivityIndicator />
        </View>
      )}
      {errorMsg && (
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ color: '#c00' }}>{errorMsg}</Text>
        </View>
      )}
      {!loading && !errorMsg && orders.length === 0 && (
        <View style={{ paddingHorizontal: 16 }}>
          <Text>No orders yet.</Text>
        </View>
      )}

      {!loading && !errorMsg && orders.length > 0 && (
        <FlatList
          data={tailGroups}
          keyExtractor={(g) => g.tail}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          snapToAlignment="center"
          decelerationRate="fast"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View
              style={{
                width: cardW,
                marginRight: 12,
                padding: 12,
                borderWidth: 1,
                borderRadius: 12,
                backgroundColor: 'white',
              }}
            >
              <Text style={{ fontWeight: '800', fontSize: 16, marginBottom: 6 }}>
                Tail {item.tail}{' '}
                <Text style={{ fontWeight: '400' }}>({item.orders.length} orders)</Text>
              </Text>

              {/* Orders inside card: numbered 1..N */}
              <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ paddingBottom: 8 }}>
                {item.orders.map((o, idx) => (
                  <View
                    key={o.id}
                    style={{
                      marginTop: 8,
                      padding: 10,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: '#e6e6e6',
                    }}
                  >
                    <Text style={{ fontWeight: '700', marginBottom: 4 }}>
                      {idx + 1}) Invoice #{String(o.invoice_number).padStart(5, '0')} · {o.status.toUpperCase()}
                    </Text>

                    {o.fbo_label && <Text>FBO: {o.fbo_label}</Text>}
                    <Text>Subtotal: ${(o.subtotal_cents / 100).toFixed(2)}</Text>
                    <Text>Total: ${(o.total_cents / 100).toFixed(2)}</Text>
                    <Text style={{ marginTop: 2 }}>
                      Window: {new Date(o.window_start).toLocaleString()} →{' '}
                      {new Date(o.window_end).toLocaleString()}
                    </Text>

                    {!!o.items_json?.length && (
                      <View style={{ marginTop: 6 }}>
                        <Text style={{ fontWeight: '600' }}>Items:</Text>
                        {o.items_json.map((it, iidx) => (
                          <Text key={iidx} style={{ marginLeft: 8 }}>
                            • {it.qty} × {it.name} (${(it.unit_cents / 100).toFixed(2)} ea) — $
                            {(it.line_total_cents / 100).toFixed(2)}
                          </Text>
                        ))}
                      </View>
                    )}

                    {o.status !== 'delivered' && (
                      <TouchableOpacity
                        onPress={() => markDelivered(o.id)}
                        style={{
                          marginTop: 10,
                          backgroundColor: '#0A84FF',
                          padding: 10,
                          borderRadius: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{ color: 'white', fontWeight: '700' }}>
                          Mark Delivered
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        />
      )}
    </View>
  );
}
