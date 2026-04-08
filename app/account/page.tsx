'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Package, Heart, LogOut, User, ShoppingBag, MapPin,
  ChevronRight, X, Loader2, CheckCircle, Clock, Truck,
  RotateCcw, XCircle, Star,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/cart/CartSidebar'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Order, UserProfile } from '@/types'
import toast from 'react-hot-toast'

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_STEPS = ['pending','confirmed','processing','shipped','delivered'] as const
const STATUS_META: Record<string,{ color:string; bg:string; icon:any; label:string }> = {
  pending:    { color:'text-yellow-400',  bg:'bg-yellow-400/10',  icon:Clock,        label:'Order Placed'  },
  confirmed:  { color:'text-blue-400',   bg:'bg-blue-400/10',    icon:CheckCircle,  label:'Confirmed'     },
  processing: { color:'text-purple-400', bg:'bg-purple-400/10',  icon:RotateCcw,    label:'Processing'    },
  shipped:    { color:'text-cyan-400',   bg:'bg-cyan-400/10',    icon:Truck,        label:'Shipped'       },
  delivered:  { color:'text-emerald-400',bg:'bg-emerald-400/10', icon:CheckCircle,  label:'Delivered'     },
  cancelled:  { color:'text-red-400',    bg:'bg-red-400/10',     icon:XCircle,      label:'Cancelled'     },
}

// ── Status Timeline ──────────────────────────────────────────────────────────
function StatusTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-2">
        <XCircle size={15} className="text-red-400"/>
        <span className="text-red-400 text-xs tracking-widest uppercase">Order Cancelled</span>
      </div>
    )
  }
  const currentIdx = STATUS_STEPS.indexOf(status as any)
  return (
    <div className="flex items-center overflow-x-auto py-2 scrollbar-hide">
      {STATUS_STEPS.map((step, i) => {
        const done    = i <= currentIdx
        const current = i === currentIdx
        const Icon    = STATUS_META[step].icon
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done
                  ? current ? 'border-gold bg-gold/20' : 'border-emerald-500 bg-emerald-500/20'
                  : 'border-blue-900/30'
              }`}>
                <Icon size={13} className={done ? (current ? 'text-gold' : 'text-emerald-400') : 'text-steel/40'}/>
              </div>
              <p className={`text-[9px] mt-1.5 tracking-wide text-center whitespace-nowrap ${
                done ? (current ? 'text-gold' : 'text-emerald-400') : 'text-steel/40'
              }`}>{STATUS_META[step].label}</p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`h-px w-6 sm:w-10 mx-1 mb-5 ${i < currentIdx ? 'bg-emerald-500/50' : 'bg-blue-900/20'}`}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDetail({ order, onClose }: { order: any; onClose: () => void }) {
  const [items,   setItems]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const sb = createClient()
        const { data } = await sb
          .from('order_items')
          .select('*, product:products(id, name, images, slug, sku)')
          .eq('order_id', order.id)
        setItems(data || [])
      } catch { setItems([]) }
      finally { setLoading(false) }
    }
    load()
  }, [order.id])

  const meta = STATUS_META[order.status] || STATUS_META.pending
  const MetaIcon = meta.icon

  return (
    <motion.div
      initial={{ opacity:0 }}
      animate={{ opacity:1 }}
      exit={{ opacity:0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"/>
      <motion.div
        initial={{ y:'100%' }}
        animate={{ y:0 }}
        exit={{ y:'100%' }}
        transition={{ type:'spring', damping:30, stiffness:300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full sm:max-w-lg bg-[#0D1629] border border-blue-900/20 sm:rounded-2xl rounded-t-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-blue-900/40"/>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 pb-4 border-b border-blue-900/15 flex-shrink-0">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-steel mb-0.5">Order Details</p>
            <h3 className="font-display text-xl text-cream">#{order.id.slice(-8).toUpperCase()}</h3>
            <p className="text-steel text-xs mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] tracking-widest uppercase px-2.5 py-1 flex items-center gap-1 ${meta.bg} ${meta.color}`}>
              <MetaIcon size={9}/> {order.status}
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-steel hover:text-cream ml-1">
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Status Timeline */}
          <div>
            <p className="text-[9px] tracking-widest uppercase text-steel mb-3">Tracking</p>
            <StatusTimeline status={order.status}/>
          </div>

          {/* Items Ordered */}
          <div>
            <p className="text-[9px] tracking-widest uppercase text-steel mb-3">Items Ordered</p>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 size={18} className="animate-spin text-steel"/></div>
            ) : items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item: any, idx: number) => {
                  const prod = item.product || {}
                  const img  = prod.images?.[0] || item.image
                  return (
                    <div key={item.id || idx} className="flex gap-3 p-3 bg-white/3 rounded">
                      <div className="w-16 h-16 flex-shrink-0 overflow-hidden bg-navy-light rounded">
                        {img
                          ? <img src={img} alt={prod.name} className="w-full h-full object-cover"/>
                          : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-cream text-sm font-medium leading-snug">{prod.name || 'Product'}</p>
                        {prod.sku && <p className="text-steel text-[10px] font-mono mt-0.5">{prod.sku}</p>}
                        {item.variant && <p className="text-gold/70 text-[10px] mt-0.5">{item.variant}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-steel text-xs">× {item.quantity}</span>
                          <span className="gold-text text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-steel text-xs">No item details available.</p>
            )}
          </div>

          {/* Delivery Address */}
          {order.shipping_address && (
            <div>
              <p className="text-[9px] tracking-widest uppercase text-steel mb-3 flex items-center gap-1.5">
                <MapPin size={10}/> Delivery Address
              </p>
              <div className="p-3 bg-white/3 rounded text-sm space-y-1">
                <p className="text-cream font-medium">{order.shipping_address.name}</p>
                <p className="text-steel">{order.shipping_address.line1}</p>
                {order.shipping_address.line2 && <p className="text-steel">{order.shipping_address.line2}</p>}
                <p className="text-steel">{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
                <p className="text-steel">{order.shipping_address.phone}</p>
              </div>
            </div>
          )}

          {/* Price Breakup */}
          <div>
            <p className="text-[9px] tracking-widest uppercase text-steel mb-3">Price Breakup</p>
            <div className="p-3 bg-white/3 rounded space-y-2 text-sm">
              <div className="flex justify-between text-steel"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400"><span>Discount applied</span><span>− {formatPrice(order.discount)}</span></div>
              )}
              <div className="flex justify-between text-steel">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? <span className="text-emerald-400">Free</span> : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-cream font-medium border-t border-white/5 pt-2">
                <span>Total Paid</span>
                <span className="gold-text font-display text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <p className="text-[9px] tracking-widest uppercase text-steel mb-3">Payment Info</p>
            <div className="p-3 bg-white/3 rounded text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-steel">Status</span>
                <span className={order.payment_status === 'paid' ? 'text-emerald-400' : 'text-yellow-400'}>
                  {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status}
                </span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between gap-4">
                  <span className="text-steel flex-shrink-0">Reference</span>
                  <span className="text-cream/70 text-[10px] font-mono truncate">{order.payment_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Write Review CTA — only when delivered */}
          {order.status === 'delivered' && items.length > 0 && (
            <div className="p-4 border border-gold/20 bg-gold/5 rounded text-center">
              <Star size={18} className="text-gold mx-auto mb-2"/>
              <p className="text-cream text-sm font-medium mb-1">Enjoying your order?</p>
              <p className="text-steel text-xs mb-3">Share your experience with other shoppers</p>
              {(() => {
                const slug = items[0]?.product?.slug
                return slug ? (
                  <Link href={`/products/${slug}`} onClick={onClose}
                    className="btn-gold text-xs px-5 py-2 inline-flex items-center gap-1.5">
                    <Star size={11}/> Write a Review
                  </Link>
                ) : null
              })()}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const [profile,     setProfile]     = useState<UserProfile|null>(null)
  const [authName,    setAuthName]    = useState('')
  const [orders,      setOrders]      = useState<Order[]>([])
  const [tab,         setTab]         = useState<'orders'|'profile'|'wishlist'>('orders')
  const [loading,     setLoading]     = useState(true)
  const [activeOrder, setActiveOrder] = useState<Order|null>(null)
  const router = useRouter()
  const sb     = createClient()

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await sb.auth.getUser()
        if (!user) { router.push('/auth'); return }
        setAuthName(user.user_metadata?.full_name || '')
        const [{ data: p }, { data: o }] = await Promise.all([
          sb.from('profiles').select('*').eq('id', user.id).single(),
          sb.from('orders').select('*').eq('user_id', user.id).order('created_at',{ascending:false}),
        ])
        if (p) setProfile(p)
        setOrders(o || [])
      } catch (err) {
        console.error('Account load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleLogout = async () => {
    await sb.auth.signOut()
    toast.success('Signed out')
    router.push('/')
  }

  if (loading) return (
    <><Navbar/><CartSidebar/>
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin"/>
      </div>
    </>
  )

  const displayName = profile?.full_name?.split(' ')[0] || authName?.split(' ')[0] || 'Friend'

  const TABS = [
    { id:'orders',   label:'My Orders',  icon:Package },
    { id:'profile',  label:'Profile',    icon:User    },
    { id:'wishlist', label:'Wishlist',   icon:Heart   },
  ] as const

  return (
    <><Navbar/><CartSidebar/>
      <main className="pt-[72px] min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-14 py-8 sm:py-12">
          <div className="section-tag">My Account</div>
          <h1 className="section-title mb-8 sm:mb-10">
            Welcome, <em className="gold-text not-italic">{displayName}</em>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

            {/* Mobile tab bar */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs whitespace-nowrap flex-shrink-0 transition-all ${
                    tab===t.id ? 'bg-gold text-navy font-medium' : 'border border-blue-900/20 text-steel'
                  }`}>
                  <t.icon size={12}/> {t.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs whitespace-nowrap flex-shrink-0 border border-red-900/20 text-steel hover:text-red-400 transition-colors">
                <LogOut size={12}/> Sign Out
              </button>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:block lg:col-span-1 space-y-1">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm transition-all text-left ${
                    tab===t.id ? 'bg-gold/10 border-l-2 border-gold text-gold' : 'text-steel hover:text-cream hover:bg-white/5'
                  }`}>
                  <t.icon size={16}/> {t.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-steel hover:text-red-400 transition-colors text-left mt-4">
                <LogOut size={16}/> Sign Out
              </button>
            </div>

            {/* Content area */}
            <div className="lg:col-span-3">

              {/* ── Orders ──────────────────────────────────────────── */}
              {tab === 'orders' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl sm:text-2xl text-cream">Order History</h2>
                    <span className="text-steel text-xs">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="card p-12 text-center">
                      <ShoppingBag size={40} className="text-cream/10 mx-auto mb-4"/>
                      <p className="text-steel mb-4">No orders yet</p>
                      <Link href="/products" className="btn-gold">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map(order => {
                        const meta = STATUS_META[order.status] || STATUS_META.pending
                        const Icon = meta.icon
                        const currentIdx = STATUS_STEPS.indexOf(order.status as any)
                        return (
                          <motion.button
                            key={order.id}
                            onClick={() => setActiveOrder(order)}
                            whileTap={{ scale:0.99 }}
                            className="w-full card p-4 sm:p-5 text-left hover:border-gold/20 transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                  <span className="text-cream text-sm font-medium font-mono">
                                    #{order.id.slice(-8).toUpperCase()}
                                  </span>
                                  <span className={`text-[9px] tracking-widest uppercase px-2 py-0.5 inline-flex items-center gap-1 ${meta.bg} ${meta.color}`}>
                                    <Icon size={9}/>{order.status}
                                  </span>
                                </div>
                                <p className="text-steel text-xs mb-2">
                                  {new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                                </p>
                                {/* Progress bar */}
                                {order.status !== 'cancelled' && (
                                  <div className="flex items-center gap-0.5 mb-2">
                                    {STATUS_STEPS.map((_, i) => (
                                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                                        i <= currentIdx ? 'bg-gold' : 'bg-blue-900/30'
                                      }`}/>
                                    ))}
                                  </div>
                                )}
                                {order.shipping_address && (
                                  <p className="text-steel/60 text-xs flex items-center gap-1">
                                    <MapPin size={9}/>
                                    {order.shipping_address.city}, {order.shipping_address.state}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <div className="text-right">
                                  <p className="font-display text-base sm:text-lg gold-text">{formatPrice(order.total)}</p>
                                  <p className="text-steel text-[10px]">
                                    {order.payment_status === 'paid' ? '✓ Paid' : order.payment_status}
                                  </p>
                                </div>
                                <ChevronRight size={15} className="text-steel/30 group-hover:text-steel/60 transition-colors"/>
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Profile ─────────────────────────────────────────── */}
              {tab === 'profile' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card p-5 sm:p-6">
                  <h2 className="font-display text-xl sm:text-2xl text-cream mb-6">Profile</h2>
                  <div className="space-y-5">
                    {[
                      { label:'Full Name',    value: profile?.full_name || authName || '—' },
                      { label:'Email',        value: profile?.email || '—' },
                      { label:'Phone',        value: profile?.phone || 'Not set' },
                      { label:'Member Since', value: profile?.created_at
                          ? new Date(profile.created_at).toLocaleDateString('en-IN',{month:'long',year:'numeric'})
                          : '—'
                      },
                    ].map(f => (
                      <div key={f.label} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                        <p className="text-[10px] tracking-widest uppercase text-steel mb-1">{f.label}</p>
                        <p className="text-cream text-sm">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Wishlist ─────────────────────────────────────────── */}
              {tab === 'wishlist' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <h2 className="font-display text-xl sm:text-2xl text-cream mb-6">Wishlist</h2>
                  <div className="card p-10 text-center">
                    <Heart size={36} className="text-cream/10 mx-auto mb-4"/>
                    <p className="text-steel text-sm mb-4">Your saved items appear here</p>
                    <Link href="/products" className="btn-gold text-sm px-6 py-2.5">Explore Products</Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer/>

      {/* Order Detail Overlay */}
      <AnimatePresence>
        {activeOrder && (
          <OrderDetail order={activeOrder} onClose={() => setActiveOrder(null)}/>
        )}
      </AnimatePresence>
    </>
  )
}
