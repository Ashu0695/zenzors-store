'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

interface WishlistStore {
  items: Product[]
  toggle: (p: Product) => void
  has: (id: string) => boolean
}

export const useWishlist = create<WishlistStore>()(
  persist((set, get) => ({
    items: [],
    toggle: (p) => set(s => ({
      items: s.items.find(i => i.id === p.id) ? s.items.filter(i => i.id !== p.id) : [...s.items, p]
    })),
    has: (id) => get().items.some(i => i.id === id),
  }), { name: 'zensors-wishlist' })
)
