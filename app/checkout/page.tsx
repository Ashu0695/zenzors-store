'use client'
export const dynamic = 'force-dynamic'
import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Tag, Loader2 } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import CartSidebar from '@/components/cart/CartSidebar'
import { useCartStore } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

declare global { interface Window { Razorpay: any } }

// ─── Field MUST be defined OUTSIDE the page component ──────────────────────
// If defined inside, React creates a new component type on every render,
// which unmounts/remounts the <input> on every keystroke, losing focus.
interface FieldProps {
  label: string
  name: string
  required?: boolean
  placeholder?: string
  className?: string
  value: string
  onChange: (name: string, value: string) => void
}

function Field({ label, name, required, placeholder, className, value, onChange }: FieldProps) {
  return (
    <div className={className}>
      <label className="block text-[10px] tracking-widest uppercase text-steel mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(name, e.target.value)}
        className="w-full bg-navy-card border border-blue-900/20 px-4 py-3 text-sm text-cream placeholder:text-steel/40 focus:outline-none focus:border-gold/50 transition-colors"
      />
    </div>
  )
}
// ───────────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [form, setForm] = useState({
    name:'', email:'', phone:'', line1:'', line2:'', city:'', state:'', pincode:''
  })
  const [coupon,    setCoupon]    = useState('')
  const [discount,  setDiscount]  = useState(0)
  const [couponMsg, setCouponMsg] = useState('')
  const [placing,   setPlacing]   = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Stable onChange handler — doesn't change identity on re-renders
  const handleFieldChange = useCallback((name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }, [])

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        if (!data.user) {
          toast.error('Please sign in to complete your checkout')
          router.push('/auth')
        } else {
          setCheckingAuth(false)
        }
      })
    })
  }, [router])

  const subtotal   = total()
  const shipping   = subtotal >= 999 ? 0 : 99
  const finalTotal = subtotal - discount + shipping

  const applyCoupon = async () => {
    if (!coupon) return
    // Demo mode: accept ZEN20 without DB
    if (coupon.toUpperCase() === 'ZEN20') {
      const amt = Math.round(subtotal * 20 / 100)
      setDiscount(amt)
      setCouponMsg(`✓ Saved ${formatPrice(amt)}! 20% off applied.`)
      return
    }
    try {
      const sb = createClient()
      const { data } = await sb.from('coupons').select('*').eq('code', coupon.toUpperCase()).eq('is_active', true).single()
      if (!data) { setCouponMsg('Invalid coupon code'); return }
      if (subtotal < data.min_order) { setCouponMsg(`Minimum order ₹${data.min_order}`); return }
      const amt = data.type === 'percentage' ? Math.round(subtotal * data.value / 100) : data.value
      setDiscount(amt)
      setCouponMsg(`✓ Saved ${formatPrice(amt)}!`)
    } catch {
      setCouponMsg('Invalid coupon code')
    }
  }

  const loadRazorpay = () => new Promise(resolve => {
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

  const handlePlaceOrder = async () => {
    if (!form.name || !form.phone || !form.line1 || !form.city || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }
    setPlacing(true)
    const saveOrder = async (payId: string) => {
      try {
        const sb = createClient()
        const { data: { user } } = await sb.auth.getUser()
        const { data: order } = await sb.from('orders').insert({
          user_id: user?.id,
          subtotal, discount, shipping, total: finalTotal,
          status: 'pending', payment_status: 'paid',
          payment_id: payId,
          coupon_code: coupon || null,
          shipping_address: {
            name:form.name, phone:form.phone, line1:form.line1,
            line2:form.line2, city:form.city, state:form.state, pincode:form.pincode
          },
        }).select().single()
        if (order) {
          await sb.from('order_items').insert(
            items.map(i => ({
              order_id: order.id, product_id: i.product.id,
              quantity: i.quantity, price: i.product.price, variant: i.variant?.value
            }))
          )
        }
      } catch (e) {
        console.error('Order save failed:', e)
      }
    }

    try {
      const res = await fetch('/api/razorpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotal }),
      })
      const json = await res.json()

      // ── DEMO MODE (no Razorpay credentials configured yet) ─────────────
      if (json.demo || !json.orderId || json.orderId?.startsWith('demo_')) {
        // Simulate successful order without real payment
        await saveOrder(json.orderId || `demo_${Date.now()}`)
        clearCart()
        toast.success('🎉 Demo order placed successfully!')
        router.push('/account')
        setPlacing(false)
        return
      }

      // ── REAL RAZORPAY PAYMENT ───────────────────────────────────────────
      await loadRazorpay()
      const rz = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: finalTotal * 100,
        currency: 'INR',
        name: 'Zenzors',
        description: 'Premium Lifestyle Products',
        order_id: json.orderId,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#C9A84C' },
        handler: async (response: any) => {
          await saveOrder(response.razorpay_payment_id)
          clearCart()
          toast.success('Order placed successfully! 🎉')
          router.push('/account')
        },
        modal: { ondismiss: () => setPlacing(false) },
      })
      rz.open()
    } catch {
      toast.error('Something went wrong. Please try again.')
      setPlacing(false)
    }
  }

  if (items.length === 0) return (
    <><Navbar/><CartSidebar/>
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl text-cream/20 mb-4">Your cart is empty</p>
          <button onClick={() => router.push('/products')} className="btn-gold">Start Shopping</button>
        </div>
      </div>
    </>
  )

  if (checkingAuth) return (
    <><Navbar/><CartSidebar/>
      <div className="pt-[72px] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin"/>
      </div>
    </>
  )

  return (
    <><Navbar/><CartSidebar/>
      <main className="pt-[72px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-14 py-12">
          <div className="section-tag">Checkout</div>
          <h1 className="section-title mb-10">Complete Your <em className="gold-text not-italic">Order</em></h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-8">
              <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} className="card p-6">
                <h3 className="font-display text-lg text-cream mb-5">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" name="name" required placeholder="Your name"
                    value={form.name} onChange={handleFieldChange}/>
                  <Field label="Phone" name="phone" required placeholder="+91 XXXXX XXXXX"
                    value={form.phone} onChange={handleFieldChange}/>
                  <Field label="Email" name="email" placeholder="you@email.com"
                    value={form.email} onChange={handleFieldChange} className="sm:col-span-2"/>
                </div>
              </motion.div>

              <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }} className="card p-6">
                <h3 className="font-display text-lg text-cream mb-5">Shipping Address</h3>
                <div className="space-y-4">
                  <Field label="Address Line 1" name="line1" required placeholder="House / Flat / Building No."
                    value={form.line1} onChange={handleFieldChange}/>
                  <Field label="Address Line 2" name="line2" placeholder="Street / Area / Locality (optional)"
                    value={form.line2} onChange={handleFieldChange}/>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="City"    name="city"    required placeholder="City"
                      value={form.city}    onChange={handleFieldChange}/>
                    <Field label="State"   name="state"   placeholder="State"
                      value={form.state}   onChange={handleFieldChange}/>
                    <Field label="Pincode" name="pincode" required placeholder="000000"
                      value={form.pincode} onChange={handleFieldChange}/>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Summary */}
            <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
              className="lg:col-span-2 space-y-4 h-fit sticky top-24">
              <div className="card p-6">
                <h3 className="font-display text-lg text-cream mb-5">Order Summary</h3>
                <div className="space-y-3 mb-5 max-h-60 overflow-y-auto">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-navy-light flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.product.images?.[0]
                          ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover"/>
                          : <span className="text-2xl">💎</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-cream text-xs truncate">{item.product.name}</p>
                        <p className="text-steel text-[10px]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-cream text-xs font-medium">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel"/>
                    <input value={coupon} onChange={e => setCoupon(e.target.value)}
                      placeholder="Coupon code (try ZEN20)"
                      className="w-full bg-navy-light border border-blue-900/20 pl-8 pr-3 py-2.5 text-xs text-cream placeholder:text-steel/40 focus:outline-none focus:border-gold/50"/>
                  </div>
                  <button onClick={applyCoupon}
                    className="px-4 py-2.5 bg-gold/10 border border-gold/30 text-gold text-xs hover:bg-gold/20 transition-colors">
                    Apply
                  </button>
                </div>
                {couponMsg && <p className={`text-xs mb-4 ${couponMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{couponMsg}</p>}

                <div className="space-y-2.5 text-sm border-t border-white/5 pt-4">
                  <div className="flex justify-between text-steel"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>−{formatPrice(discount)}</span></div>}
                  <div className="flex justify-between text-steel">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-emerald-400">Free</span> : formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-cream font-medium text-base border-t border-white/5 pt-3 mt-2">
                    <span>Total</span>
                    <span className="gold-text font-display text-xl">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              <button onClick={handlePlaceOrder} disabled={placing}
                className="btn-gold w-full py-4 flex items-center justify-center gap-2 disabled:opacity-60">
                {placing
                  ? <><Loader2 size={14} className="animate-spin"/> Processing...</>
                  : <><ShieldCheck size={14}/> Pay {formatPrice(finalTotal)}</>}
              </button>
              <p className="text-center text-steel text-[10px] flex items-center justify-center gap-1.5">
                <ShieldCheck size={11}/> 100% Secure Payment via Razorpay
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  )
}
