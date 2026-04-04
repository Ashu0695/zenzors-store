'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const fadeUp = (delay = 0) => ({
  initial: { opacity:0, y:32 },
  animate: { opacity:1, y:0 },
  transition: { duration:0.8, delay, ease:[0.22,1,0.36,1] as any },
})

export default function HeroSection({ featured }: { featured?: any }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target:ref, offset:['start start','end start'] })
  const y       = useTransform(scrollYProgress, [0,1], [0,120])
  const opacity = useTransform(scrollYProgress, [0,0.6], [1,0])

  return (
    <section ref={ref} className="relative min-h-screen grid grid-cols-1 lg:grid-cols-2 overflow-hidden pt-[72px]">

      {/* BG blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -left-40 top-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]"/>
        <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-blue-800/15 blur-[100px]"/>
        <div className="absolute left-1/3 bottom-0 w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px]"/>
        {/* grid pattern */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage:'linear-gradient(rgba(59,130,246,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.5) 1px,transparent 1px)', backgroundSize:'60px 60px' }}/>
      </div>

      {/* Left content */}
      <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col justify-center px-8 lg:px-14 py-20">
        <motion.div {...fadeUp(0.1)} className="section-tag">New Collection 2025</motion.div>

        <motion.h1 {...fadeUp(0.2)} className="font-display font-light leading-[0.92] mb-7"
          style={{ fontSize:'clamp(64px,7vw,96px)' }}>
          Wear<br/>Your<br/>
          <span className="gold-text italic">Elegance</span>
        </motion.h1>

        <motion.p {...fadeUp(0.32)} className="text-steel text-[15px] leading-relaxed max-w-sm mb-10">
          Premium jewelry, handcrafted lifestyle accessories, and luxury bags — curated for those who value artistry in every detail.
        </motion.p>

        <motion.div {...fadeUp(0.42)} className="flex flex-wrap gap-3 mb-14">
          <Link href="/products" className="btn-gold">Shop Collection <ArrowRight size={12}/></Link>
          <Link href="/products?sort=newest" className="btn-outline">New Arrivals</Link>
        </motion.div>

        <motion.div {...fadeUp(0.52)} className="flex gap-8 pt-8 border-t border-white/5">
          {[['100%','Genuine Products'],['30-Day','Easy Returns'],['4.9 ★','Customer Rating']].map(([v,l]) => (
            <div key={l}>
              <p className="font-display text-2xl gold-text">{v}</p>
              <p className="text-steel text-[10px] tracking-widest uppercase mt-1">{l}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="relative z-10 hidden lg:flex items-center justify-center">
        <Link href={featured ? `/products/${featured.slug}` : "/products/aurelia-diamond-pendant"}>
          <motion.div
            initial={{ opacity:0, x:60, rotate:3 }} animate={{ opacity:1, x:0, rotate:0 }}
            transition={{ duration:1, delay:0.3, ease:[0.22,1,0.36,1] as any }}
            className="w-[300px] glass shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative cursor-pointer hover:scale-105 transition-transform">
            <div className="absolute -inset-6 bg-blue-500/6 blur-2xl rounded-full -z-10"/>
            <div className="h-[320px] relative flex items-center justify-center overflow-hidden bg-black/20"
              style={{ background:'linear-gradient(145deg,rgba(30,77,140,0.3),rgba(201,168,76,0.1))' }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.1),transparent_65%)]"/>
              <span className="absolute top-3 left-3 bg-gradient-to-r from-[#1E4D8C] to-[#2563EB] text-white text-[8px] tracking-widest uppercase px-3 py-1 font-medium z-20">
                New Arrival
              </span>
              <img src={featured?.images?.[0] || "/images/jewelry.png"} alt={featured?.name || "Featured Product"} className="absolute inset-0 w-full h-full object-cover opacity-80" />
            </div>
            <div className="p-5">
              <p className="font-display text-xl text-cream mb-1">{featured?.name || "Aurelia Diamond Pendant"}</p>
              <p className="text-[10px] tracking-widest text-steel uppercase mb-2">{featured?.category?.name || "Zenzors Fine"}</p>
              <div className="flex items-center gap-2">
                <span className="gold-text text-lg font-medium">{featured ? formatPrice(featured.price) : "₹45,000"}</span>
                {featured?.compare_price ? <s className="text-steel text-xs">{formatPrice(featured.compare_price)}</s> : !featured && <s className="text-steel text-xs">₹55,000</s>}
                {!featured && <span className="text-emerald-400 text-[9px] font-medium">18% off</span>}
              </div>
              <div className="flex gap-0.5 mt-2">
                {[...Array(5)].map((_,i) => <Star key={i} size={10} className="fill-gold text-gold"/>)}
                <span className="text-steel text-[10px] ml-1">(284)</span>
              </div>
            </div>
          </motion.div>
        </Link>

        {/* Chips */}
        {[
          { label:'Orders Today', val:'142 ↑',  color:'#C9A84C', cls:'right-8 top-[28%]'   },
          { label:'Avg Rating',   val:'4.9 ★',  color:'#60A5FA', cls:'left-6 bottom-[32%]' },
          { label:'Customers',    val:'3,200+',  color:'#93C5FD', cls:'right-10 bottom-[17%]' },
        ].map((chip,i) => (
          <motion.div key={chip.label}
            initial={{ opacity:0,scale:0.8 }} animate={{ opacity:1,scale:1 }}
            transition={{ delay:0.7+i*0.15 }}
            className={`absolute ${chip.cls} glass px-4 py-3`}
            style={{ borderLeft:`2px solid ${chip.color}` }}>
            <p className="text-steel text-[8px] tracking-[2px] uppercase mb-1">{chip.label}</p>
            <p className="font-medium text-sm" style={{ color:chip.color }}>{chip.val}</p>
          </motion.div>
        ))}
      </div>

      {/* Scroll cue */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-steel text-[9px] tracking-[3px] uppercase">Scroll</span>
        <motion.div animate={{ y:[0,6,0] }} transition={{ duration:1.4, repeat:Infinity }}
          className="w-px h-8 bg-gradient-to-b from-gold/50 to-transparent"/>
      </motion.div>
    </section>
  )
}
