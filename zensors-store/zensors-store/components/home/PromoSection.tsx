'use client'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function PromoSection() {
  const [copied, setCopied] = useState(false)
  const [ref, inView] = useInView({ triggerOnce:true, threshold:0.2 })

  const handleCopy = () => {
    navigator.clipboard.writeText('ZEN20')
    setCopied(true)
    toast.success('Coupon code copied!')
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <section ref={ref} className="py-20 px-6 lg:px-14">
      <div className="max-w-[1440px] mx-auto">
        <motion.div initial={{ opacity:0,y:30 }} animate={inView?{ opacity:1,y:0 }:{}} transition={{ duration:0.8 }}
          className="relative overflow-hidden border border-blue-900/20 p-12 lg:p-16"
          style={{ background:'linear-gradient(135deg,#0C1A30,#111E38,#0C1A2E)' }}>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[80px]"/>
            <div className="absolute left-0 bottom-0 w-[300px] h-[300px] rounded-full bg-gold/5 blur-[80px]"/>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div>
              <p className="text-gold text-[10px] tracking-[4px] uppercase mb-4">Limited Time Offer</p>
              <h2 className="font-display text-4xl lg:text-5xl font-light text-cream leading-tight mb-4">
                First Order,<br/>
                <span className="gold-text italic">20% Off</span>
              </h2>
              <p className="text-steel text-sm leading-relaxed max-w-md">
                Use code at checkout. Free shipping on all orders above ₹999. Valid for new customers only. No minimum cart value.
              </p>
            </div>

            <div className="text-center flex-shrink-0">
              <div className="border border-dashed border-gold/40 p-8 mb-5 bg-black/20">
                <p className="text-steel text-[9px] tracking-[3px] uppercase mb-2">Coupon Code</p>
                <p className="font-display text-4xl tracking-[8px] gold-text">ZEN20</p>
              </div>
              <button onClick={handleCopy}
                className="btn-gold flex items-center gap-2 mx-auto">
                {copied ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy & Shop</>}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
