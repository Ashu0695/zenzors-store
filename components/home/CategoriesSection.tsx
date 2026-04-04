'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight } from 'lucide-react'

// Slugs match Navbar + dummyData
const CATS = [
  { name:'Fine Jewelry', slug:'fine-jewelry', img:'/images/jewelry.png',  count:148, color:'rgba(201,168,76,0.15)' },
  { name:'School Bags',  slug:'school-bags',  img:'/images/bag.png',       count:64,  color:'rgba(37,99,235,0.15)'  },
  { name:'Bottles',      slug:'bottles',      img:'/images/bottle.png',    count:36,  color:'rgba(59,130,246,0.15)' },
  { name:'Cameras',      slug:'cameras',      img:'/images/camera.png',    count:28,  color:'rgba(201,168,76,0.10)' },
  { name:'Lifestyle',    slug:'lifestyle',    img:'/images/top.png',       count:92,  color:'rgba(96,165,250,0.12)' },
]

export default function CategoriesSection() {
  const [ref, inView] = useInView({ triggerOnce:true, threshold:0.08 })

  return (
    <section ref={ref} className="py-20 px-6 lg:px-14 max-w-[1440px] mx-auto">
      <motion.div initial={{ opacity:0,y:24 }} animate={inView?{ opacity:1,y:0 }:{}} transition={{ duration:0.6 }} className="mb-12">
        <div className="section-tag">Browse by Category</div>
        <h2 className="section-title">Shop Our <em className="gold-text not-italic">Collections</em></h2>
      </motion.div>

      {/* 2-row masonry: first card spans 2 rows, rest fill */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1"
        style={{ gridTemplateRows:'300px 300px' }}>

        {CATS.map((cat, i) => (
          <motion.div key={cat.slug}
            initial={{ opacity:0,scale:0.96 }} animate={inView?{ opacity:1,scale:1 }:{}}
            transition={{ duration:0.55, delay:i*0.09 }}
            className={`relative overflow-hidden cursor-pointer group ${i===0?'row-span-2':''}`}>

            <Link href={`/products?category=${cat.slug}`} className="block h-full">
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20"/>

              {/* Colour glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background:`radial-gradient(ellipse at 50% 30%,${cat.color},transparent 70%)` }}/>

              {/* Arrow badge */}
              <div className="absolute top-4 right-4 w-8 h-8 border border-white/20 flex items-center justify-center text-white/50 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-gold/60 group-hover:text-gold group-hover:bg-black/30">
                <ArrowRight size={13}/>
              </div>

              {/* Text info */}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <p className={`font-display font-light text-cream mb-1 leading-tight ${i===0?'text-3xl':'text-xl'}`}>{cat.name}</p>
                <p className="text-gold text-[9px] tracking-[2px] uppercase">{cat.count} Products</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
