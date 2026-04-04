import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'Zenzors — Premium Lifestyle', template: '%s | Zenzors' },
  description: 'Premium jewelry, handcrafted lifestyle accessories and luxury school bags — curated for those who value artistry.',
  keywords: ['jewelry','premium','lifestyle','bags','zensors','luxury'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{
          style: { background:'#111E35', color:'#EEF4FF', border:'1px solid rgba(201,168,76,0.3)', borderRadius:'0', fontFamily:'DM Sans, sans-serif', fontSize:'13px' },
          success: { iconTheme: { primary:'#C9A84C', secondary:'#111E35' } },
        }} />
      </body>
    </html>
  )
}
