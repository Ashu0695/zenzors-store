'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCartStore } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQty, total, count } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={toggleCart}/>
          <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
            transition={{ type:'spring', damping:30, stiffness:300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-navy-mid border-l border-blue-900/25 z-50 flex flex-col">

            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <h2 className="font-display text-xl font-light tracking-wider">Your Cart</h2>
                <p className="text-steel text-xs mt-0.5">{count()} item{count()!==1?'s':''}</p>
              </div>
              <button onClick={toggleCart} className="text-cream/40 hover:text-cream transition-colors"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-6 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-cream/10 mb-4"/>
                  <p className="text-steel text-sm mb-6">Your cart is empty</p>
                  <button onClick={toggleCart} className="btn-gold">Continue Shopping</button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div key={item.id} layout initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}
                      className="flex gap-4 p-3 bg-navy-light/40 border border-white/5">
                      <div className="w-20 h-20 bg-navy-light flex items-center justify-center flex-shrink-0 text-3xl">
                        {item.product.images?.[0]
                          ? <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover"/>
                          : '💎'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-sm text-cream truncate">{item.product.name}</p>
                        {item.variant && <p className="text-steel text-xs">{item.variant.name}: {item.variant.value}</p>}
                        <p className="gold-text text-sm font-medium mt-1">
                          {formatPrice(item.product.price + (item.variant?.price_modifier||0))}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button onClick={() => updateQty(item.id, item.quantity-1)}
                            className="w-6 h-6 border border-white/10 flex items-center justify-center text-cream/50 hover:border-gold/40 hover:text-cream transition-colors">
                            <Minus size={10}/>
                          </button>
                          <span className="text-xs text-cream w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.quantity+1)}
                            className="w-6 h-6 border border-white/10 flex items-center justify-center text-cream/50 hover:border-gold/40 hover:text-cream transition-colors">
                            <Plus size={10}/>
                          </button>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-cream/25 hover:text-red-400 transition-colors">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between">
                  <span className="text-steel text-sm">Subtotal</span>
                  <span className="font-display text-lg gold-text">{formatPrice(total())}</span>
                </div>
                <p className="text-steel text-xs">Shipping & taxes at checkout</p>
                <Link href="/checkout" onClick={toggleCart} className="btn-gold w-full py-4">Proceed to Checkout</Link>
                <button onClick={toggleCart} className="w-full text-center text-steel text-[10px] tracking-widest uppercase hover:text-cream transition-colors">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
