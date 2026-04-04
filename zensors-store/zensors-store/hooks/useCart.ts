'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, ProductVariant } from '@/types'

interface CartStore {
  items: CartItem[]; isOpen: boolean;
  addItem: (p: Product, qty?: number, v?: ProductVariant) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>()(
  persist((set, get) => ({
    items: [], isOpen: false,
    addItem: (product, qty = 1, variant) => {
      const ex = get().items.find(i => i.product.id === product.id && i.variant?.id === variant?.id)
      if (ex) set(s => ({ items: s.items.map(i => i.id === ex.id ? { ...i, quantity: i.quantity + qty } : i) }))
      else set(s => ({ items: [...s.items, { id: `${product.id}-${variant?.id||'x'}-${Date.now()}`, product, quantity: qty, variant }] }))
    },
    removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
    updateQty: (id, qty) => set(s => ({ items: qty <= 0 ? s.items.filter(i => i.id !== id) : s.items.map(i => i.id === id ? { ...i, quantity: qty } : i) })),
    clearCart: () => set({ items: [] }),
    toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
    total: () => get().items.reduce((s, i) => s + (i.product.price + (i.variant?.price_modifier||0)) * i.quantity, 0),
    count: () => get().items.reduce((s, i) => s + i.quantity, 0),
  }), { name: 'zensors-cart' })
)
