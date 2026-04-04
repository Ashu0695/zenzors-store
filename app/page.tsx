export const dynamic = 'force-dynamic'

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartSidebar from '@/components/cart/CartSidebar'
import HeroSection from '@/components/home/HeroSection'
import { MarqueeBar } from '@/components/home/MarqueeBar'
import CategoriesSection from '@/components/home/CategoriesSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import PromoSection from '@/components/home/PromoSection'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const sb = createClient()
  // Fetch the latest product that has is_featured set to true
  const { data: featured } = await sb.from('products')
    .select('*,category:categories(name)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main>
        <HeroSection featured={featured} />
        <MarqueeBar />
        <CategoriesSection />
        <FeaturedProducts />
        <PromoSection />
      </main>
      <Footer />
    </>
  )
}
