'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'

// Slugs MUST match DUMMY_CATEGORIES slugs in dummyData.ts
const LINKS = [
  { label:'Home',         href:'/'                       },
  { label:'Collections',  href:'/products', sub:[
    { label:'Fine Jewelry', href:'/products?category=fine-jewelry' },
    { label:'School Bags',  href:'/products?category=school-bags'  },
    { label:'Bottles',      href:'/products?category=bottles'      },
    { label:'Cameras',      href:'/products?category=cameras'      },
    { label:'Lifestyle',    href:'/products?category=lifestyle'     },
  ]},
  { label:'New Arrivals', href:'/products?sort=newest'   },
  { label:'Sale',         href:'/products?filter=sale'   },
  { label:'All Products', href:'/products'               },
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [activeSub, setActiveSub] = useState<string|null>(null)
  const [mounted,   setMounted]   = useState(false)
  const [userName,  setUserName]  = useState<string|null>(null)
  const count      = useCartStore(s => s.count())
  const wishCount  = useWishlist(s => s.items.length)
  const toggleCart = useCartStore(s => s.toggleCart)

  useEffect(() => {
    setMounted(true)
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    fn()

    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().auth.getUser().then(({ data }) => {
        if (data.user) {
          createClient().from('profiles').select('full_name').eq('id', data.user.id).single()
            .then(({data: p}) => setUserName(p?.full_name?.split(' ')[0] || 'User'))
        }
      })
    })

    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -80 }} animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          mounted && scrolled
            ? 'bg-[#070E1D]/98 backdrop-blur-xl border-b border-blue-900/30 shadow-xl shadow-black/30'
            : 'bg-[#070E1D]/90 backdrop-blur-md border-b border-blue-900/20'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/">
            <motion.span whileHover={{ scale:1.02 }} className="font-display text-2xl font-light tracking-[7px] uppercase text-cream">
              ZEN<em className="gold-text not-italic">ZORS</em>
            </motion.span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex gap-9">
            {LINKS.map(link => (
              <li key={link.label} className="relative"
                  onMouseEnter={() => link.sub && setActiveSub(link.label)}
                  onMouseLeave={() => setActiveSub(null)}>
                <Link href={link.href}
                  className="flex items-center gap-1 text-[11px] tracking-[2px] uppercase text-cream/65 hover:text-cream transition-colors">
                  {link.label}
                  {link.sub && <ChevronDown size={10} className={`transition-transform duration-200 ${activeSub===link.label?'rotate-180':''}`} />}
                </Link>
                <AnimatePresence>
                  {link.sub && activeSub === link.label && (
                    <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:8 }}
                      transition={{ duration:0.18 }}
                      className="absolute top-full left-0 mt-3 w-48 bg-navy-mid/98 backdrop-blur-lg border border-blue-900/30 py-2 z-50 shadow-2xl">
                      {link.sub.map(s => (
                        <Link key={s.label} href={s.href}
                          className="block px-5 py-2.5 text-[10px] tracking-[1.5px] uppercase text-cream/55 hover:text-gold hover:bg-white/5 transition-colors">
                          {s.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>

          {/* Icons */}
          <div className="flex items-center gap-5">
            <Link href="/search" className="hidden lg:block text-cream/55 hover:text-cream transition-colors"><Search size={18}/></Link>
            {userName ? (
              <Link href="/account" className="hidden lg:flex items-center gap-2 text-[10px] tracking-widest uppercase text-cream/70 hover:text-cream transition-colors">
                <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/30 font-medium">{userName[0].toUpperCase()}</span>
                {userName}
              </Link>
            ) : (
              <Link href="/auth" className="hidden lg:flex items-center gap-1.5 text-[10px] tracking-[1.5px] uppercase text-cream/55 hover:text-cream transition-colors border border-blue-900/40 px-3 py-1.5 rounded-sm">
                <User size={12}/> Sign In
              </Link>
            )}
            <Link href="/wishlist" className="relative hidden lg:block text-cream/55 hover:text-cream transition-colors">
              <Heart size={18}/>
              {mounted && wishCount>0 && <span className="absolute -top-1.5 -right-1.5 bg-gold text-navy text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">{wishCount}</span>}
            </Link>
            <button onClick={toggleCart} className="relative text-cream/55 hover:text-cream transition-colors">
              <ShoppingBag size={18}/>
              {mounted && count>0 && (
                <motion.span key={count} initial={{ scale:1.5 }} animate={{ scale:1 }}
                  className="absolute -top-1.5 -right-1.5 bg-gold text-navy text-[9px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </motion.span>
              )}
            </button>
            <button className="lg:hidden text-cream/70" onClick={() => setMenuOpen(true)}><Menu size={22}/></button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setMenuOpen(false)}/>
            <motion.div initial={{ x:'100%' }} animate={{ x:0 }} exit={{ x:'100%' }}
              transition={{ type:'spring', damping:28, stiffness:280 }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-navy-mid border-l border-blue-900/30 z-50 p-8 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <span className="font-display text-xl tracking-widest gold-text">ZENSORS</span>
                <button onClick={() => setMenuOpen(false)} className="text-cream/60"><X size={20}/></button>
              </div>
              <ul className="space-y-6 flex-1">
                {LINKS.map((link, i) => (
                  <motion.li key={link.label} initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*0.07 }}>
                    <Link href={link.href} onClick={() => setMenuOpen(false)}
                      className="text-sm tracking-[2px] uppercase text-cream/65 hover:text-gold transition-colors">
                      {link.label}
                    </Link>
                    {link.sub && (
                      <ul className="mt-2 ml-3 space-y-2">
                        {link.sub.map(s => (
                          <li key={s.label}>
                            <Link href={s.href} onClick={() => setMenuOpen(false)}
                              className="text-[10px] tracking-widest uppercase text-cream/40 hover:text-gold transition-colors">
                              — {s.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
              </ul>
              <div className="flex gap-6 pt-8 border-t border-white/10">
                <Link href={userName ? "/account" : "/auth"}  onClick={() => setMenuOpen(false)}>
                  {userName ? (
                    <div className="flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/30 font-medium text-xs">{userName[0].toUpperCase()}</span> <span className="text-xs text-cream/70 uppercase tracking-widest">{userName}</span></div>
                  ) : <User size={20} className="text-cream/55"/>}
                </Link>
                <Link href="/wishlist" onClick={() => setMenuOpen(false)}><Heart size={20} className="text-cream/55"/></Link>
                <Link href="/search"   onClick={() => setMenuOpen(false)}><Search size={20} className="text-cream/55"/></Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
