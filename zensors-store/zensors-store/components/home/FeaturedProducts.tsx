'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/product/ProductCard'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'
import { DUMMY_PRODUCTS } from '@/lib/dummyData'

const FILTERS = ['All', 'New Arrivals', 'Sale', 'Under ₹999']

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [active, setActive]     = useState('All')
  const [loading, setLoading]   = useState(true)
  const [ref, inView]           = useInView({ triggerOnce:true, threshold:0.05 })

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const sb = createClient()
        let q = sb.from('products').select('*,category:categories(name,slug)').eq('is_active',true).limit(8)
        if (active === 'New Arrivals')    q = q.order('created_at', { ascending:false })
        else if (active === 'Sale')        q = q.not('compare_price','is',null)
        else if (active === 'Under ₹999') q = q.lte('price',999)
        // 'All' → no extra filter

        const { data, error } = await q
        let finalData = data || []

        if (finalData.length === 0 || error) {
          let dummy = [...DUMMY_PRODUCTS]
          if (active === 'New Arrivals')    dummy.sort((a,b) => b.created_at.localeCompare(a.created_at))
          else if (active === 'Sale')       dummy = dummy.filter(p => p.compare_price !== null)
          else if (active === 'Under ₹999') dummy = dummy.filter(p => p.price <= 999)
          // 'All' → show everything
          finalData = dummy.slice(0, 8)
        }

        setProducts(finalData)
      } catch (err) {
        setProducts(DUMMY_PRODUCTS.slice(0, 8))
      }
      setLoading(false)
    }
    fetch()
  }, [active])

  return (
    <section ref={ref} className="py-20 bg-navy-mid/40">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10">
          <motion.div initial={{ opacity:0,y:20 }} animate={inView?{ opacity:1,y:0 }:{}} transition={{ duration:0.7 }}>
            <div className="section-tag">Our Products</div>
            <h2 className="section-title">Shop Our <em className="gold-text not-italic">Collection</em></h2>
          </motion.div>
          <Link href="/products" className="hidden lg:flex items-center gap-2 text-[10px] tracking-[2px] uppercase text-gold border-b border-gold/30 pb-0.5 hover:border-gold transition-colors">
            View All <ArrowRight size={11}/>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-1 mb-8 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActive(f)}
              className={`px-5 py-2 text-[10px] tracking-[1.5px] uppercase font-body transition-all duration-200 ${
                active===f ? 'bg-gradient-to-r from-[#1E4D8C] to-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'border border-blue-900/20 text-steel hover:border-blue-500/30 hover:text-cream'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
            {[...Array(8)].map((_,i) => <div key={i} className="skeleton h-[360px]"/>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
            {products.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        )}
      </div>
    </section>
  )
}
