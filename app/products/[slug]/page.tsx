'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingBag, Heart, Star, ChevronLeft, Truck, Shield, RefreshCw, Award } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/cart/CartSidebar'
import ProductCard from '@/components/product/ProductCard'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import { formatPrice, getDiscount } from '@/lib/utils'
import type { Product, Review } from '@/types'
import { DUMMY_PRODUCTS } from '@/lib/dummyData'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug }               = useParams<{ slug:string }>()
  const [product,  setProduct] = useState<Product|null>(null)
  const [related,  setRelated] = useState<Product[]>([])
  const [reviews,  setReviews] = useState<Review[]>([])
  const [mainImg,  setMainImg] = useState(0)
  const [qty,      setQty]     = useState(1)
  const [variantId,setVariant] = useState<string|null>(null)
  const [tab,      setTab]     = useState<'desc'|'reviews'>('desc')
  const [loading,  setLoading] = useState(true)
  const addItem    = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlist()

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      try {
        const sb = createClient()
        const { data: p, error } = await sb.from('products')
          .select('*,category:categories(name,slug),variants:product_variants(*)')
          .eq('slug', slug).single()
        
        let foundProduct = p
        
        if (!p || error) {
          foundProduct = DUMMY_PRODUCTS.find(dp => dp.slug === slug)
        }
        
        if (!foundProduct) {
          setLoading(false)
          return
        }

        setProduct(foundProduct as Product)
        setLoading(false)

        const { data: rv } = await sb.from('reviews')
          .select('*,user:profiles(full_name)').eq('product_id', foundProduct.id).order('created_at',{ascending:false})
        setReviews(rv || [])

        const { data: rel, error: relErr } = await sb.from('products')
          .select('*,category:categories(name,slug)')
          .eq('category_id', foundProduct.category_id).neq('id', foundProduct.id).limit(4)
        
        if (!rel || rel.length === 0 || relErr) {
          setRelated(DUMMY_PRODUCTS.filter(dp => dp.category_id === foundProduct.category_id && dp.id !== foundProduct.id).slice(0, 4))
        } else {
          setRelated(rel || [])
        }
      } catch (err) {
        const foundProduct = DUMMY_PRODUCTS.find(dp => dp.slug === slug)
        if (foundProduct) {
          setProduct(foundProduct as Product)
          setRelated(DUMMY_PRODUCTS.filter(dp => dp.category_id === foundProduct.category_id && dp.id !== foundProduct.id).slice(0, 4))
        }
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) return (
    <><Navbar/><CartSidebar/>
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin"/>
      </div>
    </>
  )

  if (!product) return (
    <><Navbar/><CartSidebar/>
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl text-cream/20 mb-4">Product not found</p>
          <Link href="/products" className="btn-gold">Back to Shop</Link>
        </div>
      </div>
    </>
  )

  const discount  = product.compare_price ? getDiscount(product.price, product.compare_price) : null
  const selVariant = product.variants?.find(v => v.id === variantId) || null

  const handleAddToCart = () => {
    addItem(product, qty, selVariant || undefined)
    toast.success('Added to cart!')
  }

  return (
    <><Navbar/><CartSidebar/>
      <main className="pt-[72px] min-h-screen">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-steel mb-8">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gold transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-cream/50">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {/* Images */}
            <motion.div initial={{ opacity:0,x:-30 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.7 }}>
              <div className="relative overflow-hidden mb-3 flex items-center justify-center h-[480px]"
                style={{ background:'linear-gradient(145deg,#111E35,#162540)' }}>
                {product.images?.[mainImg] ? (
                  <img src={product.images[mainImg]} alt={product.name} className="w-full h-full object-contain"/>
                ) : (
                  <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:3,repeat:Infinity,ease:'easeInOut' }}
                    className="text-[120px] drop-shadow-[0_0_40px_rgba(201,168,76,0.3)]">
                    {product.category?.slug==='fine-jewelry'?'💍':product.category?.slug==='school-bags'?'🎒':product.category?.slug==='bottles'?'🍶':'✨'}
                  </motion.div>
                )}
                {discount && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-[#1E4D8C] to-[#2563EB] text-white text-[9px] tracking-widest uppercase px-3 py-1.5 font-medium">
                    {discount}% off
                  </span>
                )}
              </div>
              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img,i) => (
                    <button key={i} onClick={() => setMainImg(i)}
                      className={`w-16 h-16 overflow-hidden border-2 transition-all ${mainImg===i?'border-gold':'border-transparent opacity-50 hover:opacity-80'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover"/>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.7, delay:0.1 }}>
              <p className="text-[9px] tracking-[3px] uppercase text-gold mb-2">Zenzors {product.category?.name}</p>
              <h1 className="font-display text-3xl lg:text-4xl font-light text-cream mb-3">{product.name}</h1>

              {/* Rating */}
              {product.rating_avg && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_,i) => (
                      <Star key={i} size={13} className={i < Math.floor(product.rating_avg!) ? 'fill-gold text-gold':'text-steel'}/>
                    ))}
                  </div>
                  <span className="text-steel text-xs">({product.rating_count} reviews)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-display text-3xl gold-text">{formatPrice(product.price)}</span>
                {product.compare_price && <s className="text-steel text-lg">{formatPrice(product.compare_price)}</s>}
                {discount && <span className="bg-emerald-400/10 text-emerald-400 text-xs px-2 py-1">{discount}% off</span>}
              </div>

              <p className="text-steel text-sm leading-relaxed mb-6">{product.description}</p>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] tracking-widest uppercase text-steel mb-3">{product.variants[0]?.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(v => (
                      <button key={v.id} onClick={() => setVariant(v.id)}
                        className={`px-4 py-2 text-xs border transition-all ${
                          variantId===v.id ? 'border-gold bg-gold/10 text-gold' : 'border-blue-900/30 text-steel hover:border-gold/40'
                        }`}>
                        {v.value}
                        {v.price_modifier > 0 && <span className="text-[9px] ml-1 opacity-60">+{formatPrice(v.price_modifier)}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty + Add to cart */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-blue-900/20">
                  <button onClick={() => setQty(Math.max(1,qty-1))} className="w-10 h-12 text-steel hover:text-cream flex items-center justify-center text-lg">−</button>
                  <span className="w-12 text-center text-cream text-sm">{qty}</span>
                  <button onClick={() => setQty(qty+1)} className="w-10 h-12 text-steel hover:text-cream flex items-center justify-center text-lg">+</button>
                </div>
                <button onClick={handleAddToCart}
                  className="btn-gold flex-1 py-3.5 flex items-center justify-center gap-2">
                  <ShoppingBag size={14}/> Add to Cart
                </button>
                <button onClick={() => { toggle(product); toast.success(has(product.id)?'Removed from wishlist':'Added to wishlist') }}
                  className={`w-12 h-12 border flex items-center justify-center transition-all ${has(product.id)?'border-gold bg-gold/10 text-gold':'border-blue-900/20 text-steel hover:border-gold/40 hover:text-gold'}`}>
                  <Heart size={16} className={has(product.id)?'fill-gold':''}/>
                </button>
              </div>

              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-orange-400 text-xs mb-4">⚠ Only {product.stock} left in stock</p>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/5">
                {[
                  [Truck,   'Free Shipping', 'On orders above ₹999'],
                  [Shield,  'Secure Payment','Razorpay protected'],
                  [RefreshCw,'Easy Returns', '30 day return policy'],
                  [Award,   'Genuine Product','100% authentic'],
                ].map(([Icon,title,sub]:any) => (
                  <div key={title} className="flex items-start gap-3">
                    <div className="w-8 h-8 border border-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={13} className="text-gold"/>
                    </div>
                    <div>
                      <p className="text-cream text-xs font-medium">{title}</p>
                      <p className="text-steel text-[10px]">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-0">
            {(['desc','reviews'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-8 py-3 text-[10px] tracking-widest uppercase transition-all ${tab===t?'bg-gold text-navy font-medium':'border border-blue-900/20 text-steel hover:text-cream'}`}>
                {t === 'desc' ? 'Description' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="card p-8 mb-16">
            {tab === 'desc' ? (
              <p className="text-steel text-sm leading-relaxed">{product.description || 'No description available.'}</p>
            ) : (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-steel text-sm">No reviews yet. Be the first to review!</p>
                ) : reviews.map(r => (
                  <div key={r.id} className="flex gap-4 pb-6 border-b border-white/5 last:border-0">
                    <div className="w-10 h-10 bg-navy-light flex items-center justify-center text-steel flex-shrink-0">
                      {r.user?.full_name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-cream text-sm">{r.user?.full_name || 'Customer'}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_,i) => <Star key={i} size={10} className={i<r.rating?'fill-gold text-gold':'text-steel'}/>)}
                        </div>
                      </div>
                      <p className="text-steel text-sm">{r.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <>
              <h2 className="section-title mb-8">You May Also <em className="gold-text not-italic">Like</em></h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
                {related.map(p => <ProductCard key={p.id} product={p}/>)}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer/>
    </>
  )
}
