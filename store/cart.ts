// store/cart.ts
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type CartItem = { id: string; name: string; unit_cents: number; qty: number };

type State = {
  items: CartItem[];
  add: (p: { id: string; name: string; unit_cents: number; qty?: number }) => void;
  remove: (id: string) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  clear: () => void;
  totalCents: () => number;
  itemCount: () => number;
};

// Always return a valid storage (fixes TS2322)
// - Web: localStorage
// - Native: simple in-memory fallback
const createStorage = (): StateStorage => {
  if (typeof window !== 'undefined' && window?.localStorage) {
    return {
      getItem: async (name: string) => window.localStorage.getItem(name),
      setItem: async (name: string, value: string) => {
        window.localStorage.setItem(name, value);
      },
      removeItem: async (name: string) => {
        window.localStorage.removeItem(name);
      },
    };
  }
  const mem: Record<string, string | undefined> = {};
  return {
    getItem: async (name: string) => mem[name] ?? null,
    setItem: async (name: string, value: string) => {
      mem[name] = value;
    },
    removeItem: async (name: string) => {
      delete mem[name];
    },
  };
};

export const useCart = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      add: ({ id, name, unit_cents, qty = 1 }) => {
        const items = [...get().items];
        const i = items.findIndex((x) => x.id === id);
        if (i >= 0) {
          items[i] = { ...items[i], qty: items[i].qty + qty }; // NEW object
        } else {
          items.push({ id, name, unit_cents, qty });
        }
        set({ items });
      },
      remove: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
      inc: (id) =>
        set({
          items: get().items.map((x) =>
            x.id === id ? { ...x, qty: x.qty + 1 } : x
          ),
        }),
      dec: (id) =>
        set({
          items: get().items.map((x) =>
            x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x
          ),
        }),
      clear: () => set({ items: [] }),
      totalCents: () =>
        get().items.reduce((s, x) => s + x.qty * x.unit_cents, 0),
      itemCount: () => get().items.reduce((s, x) => s + x.qty, 0),
    }),
    {
      name: 'aerokits-cart',
      storage: createJSONStorage(createStorage), // <- always valid
    }
  )
);
