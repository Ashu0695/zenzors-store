'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { useCartStore } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice, getDiscount } from '@/lib/utils'
import type { Product } from '@/types'
import toast from 'react-hot-toast'

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const addItem   = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlist()
  const wished    = has(product.id)
  const discount  = product.compare_price ? getDiscount(product.price, product.compare_price) : null

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    toggle(product)
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <motion.div
      initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:'-50px' }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      className="group relative card cursor-pointer"
    >
      <Link href={`/products/${product.slug}`}>
        {/* Image area */}
        <div className="relative overflow-hidden h-[280px] flex items-center justify-center"
          style={{ background:'linear-gradient(145deg,rgba(17,30,53,0.9),rgba(22,37,64,0.95))' }}>

          {/* Product image or emoji placeholder */}
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
          ) : (
            <motion.div animate={hovered?{ y:-8,scale:1.05 }:{ y:0,scale:1 }} transition={{ duration:0.4 }}
              className="text-7xl drop-shadow-[0_0_20px_rgba(201,168,76,0.3)]">
              {product.category?.slug==='fine-jewelry'?'💍':product.category?.slug==='school-bags'?'🎒':product.category?.slug==='bottles'?'🍶':'✨'}
            </motion.div>
          )}

          {/* Badge */}
          {discount && discount > 0 && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-[#1E4D8C] to-[#2563EB] text-white text-[8px] tracking-widest uppercase px-2.5 py-1 font-medium">
              {discount}% off
            </span>
          )}
          {product.is_featured && !discount && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-gold to-gold-light text-navy text-[8px] tracking-widest uppercase px-2.5 py-1 font-medium">
              Featured
            </span>
          )}

          {/* Actions overlay */}
          <motion.div initial={{ opacity:0,y:10 }} animate={hovered?{ opacity:1,y:0 }:{ opacity:0,y:10 }}
            transition={{ duration:0.25 }}
            className="absolute bottom-0 left-0 right-0 flex gap-0.5">
            <button onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-[#1E4D8C] to-[#2563EB] text-white py-3 text-[9px] tracking-[1.5px] uppercase font-medium hover:brightness-110 transition-all flex items-center justify-center gap-1.5">
              <ShoppingBag size={11}/> Add to Cart
            </button>
            <button onClick={handleWishlist}
              className={`px-4 py-3 transition-all ${wished?'bg-gold text-navy':'bg-navy-mid/80 text-cream hover:bg-navy-light'}`}>
              <Heart size={14} className={wished?'fill-navy':''}/>
            </button>
          </motion.div>

          {/* Quick view */}
          <motion.div initial={{ opacity:0 }} animate={hovered?{ opacity:1 }:{ opacity:0 }}
            className="absolute top-3 right-3">
            <div className="w-8 h-8 glass flex items-center justify-center text-cream/60">
              <Eye size={13}/>
            </div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-5">
          <p className="text-[8px] tracking-[2px] uppercase text-gold mb-1.5 font-body">Zenzors {product.category?.name || 'Fine'}</p>
          <p className="font-display text-lg text-cream leading-tight mb-2 line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-cream text-base font-medium">{formatPrice(product.price)}</span>
            {product.compare_price && <s className="text-steel text-xs">{formatPrice(product.compare_price)}</s>}
            {discount && <span className="text-emerald-400 text-[9px] font-medium">{discount}% off</span>}
          </div>
          {product.rating_avg && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_,i) => (
                <Star key={i} size={10} className={i < Math.floor(product.rating_avg!) ? 'fill-gold text-gold' : 'text-steel'}/>
              ))}
              <span className="text-steel text-[10px] ml-1">({product.rating_count || 0})</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
