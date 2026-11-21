import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
  try {
    const headersList = await headers()
    const origin = headersList.get("origin") || "http://localhost:3000"
    
    let vendorEmail = ""
    try {
      const body = await req.json()
      if (body && body.vendorEmail) {
        vendorEmail = body.vendorEmail
      }
    } catch {
      vendorEmail = ""
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      const simulatedSessionId = `cs_simulated_${Date.now()}`
      const returnUrl = `${origin}/vendor/upgrade?success=true&session_id=${simulatedSessionId}`
      
      const acceptHeader = headersList.get("accept") || ""
      if (acceptHeader.includes("text/html")) {
        return NextResponse.redirect(returnUrl, 303)
      }
      return NextResponse.json({ url: returnUrl, sessionId: simulatedSessionId })
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PizzaHub Vendor Premium Membership",
              description: "Unlimited artisan menu slots, priority wood-fired dispatch, and gold crown badge",
            },
            unit_amount: 2900,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: vendorEmail || undefined,
      metadata: {
        vendorEmail,
        tier: "premium",
      },
      success_url: `${origin}/vendor/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vendor/upgrade?cancelled=true`,
    })

    const acceptHeader = headersList.get("accept") || ""
    if (acceptHeader.includes("text/html")) {
      return NextResponse.redirect(session.url as string, 303)
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Failed to create checkout session")
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
