'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Award, Camera, Send, X, Loader2 } from 'lucide-react'
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

// ── Star Rating Picker ──────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={22}
            className={
              n <= (hovered || value)
                ? 'fill-gold text-gold'
                : 'text-steel hover:text-gold/50'
            }
          />
        </button>
      ))}
    </div>
  )
}

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

  // ── Auto-slideshow ──────────────────────────────────────────────────────
  const slideTimer  = useRef<ReturnType<typeof setInterval>|null>(null)
  const pauseTimer  = useRef<ReturnType<typeof setTimeout>|null>(null)
  const imgCount    = useRef(0)

  const stopSlide = useCallback(() => {
    if (slideTimer.current)  { clearInterval(slideTimer.current);  slideTimer.current  = null }
    if (pauseTimer.current)  { clearTimeout(pauseTimer.current);   pauseTimer.current  = null }
  }, [])

  const startSlide = useCallback(() => {
    stopSlide()
    if (imgCount.current <= 1) return
    slideTimer.current = setInterval(() => {
      setMainImg(i => (i + 1) % imgCount.current)
    }, 3500)
  }, [stopSlide])

  // Pause slideshow for 8s after user manually changes image
  const pauseSlide = useCallback(() => {
    stopSlide()
    pauseTimer.current = setTimeout(() => startSlide(), 8000)
  }, [stopSlide, startSlide])

  const goNext = useCallback(() => {
    setMainImg(i => (i + 1) % imgCount.current)
    pauseSlide()
  }, [pauseSlide])

  const goPrev = useCallback(() => {
    setMainImg(i => (i - 1 + imgCount.current) % imgCount.current)
    pauseSlide()
  }, [pauseSlide])

  // ── Review form state ───────────────────────────────────────────────────
  const [reviewRating,  setReviewRating]  = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewFile,    setReviewFile]    = useState<File|null>(null)
  const [reviewPreview, setReviewPreview] = useState<string|null>(null)
  const [submitting,    setSubmitting]    = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string|null>(null)

  const addItem    = useCartStore(s => s.addItem)
  const { toggle, has } = useWishlist()

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null)
    })
  }, [])

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
        if (!foundProduct) { setLoading(false); return }

        setProduct(foundProduct as Product)
        imgCount.current = foundProduct.images?.length || 0
        setLoading(false)

        if ((foundProduct.images?.length || 0) > 1) startSlide()

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
          imgCount.current = foundProduct.images?.length || 0
          setRelated(DUMMY_PRODUCTS.filter(dp => dp.category_id === foundProduct.category_id && dp.id !== foundProduct.id).slice(0, 4))
        }
        setLoading(false)
      }
    }
    load()
    return () => stopSlide()
  }, [slug])

  // ── Submit Review ───────────────────────────────────────────────────────
  const submitReview = async () => {
    if (!currentUserId) { toast.error('Please sign in to submit a review'); return }
    if (!reviewComment.trim()) { toast.error('Please write a comment'); return }
    if (!product) return
    setSubmitting(true)
    try {
      const sb = createClient()
      let imageUrl: string | null = null

      if (reviewFile) {
        const ext  = reviewFile.name.split('.').pop()
        const path = `reviews/${Date.now()}.${ext}`
        const { error: upErr } = await sb.storage.from('product-images').upload(path, reviewFile)
        if (!upErr) {
          const { data: urlData } = sb.storage.from('product-images').getPublicUrl(path)
          imageUrl = urlData.publicUrl
        }
      }

      const payload: any = {
        product_id: product.id,
        user_id:    currentUserId,
        rating:     reviewRating,
        comment:    reviewComment.trim(),
        created_at: new Date().toISOString(),
      }
      if (imageUrl) payload.images = [imageUrl]

      const { error } = await sb.from('reviews').insert([payload])
      if (error) { toast.error('Failed to submit review'); return }

      toast.success('Review submitted!')
      setReviewComment(''); setReviewRating(5); setReviewFile(null); setReviewPreview(null)

      // Refresh reviews
      const { data: rv } = await sb.from('reviews')
        .select('*,user:profiles(full_name)').eq('product_id', product.id).order('created_at',{ascending:false})
      setReviews(rv || [])
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

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
  const images    = product.images || []

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
            {/* ── Images ──────────────────────────────────────────────── */}
            <motion.div initial={{ opacity:0,x:-30 }} animate={{ opacity:1,x:0 }} transition={{ duration:0.7 }}>
              {/* Main image with arrows */}
              <div className="relative overflow-hidden mb-3 flex items-center justify-center h-[480px] group"
                style={{ background:'linear-gradient(145deg,#111E35,#162540)' }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mainImg}
                    initial={{ opacity:0, x:30 }}
                    animate={{ opacity:1, x:0 }}
                    exit={{ opacity:0, x:-30 }}
                    transition={{ duration:0.4 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {images[mainImg] ? (
                      <img src={images[mainImg]} alt={product.name} className="w-full h-full object-contain"/>
                    ) : (
                      <motion.div animate={{ y:[0,-10,0] }} transition={{ duration:3,repeat:Infinity,ease:'easeInOut' }}
                        className="text-[120px] drop-shadow-[0_0_40px_rgba(201,168,76,0.3)]">
                        {product.category?.slug==='fine-jewelry'?'💍':product.category?.slug==='school-bags'?'🎒':product.category?.slug==='bottles'?'🍶':'✨'}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {discount && (
                  <span className="absolute top-4 left-4 bg-gradient-to-r from-[#1E4D8C] to-[#2563EB] text-white text-[9px] tracking-widest uppercase px-3 py-1.5 font-medium z-10">
                    {discount}% off
                  </span>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <span className="absolute bottom-4 right-4 bg-black/50 text-cream/70 text-[10px] px-2 py-1 z-10">
                    {mainImg + 1} / {images.length}
                  </span>
                )}

                {/* Arrow navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goPrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/40 hover:bg-black/70 flex items-center justify-center text-cream/70 hover:text-cream transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={18}/>
                    </button>
                    <button
                      onClick={goNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-black/40 hover:bg-black/70 flex items-center justify-center text-cream/70 hover:text-cream transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={18}/>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {images.map((img,i) => (
                    <button key={i} onClick={() => { setMainImg(i); pauseSlide() }}
                      className={`w-16 h-16 overflow-hidden border-2 transition-all ${mainImg===i?'border-gold':'border-transparent opacity-50 hover:opacity-80'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover"/>
                    </button>
                  ))}
                </div>
              )}

              {/* Slideshow indicator dots */}
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {images.map((_,i) => (
                    <button key={i} onClick={() => { setMainImg(i); pauseSlide() }}
                      className={`rounded-full transition-all ${mainImg===i?'w-5 h-1.5 bg-gold':'w-1.5 h-1.5 bg-steel/40 hover:bg-steel'}`}/>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Details ─────────────────────────────────────────────── */}
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

              {/* Colors */}
              {(product as any).colors && (product as any).colors.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] tracking-widest uppercase text-steel mb-2">Available Colors</p>
                  <div className="flex flex-wrap gap-2">
                    {(product as any).colors.map((c: string) => (
                      <span key={c} className="px-3 py-1 text-xs border border-blue-900/20 text-cream/70">{c}</span>
                    ))}
                  </div>
                </div>
              )}

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

          {/* ── Tabs ──────────────────────────────────────────────────── */}
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
              <div className="space-y-8">
                {/* ── Write a Review ──────────────────────────────────── */}
                <div className="border border-blue-900/20 p-6">
                  <p className="text-[10px] tracking-widest uppercase text-gold mb-5">Write a Review</p>

                  {!currentUserId ? (
                    <div className="text-center py-4">
                      <p className="text-steel text-sm mb-3">Sign in to share your experience</p>
                      <Link href="/auth" className="btn-gold text-xs px-5 py-2">Sign In</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Star rating */}
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-steel mb-2">Your Rating *</p>
                        <StarPicker value={reviewRating} onChange={setReviewRating}/>
                      </div>

                      {/* Comment */}
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-steel mb-2">Your Review *</p>
                        <textarea
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          rows={3}
                          placeholder="Share your honest experience with this product..."
                          className="w-full bg-navy-light border border-blue-900/20 px-4 py-3 text-sm text-cream placeholder:text-steel/40 focus:outline-none focus:border-gold/50 transition-colors resize-none"
                        />
                      </div>

                      {/* Image upload */}
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-steel mb-2">Photo (optional)</p>
                        {reviewPreview ? (
                          <div className="relative inline-block">
                            <img src={reviewPreview} alt="preview" className="w-24 h-24 object-cover"/>
                            <button
                              type="button"
                              onClick={() => { setReviewFile(null); setReviewPreview(null) }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                            >
                              <X size={10}/>
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-2 w-fit cursor-pointer border border-dashed border-blue-900/30 px-4 py-3 hover:border-gold/40 transition-colors">
                            <Camera size={14} className="text-steel"/>
                            <span className="text-steel text-xs">Add a photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                const f = e.target.files?.[0]
                                if (!f) return
                                setReviewFile(f)
                                setReviewPreview(URL.createObjectURL(f))
                              }}
                            />
                          </label>
                        )}
                      </div>

                      <button
                        onClick={submitReview}
                        disabled={submitting || !reviewComment.trim()}
                        className="btn-gold px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
                      >
                        {submitting
                          ? <><Loader2 size={13} className="animate-spin"/>Submitting...</>
                          : <><Send size={13}/>Submit Review</>}
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Existing Reviews ──────────────────────────────── */}
                {reviews.length === 0 ? (
                  <p className="text-steel text-sm">No reviews yet. Be the first to review!</p>
                ) : reviews.map(r => (
                  <div key={r.id} className="flex gap-4 pb-6 border-b border-white/5 last:border-0">
                    <div className="w-10 h-10 bg-navy-light flex items-center justify-center text-steel flex-shrink-0">
                      {r.user?.full_name?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-cream text-sm">{r.user?.full_name || 'Customer'}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_,i) => <Star key={i} size={10} className={i<r.rating?'fill-gold text-gold':'text-steel'}/>)}
                        </div>
                        <span className="text-steel text-[10px]">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      <p className="text-steel text-sm">{r.comment}</p>
                      {/* Review images */}
                      {(r as any).images && (r as any).images.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {(r as any).images.map((img: string, idx: number) => (
                            <img key={idx} src={img} alt="review" className="w-16 h-16 object-cover border border-blue-900/20"/>
                          ))}
                        </div>
                      )}
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
