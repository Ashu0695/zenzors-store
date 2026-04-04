'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, Search, GridIcon, ListIcon } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/cart/CartSidebar'
import ProductCard from '@/components/product/ProductCard'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/types'
import { DUMMY_PRODUCTS, DUMMY_CATEGORIES } from '@/lib/dummyData'

const SORT_OPTIONS = [
  { label:'Featured',    value:'featured'   },
  { label:'Newest',      value:'newest'     },
  { label:'Price: Low',  value:'price_asc'  },
  { label:'Price: High', value:'price_desc' },
  { label:'Popular',     value:'popular'    },
]

function applyDummyFilters(params: {
  activeCat: string; search: string; maxPrice: number
  sort: string; isSale: boolean
}): Product[] {
  let out = [...DUMMY_PRODUCTS]

  // category filter
  if (params.activeCat) out = out.filter(p => p.category?.slug === params.activeCat)
  // sale filter
  if (params.isSale)    out = out.filter(p => p.compare_price != null)
  // price filter
  out = out.filter(p => p.price <= params.maxPrice)
  // search filter
  if (params.search) {
    const q = params.search.toLowerCase()
    out = out.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
  }
  // sort
  if (params.sort === 'newest')     out.sort((a,b) => b.created_at.localeCompare(a.created_at))
  else if (params.sort === 'price_asc')  out.sort((a,b) => a.price - b.price)
  else if (params.sort === 'price_desc') out.sort((a,b) => b.price - a.price)
  else if (params.sort === 'featured') out = out.filter(p => p.is_featured)
  // 'popular' → keep as is (rating desc in real DB; local just show all)

  return out
}

function ProductsContent() {
  const sp = useSearchParams()
  const [products,    setProducts]   = useState<Product[]>([])
  const [categories,  setCategories] = useState<Category[]>([])
  const [loading,     setLoading]    = useState(true)
  const [sort,        setSort]       = useState(sp.get('sort') || 'featured')
  const [filtersOpen, setFiltersOpen]= useState(false)
  const [activeCat,   setActiveCat]  = useState(sp.get('category') || '')
  const [maxPrice,    setMaxPrice]   = useState(100000)
  const [search,      setSearch]     = useState('')

  // Sync URL params when they change
  useEffect(() => {
    const cat  = sp.get('category') || ''
    const srt  = sp.get('sort')     || 'featured'
    setActiveCat(cat)
    setSort(srt)
  }, [sp])

  // Load categories once
  useEffect(() => {
    createClient().from('categories').select('*').then(
      ({ data }) => setCategories(data?.length ? data : DUMMY_CATEGORIES),
      ()         => setCategories(DUMMY_CATEGORIES)
    )
  }, [])

  // Load products whenever filters change
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const isSale = sp.get('filter') === 'sale'

      try {
        const sb = createClient()
        let q = sb.from('products')
          .select('*,category:categories(name,slug)')
          .eq('is_active', true)
          .lte('price', maxPrice)

        // sorting/filtering for real DB
        if (sort === 'newest')          q = q.order('created_at', { ascending:false })
        else if (sort === 'price_asc')  q = q.order('price',      { ascending:true  })
        else if (sort === 'price_desc') q = q.order('price',      { ascending:false })
        if (search)  q = q.ilike('name', `%${search}%`)
        if (isSale)  q = q.not('compare_price','is',null)

        const { data, error } = await q.limit(48)

        if (error || !data || data.length === 0) {
          setProducts(applyDummyFilters({ activeCat, search, maxPrice, sort, isSale }))
        } else {
          // Apply category filter client-side (Supabase FK join filter can be tricky)
          let final = data
          if (activeCat) final = final.filter((p: any) => p.category?.slug === activeCat)
          setProducts(final)
        }
      } catch {
        setProducts(applyDummyFilters({ activeCat, search, maxPrice, sort, isSale }))
      }
      setLoading(false)
    }
    load()
  }, [sort, activeCat, maxPrice, search, sp])

  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="pt-[72px] min-h-screen">
        {/* Page header */}
        <div className="border-b border-blue-900/20 bg-navy-mid/40">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-10">
            <div className="section-tag">Explore</div>
            <h1 className="section-title">
              {activeCat
                ? <>{categories.find(c=>c.slug===activeCat)?.name || 'Products'} </>
                : 'All '}
              <em className="gold-text not-italic">Collections</em>
            </h1>
            <p className="text-steel text-sm mt-2">
              {loading ? '...' : `${products.length} product${products.length!==1?'s':''} found`}
            </p>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-10">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Inline search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel"/>
                <input value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="bg-navy-card border border-blue-900/20 pl-9 pr-4 py-2.5 text-xs text-cream placeholder:text-steel/50 focus:outline-none focus:border-gold/40 w-48 transition-all focus:w-64"/>
              </div>
              {/* Filter toggle */}
              <button onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 border border-blue-900/20 px-4 py-2.5 text-steel text-xs tracking-widest uppercase hover:border-gold/40 hover:text-gold transition-colors">
                <SlidersHorizontal size={13}/> Filters
              </button>
              {/* Category pills */}
              <button onClick={() => setActiveCat('')}
                className={`px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${!activeCat ? 'bg-gold text-navy font-medium' : 'border border-blue-900/20 text-steel hover:text-cream'}`}>
                All
              </button>
              {categories.map(c => (
                <button key={c.slug} onClick={() => setActiveCat(activeCat===c.slug ? '' : c.slug)}
                  className={`px-4 py-2 text-[10px] tracking-widest uppercase transition-all ${
                    activeCat===c.slug ? 'bg-gold text-navy font-medium' : 'border border-blue-900/20 text-steel hover:text-cream'
                  }`}>
                  {c.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative flex-shrink-0">
              <select value={sort} onChange={e=>setSort(e.target.value)}
                className="appearance-none bg-navy-card border border-blue-900/20 px-4 py-2.5 pr-9 text-xs text-steel focus:outline-none focus:border-gold/40 cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel pointer-events-none"/>
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}
                className="overflow-hidden mb-8 border border-blue-900/20 bg-navy-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs tracking-widest uppercase text-gold">Price Filter</h3>
                  <button onClick={()=>setFiltersOpen(false)} className="text-steel hover:text-cream"><X size={14}/></button>
                </div>
                <p className="text-steel text-xs mb-2">Max Price: ₹{maxPrice.toLocaleString('en-IN')}</p>
                <input type="range" min={499} max={100000} step={500} value={maxPrice}
                  onChange={e=>setMaxPrice(+e.target.value)} className="w-full accent-gold max-w-xs"/>
                <div className="flex gap-3 mt-3">
                  {[999, 5000, 15000, 50000, 100000].map(v => (
                    <button key={v} onClick={() => setMaxPrice(v)}
                      className={`text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-all ${maxPrice===v?'border-gold text-gold bg-gold/10':'border-blue-900/20 text-steel hover:border-gold/40'}`}>
                      ₹{v >= 1000 ? (v/1000)+'k' : v}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
              {[...Array(8)].map((_,i) => <div key={i} className="skeleton h-[360px]"/>)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-3xl text-cream/20 mb-3">No products found</p>
              <p className="text-steel text-sm mb-6">Try adjusting your filters or search term</p>
              <button onClick={() => { setActiveCat(''); setSearch(''); setMaxPrice(100000) }}
                className="btn-gold">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
              {products.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ProductsPage() {
  return <Suspense><ProductsContent /></Suspense>
}
