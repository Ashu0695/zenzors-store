'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [mode,    setMode]    = useState<'login'|'register'>('login')
  const [email,   setEmail]   = useState('')
  const [password,setPassword]= useState('')
  const [name,    setName]    = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const router  = useRouter()
  const sb      = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        router.push('/account')
      } else {
        const { error } = await sb.auth.signUp({ email, password, options:{ data:{ full_name:name } } })
        if (error) throw error
        toast.success('Account created! Please check your email.')
        setMode('login')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -left-40 top-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]"/>
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-gold/6 blur-[100px]"/>
      </div>

      <motion.div initial={{ opacity:0,y:30 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.7 }}
        className="w-full max-w-md glass p-10 relative z-10">

        <Link href="/" className="block text-center mb-8">
          <span className="font-display text-2xl tracking-[7px] uppercase">ZEN<em className="gold-text not-italic">ZORS</em></span>
        </Link>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border border-blue-900/20">
          {(['login','register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-3 text-[10px] tracking-[2px] uppercase transition-all ${mode===m?'bg-gold text-navy font-medium':'text-steel hover:text-cream'}`}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:'auto' }} exit={{ opacity:0,height:0 }}>
                <label className="block text-[10px] tracking-widest uppercase text-steel mb-1.5">Full Name</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required
                  className="w-full bg-navy-card border border-blue-900/20 px-4 py-3 text-sm text-cream placeholder:text-steel/40 focus:outline-none focus:border-gold/50"/>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-steel mb-1.5">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" required
              className="w-full bg-navy-card border border-blue-900/20 px-4 py-3 text-sm text-cream placeholder:text-steel/40 focus:outline-none focus:border-gold/50"/>
          </div>

          <div>
            <label className="block text-[10px] tracking-widest uppercase text-steel mb-1.5">Password</label>
            <div className="relative">
              <input type={showPwd?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                className="w-full bg-navy-card border border-blue-900/20 px-4 py-3 pr-10 text-sm text-cream placeholder:text-steel/40 focus:outline-none focus:border-gold/50"/>
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-steel hover:text-cream">
                {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-gold w-full py-4 flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
            {loading ? <><Loader2 size={14} className="animate-spin"/>Processing...</> : mode==='login'?'Sign In':'Create Account'}
          </button>
        </form>

        <p className="text-center text-steel text-xs mt-6">
          {mode==='login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode==='login'?'register':'login')} className="text-gold hover:underline">
            {mode==='login' ? 'Register' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  )
}
