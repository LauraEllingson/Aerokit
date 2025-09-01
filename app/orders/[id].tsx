// app/orders/[id].tsx
import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';

type LineItem = {
  id: string;
  name: string;
  unit_cents: number;
  qty: number;
  line_total_cents: number;
};

type Order = {
  id: string;
  status?: string;
  fbo_label?: string | null;
  tail_number?: string | null;
  subtotal_cents?: number | null;
  total_cents?: number | null;
  window_start?: string | null;
  window_end?: string | null;
  items_json?: LineItem[] | null;
  created_at?: string | null;
};

const toMoney = (c?: number | null) => typeof c === 'number' ? `$${(c/100).toFixed(2)}` : '—';
const toLocalDT = (iso?: string | null) => iso ? new Date(iso).toLocaleString() : '—';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
      if (!alive) return;
      if (error) console.warn(error);
      setOrder((data as Order) ?? null);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <ActivityIndicator />;

  if (!order) {
    return (
      <View style={{ flex:1, padding:16 }}>
        <Text>Order not found.</Text>
        <Link href="/vendor"><Text>← Back</Text></Link>
      </View>
    );
  }

  const lines = Array.isArray(order.items_json) ? order.items_json : [];

  return (
    <View style={{ flex:1, padding:16, gap:8 }}>
      <Link href="/vendor"><Text style={{ color:'#0A84FF' }}>← Back to Vendor</Text></Link>

      <Text style={{ fontSize:20, fontWeight:'800' }}>Order #{String(order.id).slice(0,8)}</Text>
      {order.tail_number ? <Text>Tail: {order.tail_number}</Text> : null}
      {order.fbo_label ? <Text>FBO: {order.fbo_label}</Text> : null}
      <Text>Status: {order.status?.toUpperCase() ?? '—'}</Text>
      <Text>Window: {toLocalDT(order.window_start)} → {toLocalDT(order.window_end)}</Text>

      <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 }} />

      <Text style={{ fontWeight:'700' }}>Items</Text>
      <FlatList
        data={lines}
        keyExtractor={(ln) => ln.id + String(ln.unit_cents)}
        renderItem={({ item }) => (
          <View style={{ paddingVertical:6, flexDirection:'row', justifyContent:'space-between' }}>
            <Text>• {item.qty} × {item.name}</Text>
            <Text>{toMoney(item.line_total_cents)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No items.</Text>}
      />

      <View style={{ height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 }} />

      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
        <Text style={{ color:'#6B7280' }}>Subtotal</Text>
        <Text>{toMoney(order.subtotal_cents)}</Text>
      </View>
      <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
        <Text style={{ fontWeight:'800' }}>Total</Text>
        <Text style={{ fontWeight:'800' }}>{toMoney(order.total_cents)}</Text>
      </View>
    </View>
  );
}
