'use client'
export function MarqueeBar() {
  const items = ['Free Shipping Over ₹999','Premium Quality Guaranteed','GST Invoices Included','Easy Returns 30 Days','UPI & Card Payments','Razorpay Secure Checkout']
  const doubled = [...items,...items]
  return (
    <div className="border-y border-blue-900/15 bg-blue-900/5 py-3.5 overflow-hidden">
      <div className="flex gap-16 w-max animate-marquee">
        {doubled.map((t,i) => (
          <span key={i} className="flex items-center gap-5 text-[10px] tracking-[3px] uppercase text-steel whitespace-nowrap">
            <span className="text-gold text-[6px]">◆</span>{t}
          </span>
        ))}
      </div>
    </div>
  )
}
