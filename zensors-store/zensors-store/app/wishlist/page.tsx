'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/cart/CartSidebar'
import ProductCard from '@/components/product/ProductCard'
import { useWishlist } from '@/hooks/useWishlist'

export default function WishlistPage() {
  const { items } = useWishlist()

  return (
    <><Navbar /><CartSidebar />
      <main className="pt-[72px] min-h-screen">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-12">
          <div className="section-tag">Saved Items</div>
          <h1 className="section-title mb-10">My <em className="gold-text not-italic">Wishlist</em></h1>

          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center">
              <Heart size={56} className="text-cream/10 mb-5" />
              <p className="font-display text-2xl text-cream/30 mb-3">Your wishlist is empty</p>
              <p className="text-steel text-sm mb-8">Save items you love and come back to them anytime</p>
              <Link href="/products" className="btn-gold">Explore Collection</Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
