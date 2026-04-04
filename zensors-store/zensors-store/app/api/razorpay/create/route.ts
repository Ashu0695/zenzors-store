import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const keyId     = process.env.RAZORPAY_KEY_ID     || ''
  const keySecret = process.env.RAZORPAY_KEY_SECRET  || ''

  // ── DEMO MODE: no real credentials configured ─────────────────────────
  // If credentials are missing or still placeholders, return a fake orderId
  // so the frontend can simulate the payment flow without crashing.
  const isDemo = !keyId || !keySecret
    || keyId.startsWith('dummy') || keyId.startsWith('rzp_test_DUMMY')

  if (isDemo) {
    return NextResponse.json({
      orderId: `demo_order_${Date.now()}`,
      demo: true,
    })
  }

  // ── REAL MODE ─────────────────────────────────────────────────────────
  try {
    const Razorpay = (await import('razorpay')).default
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    const { amount } = await req.json()
    const order = await razorpay.orders.create({
      amount:   Math.round(amount * 100),
      currency: 'INR',
      receipt:  `zensors_${Date.now()}`,
    })
    return NextResponse.json({ orderId: order.id, demo: false })
  } catch (err) {
    console.error('Razorpay order creation failed:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
