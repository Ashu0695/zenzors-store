import Link from 'next/link'
import { Instagram, Twitter, Youtube, Mail, Phone } from 'lucide-react'

const LINKS = {
  Shop:    [['Fine Jewelry','/products?category=fine-jewelry'],['School Bags','/products?category=school-bags'],['Cameras','/products?category=cameras'],['Lifestyle','/products?category=lifestyle'],['Sale','/products?filter=sale']],
  Account: [['My Orders','/account'],['Wishlist','/wishlist'],['My Profile','/account'],['Returns Policy','/#'],['Sign In','/auth']],
  Support: [['Help Center','/#'],['WhatsApp Us','/#'],['Privacy Policy','/#'],['Terms & Conditions','/#'],['GST Invoice','/account']],
}

export default function Footer() {
  return (
    <footer className="bg-[#080E1C] border-t border-blue-900/15 pt-16 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-14">

          {/* Brand */}
          <div className="col-span-2">
            <Link href="/">
              <span className="font-display text-2xl tracking-[7px] uppercase text-cream">
                ZEN<em className="gold-text not-italic">ZORS</em>
              </span>
            </Link>
            <p className="text-steel text-sm leading-relaxed mt-4 max-w-xs">
              Premium jewelry, handcrafted lifestyle accessories, and luxury bags — curated for those who value artistry in every detail.
            </p>
            <div className="flex gap-4 mt-6">
              {[Instagram,Twitter,Youtube].map((Icon,i) => (
                <a key={i} href="#" className="w-9 h-9 border border-blue-900/30 flex items-center justify-center text-steel hover:text-gold hover:border-gold/40 transition-colors">
                  <Icon size={14}/>
                </a>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              <a href="mailto:hello@zensors.in" className="flex items-center gap-2 text-steel text-xs hover:text-gold transition-colors">
                <Mail size={12}/> hello@zensors.in
              </a>
              <a href="tel:+919999999999" className="flex items-center gap-2 text-steel text-xs hover:text-gold transition-colors">
                <Phone size={12}/> +91 99999 99999
              </a>
            </div>
          </div>

          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[9px] tracking-[3px] uppercase text-gold mb-5 font-body">{title}</h4>
              <ul className="space-y-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-steel text-xs hover:text-cream transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-blue-900/15 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-steel/50">© 2025 Zenzors. All rights reserved. GST: 27XXXXX0000X1Z5</p>
          <div className="flex gap-2">
            {['UPI','Visa','Mastercard','COD','Razorpay'].map(p => (
              <span key={p} className="border border-blue-900/20 px-2.5 py-1 text-[8px] tracking-widest text-steel/50">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
