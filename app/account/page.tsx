'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Heart, MapPin, LogOut, User, ChevronRight, ShoppingBag } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/cart/CartSidebar'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import type { Order, UserProfile } from '@/types'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string,string> = {
  pending:'text-yellow-400 bg-yellow-400/10', confirmed:'text-blue-400 bg-blue-400/10',
  processing:'text-purple-400 bg-purple-400/10', shipped:'text-cyan-400 bg-cyan-400/10',
  delivered:'text-emerald-400 bg-emerald-400/10', cancelled:'text-red-400 bg-red-400/10',
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile|null>(null)
  const [orders,  setOrders]  = useState<Order[]>([])
  const [tab,     setTab]     = useState<'orders'|'profile'|'wishlist'>('orders')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const sb     = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await sb.auth.getUser()
      if (!user) { router.push('/auth'); return }
      const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: o } = await sb.from('orders').select('*').eq('user_id', user.id).order('created_at',{ascending:false})
      setOrders(o || [])
      setLoading(false)
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

  const TABS = [
    { id:'orders',   label:'My Orders',   icon:Package     },
    { id:'profile',  label:'Profile',     icon:User        },
    { id:'wishlist', label:'Wishlist',    icon:Heart       },
  ] as const

  return (
    <><Navbar/><CartSidebar/>
      <main className="pt-[72px] min-h-screen">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-12">
          <div className="section-tag">My Account</div>
          <h1 className="section-title mb-10">
            Welcome, <em className="gold-text not-italic">{profile?.full_name?.split(' ')[0] || 'Friend'}</em>
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-1">
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

            {/* Content */}
            <div className="lg:col-span-3">
              {tab === 'orders' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <h2 className="font-display text-2xl text-cream mb-6">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="card p-12 text-center">
                      <ShoppingBag size={40} className="text-cream/10 mx-auto mb-4"/>
                      <p className="text-steel mb-4">No orders yet</p>
                      <Link href="/products" className="btn-gold">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="card p-5">
                          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                            <div>
                              <p className="text-cream text-sm font-medium">#{order.id.slice(-8).toUpperCase()}</p>
                              <p className="text-steel text-xs mt-0.5">{new Date(order.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] tracking-widest uppercase px-2.5 py-1 ${STATUS_COLOR[order.status]||'text-steel bg-white/5'}`}>
                                {order.status}
                              </span>
                              <span className="font-display text-lg gold-text">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                          {order.shipping_address && (
                            <p className="text-steel text-xs flex items-center gap-1.5">
                              <MapPin size={11}/> {order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {tab === 'profile' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="card p-6">
                  <h2 className="font-display text-2xl text-cream mb-6">Profile</h2>
                  <div className="space-y-4">
                    {[
                      { label:'Full Name', value:profile?.full_name },
                      { label:'Email',     value:profile?.email     },
                      { label:'Phone',     value:profile?.phone || 'Not set' },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-[10px] tracking-widest uppercase text-steel mb-1">{f.label}</p>
                        <p className="text-cream text-sm">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'wishlist' && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <h2 className="font-display text-2xl text-cream mb-6">Wishlist</h2>
                  <p className="text-steel text-sm">Your saved items appear here.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  )
}
