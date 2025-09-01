// components/CartPanel.tsx
import { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useCart } from '../store/cart';
import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FboRow = { id: string; label: string; airport_iata: string };

const STORAGE_KEY_TAIL = 'last_tail';

function toISO(dateStr: string, hhmm: string) {
  const [y, m, d] = (dateStr || '').split('-').map(Number);
  const [hh, mm] = (hhmm || '').split(':').map(Number);
  if (!y || !m || !d || Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const dt = new Date();
  dt.setFullYear(y, m - 1, d);
  dt.setHours(hh, mm, 0, 0);
  return dt.toISOString();
}

/** Tail persistence (AsyncStorage native, localStorage web) */
async function loadTailFromStorage(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(STORAGE_KEY_TAIL);
      }
      return null;
    }
    return await AsyncStorage.getItem(STORAGE_KEY_TAIL);
  } catch {
    return null;
  }
}
async function saveTailToStorage(value: string) {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_TAIL, value);
      }
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY_TAIL, value);
  } catch {}
}

/** Get the next invoice number as an integer (clean slate friendly) */
async function getNextInvoiceNumber(): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .select('invoice_number')
    .order('invoice_number', { ascending: false })
    .limit(1);

  if (error) {
    console.warn('Error fetching last invoice_number:', error.message);
    return 1;
  }
  const last = data && data.length > 0 ? (data[0].invoice_number as number | null) : null;
  return (last ?? 0) + 1;
}

export default function CartPanel() {
  const router = useRouter();
  const { items, inc, dec, remove, totalCents, clear } = useCart();

  // Hard-coded FBOs (MVP)
  const fbos: FboRow[] = [
    { id: 'pbi_sig', label: 'PBI · Signature Flight Support', airport_iata: 'PBI' },
    { id: 'sua_atl', label: 'SUA · Atlantic Aviation',        airport_iata: 'SUA' },
    { id: 'fll_shl', label: 'FLL · Sheltair Aviation',         airport_iata: 'FLL' },
  ];
  const [selectedFbo, setSelectedFbo] = useState<string | null>(fbos[0]?.id ?? null);

  // Tail number (remembered)
  const [tail, setTail] = useState('');
  useEffect(() => {
    (async () => {
      const saved = await loadTailFromStorage();
      if (saved) setTail(saved.toUpperCase());
    })();
  }, []);
  async function handleTailChange(v: string) {
    const value = (v || '').toUpperCase();
    setTail(value);
    await saveTailToStorage(value);
  }

  // Date & Time
  const [dateStr, setDateStr] = useState(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  });
  const [showDate, setShowDate] = useState(false);

  const [timeStr, setTimeStr] = useState('12:00');
  const [showTime, setShowTime] = useState(false);

  const total = totalCents();
  const deliveryISO = useMemo(() => toISO(dateStr, timeStr), [dateStr, timeStr]);

  const canSubmit =
    items.length > 0 &&
    !!selectedFbo &&
    !!tail.trim() &&
    !!deliveryISO;

  async function submitOrder() {
    if (!canSubmit) {
      alert('Add items, pick an FBO, enter tail, and choose date/time.');
      return;
    }
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }

    const start = new Date(deliveryISO!);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1-hour window

    const items_json = items.map((i) => ({
      id: i.id,
      name: i.name,
      unit_cents: i.unit_cents,
      qty: i.qty,
      line_total_cents: i.unit_cents * i.qty,
    }));

    // Generate next sequential invoice number (int)
    const invoice_number = await getNextInvoiceNumber();

    const payload = {
      status: 'pending',
      fbo_id: null, // MVP: storing label only
      fbo_label: fbos.find((f) => f.id === selectedFbo)?.label ?? null,
      tail_number: tail.trim().toUpperCase(),
      subtotal_cents: total,
      total_cents: total,
      window_start: start.toISOString(),
      window_end: end.toISOString(),
      items_json
    };

    const { error } = await supabase
      .from('orders')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.warn('Order insert error:', error);
      alert('Order failed: ' + error.message);
      return;
    }

    clear();
    router.push('/vendor'); // Vendor Dashboard will pick it up via realtime
  }

  return (
    <View
      style={{
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        gap: 12,
        backgroundColor: 'white',
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Your Cart</Text>

      {/* Cart items */}
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View
            style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}
          >
            <Text style={{ fontWeight: '600' }}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <TouchableOpacity onPress={() => dec(item.id)}>
                <Text>−</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 8 }}>{item.qty}</Text>
              <TouchableOpacity onPress={() => inc(item.id)}>
                <Text>＋</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)} style={{ marginLeft: 12 }}>
                <Text style={{ color: '#c00' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No items yet.</Text>}
      />

      <Text style={{ fontWeight: '700' }}>Total: ${(total / 100).toFixed(2)}</Text>

      {/* Tail number (remembered) */}
      <Text>Aircraft Tail Number</Text>
      <TextInput
        value={tail}
        onChangeText={handleTailChange}
        placeholder="e.g. N123AB"
        autoCapitalize="characters"
        style={{ borderWidth: 1, borderRadius: 8, padding: 8 }}
      />

      {/* FBO selector */}
      <Text style={{ marginTop: 8 }}>Choose FBO</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {fbos.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setSelectedFbo(f.id)}
            style={{
              borderWidth: 1,
              borderRadius: 8,
              paddingVertical: 6,
              paddingHorizontal: 10,
              margin: 4,
              backgroundColor: selectedFbo === f.id ? '#0A84FF' : 'transparent',
            }}
          >
            <Text style={{ color: selectedFbo === f.id ? 'white' : 'black' }}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Delivery Date */}
      <Text style={{ marginTop: 8 }}>Delivery Date</Text>
      {Platform.OS === 'web' ? (
        // Web: browser-native date picker
        // @ts-ignore - RN web allows raw inputs
        <input
          type="date"
          value={dateStr}
          onChange={(e: any) => setDateStr(e.target.value)} // YYYY-MM-DD
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 8,
            width: '100%',
          }}
        />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setShowDate(true)}
            style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
          >
            <Text>{dateStr}</Text>
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={new Date(dateStr + 'T12:00:00')}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={(_, d) => {
                setShowDate(false);
                if (d) {
                  const yy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const dd = String(d.getDate()).padStart(2, '0');
                  setDateStr(`${yy}-${mm}-${dd}`);
                }
              }}
            />
          )}
        </>
      )}

      {/* Delivery Time */}
      <Text style={{ marginTop: 8 }}>Delivery Time</Text>
      {Platform.OS === 'web' ? (
        // Web: browser-native time picker (30-min steps)
        // @ts-ignore
        <input
          type="time"
          step={1800}
          value={timeStr} // "HH:MM"
          onChange={(e: any) => setTimeStr(e.target.value)}
          style={{
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: 8,
            width: '100%',
          }}
        />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => setShowTime(true)}
            style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
          >
            <Text>{timeStr}</Text>
          </TouchableOpacity>

          {showTime && (
            <DateTimePicker
              value={new Date(`${dateStr}T${timeStr}:00`)}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => {
                setShowTime(false);
                if (d) {
                  const hh = String(d.getHours()).padStart(2, '0');
                  const mm = String(d.getMinutes()).padStart(2, '0');
                  setTimeStr(`${hh}:${mm}`);
                }
              }}
            />
          )}
        </>
      )}

      {/* Submit */}
      <TouchableOpacity
        onPress={submitOrder}
        disabled={!canSubmit}
        style={{
          marginTop: 10,
          backgroundColor: canSubmit ? '#0A84FF' : '#8fbfff',
          padding: 12,
          borderRadius: 10,
          alignItems: 'center',
          opacity: canSubmit ? 1 : 0.7,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>Submit Order</Text>
      </TouchableOpacity>
    </View>
  );
}
