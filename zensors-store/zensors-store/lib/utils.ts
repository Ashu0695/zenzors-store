import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n)

export const getDiscount = (price: number, compare: number) =>
  Math.round(((compare - price) / compare) * 100)

export const slugify = (t: string) =>
  t.toLowerCase().replace(/\s+/g,'-').replace(/[^\w-]+/g,'')
