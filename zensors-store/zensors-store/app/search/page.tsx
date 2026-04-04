'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/cart/CartSidebar'
import ProductCard from '@/components/product/ProductCard'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/types'
import { DUMMY_PRODUCTS } from '@/lib/dummyData'

function SearchContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [query,    setQuery]    = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<Product[]>([])
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    if (!query) return
    const search = async () => {
      setLoading(true)
      try {
        const { data, error } = await createClient().from('products')
          .select('*,category:categories(name,slug)').eq('is_active',true)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
          .limit(24)
        
        if (error || !data || data.length === 0) {
          const q = query.toLowerCase()
          setProducts(DUMMY_PRODUCTS.filter(p => 
            p.name.toLowerCase().includes(q) || 
            p.description.toLowerCase().includes(q) ||
            p.tags.some(t => t.toLowerCase().includes(q))
          ))
        } else {
          setProducts(data || [])
        }
      } catch (err) {
        const q = query.toLowerCase()
        setProducts(DUMMY_PRODUCTS.filter(p => 
          p.name.toLowerCase().includes(q) || 
          p.description.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        ))
      }
      setLoading(false)
    }
    search()
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <><Navbar/><CartSidebar/>
      <main className="pt-[72px] min-h-screen">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-16">
          <div className="max-w-xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel"/>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jewelry, bags, bottles..."
                className="w-full bg-navy-card border border-blue-900/20 pl-12 pr-4 py-4 text-cream placeholder:text-steel/40 focus:outline-none focus:border-gold/50 text-sm"/>
            </form>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
              {[...Array(8)].map((_,i) => <div key={i} className="skeleton h-[360px]"/>)}
            </div>
          ) : query ? (
            <>
              <p className="text-steel text-sm mb-6">{products.length} results for "{query}"</p>
              {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="font-display text-3xl text-cream/20">No results found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-0.5">
                  {products.map(p => <ProductCard key={p.id} product={p}/>)}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="font-display text-3xl text-cream/20">Search for products</p>
            </div>
          )}
        </div>
      </main>
      <Footer/>
    </>
  )
}

export default function SearchPage() {
  return <Suspense><SearchContent/></Suspense>
}
